class EchoProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'delayTime',
        defaultValue: 0.1,
        minValue: 0,
        maxValue: 1
      },
      {
        name: 'feedback',
        defaultValue: 0.3,
        minValue: 0,
        maxValue: 1
      },
      {
        name: 'wetLevel',
        defaultValue: 0.3,
        minValue: 0,
        maxValue: 1
      },
      {
        name: 'dryLevel',
        defaultValue: 0.7,
        minValue: 0,
        maxValue: 1
      },
      {
        name: 'silenceThreshold',
        defaultValue: 0.01,
        minValue: 0,
        maxValue: 1
      },
      {
        name: 'silenceFrames',
        defaultValue: 10,
        minValue: 1,
        maxValue: 100
      }
    ];
  }

  constructor() {
    super();
    this.bufferSize = 48000;
    this.delayBuffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.sampleRate = 48000;
    this.isPlaying = false;
    this.silenceCounter = 0;
    this.isVoiceActive = false;
    this.lastVoiceLevel = 0;
    this.voiceLevelThreshold = 0.1;
    this.voiceLevelHistory = new Float32Array(10);
    this.voiceLevelIndex = 0;
    this.playedAudioHistory = new Float32Array(10);
    this.playedAudioIndex = 0;
    this.lastPlayedAudioLevel = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !input[0]) return true;

    const inputChannel = input[0];
    const outputChannel = output[0];
    
    const delayTime = parameters.delayTime[0];
    const feedback = parameters.feedback[0];
    const wetLevel = parameters.wetLevel[0];
    const dryLevel = parameters.dryLevel[0];
    const silenceThreshold = parameters.silenceThreshold[0];
    const silenceFrames = parameters.silenceFrames[0];
    
    // Проверяем уровень входного сигнала
    let maxLevel = 0;
    for (let i = 0; i < inputChannel.length; i++) {
      maxLevel = Math.max(maxLevel, Math.abs(inputChannel[i]));
    }

    // Обновляем историю уровней
    this.voiceLevelHistory[this.voiceLevelIndex] = maxLevel;
    this.voiceLevelIndex = (this.voiceLevelIndex + 1) % this.voiceLevelHistory.length;

    // Вычисляем средний уровень голоса
    let avgVoiceLevel = 0;
    for (let i = 0; i < this.voiceLevelHistory.length; i++) {
      avgVoiceLevel += this.voiceLevelHistory[i];
    }
    avgVoiceLevel /= this.voiceLevelHistory.length;

    // Определяем, воспроизводится ли сейчас аудио
    if (maxLevel > silenceThreshold) {
      this.silenceCounter = 0;
      this.isPlaying = true;
      this.playedAudioHistory[this.playedAudioIndex] = maxLevel;
      this.playedAudioIndex = (this.playedAudioIndex + 1) % this.playedAudioHistory.length;
    } else {
      this.silenceCounter++;
      if (this.silenceCounter >= silenceFrames) {
        this.isPlaying = false;
      }
    }

    // Вычисляем средний уровень воспроизводимого аудио
    let avgPlayedAudioLevel = 0;
    for (let i = 0; i < this.playedAudioHistory.length; i++) {
      avgPlayedAudioLevel += this.playedAudioHistory[i];
    }
    avgPlayedAudioLevel /= this.playedAudioHistory.length;

    // Определяем, является ли вход микрофонным
    const isMicrophoneInput = this.isVoiceActive && 
                            avgVoiceLevel > this.voiceLevelThreshold && 
                            !this.isPlaying &&
                            Math.abs(avgVoiceLevel - avgPlayedAudioLevel) > 0.05; // Разница между уровнями должна быть значительной
    
    for (let i = 0; i < inputChannel.length; i++) {
      if (this.isPlaying) {
        // Если воспроизводится аудио, пропускаем сигнал
        outputChannel[i] = inputChannel[i];
      } else if (isMicrophoneInput) {
        // Применяем эхо-компенсацию только к микрофонному входу
        const readIndex = (this.writeIndex - Math.floor(delayTime * this.sampleRate) + this.bufferSize) % this.bufferSize;
        const delayedSample = this.delayBuffer[readIndex];
        const echoSample = inputChannel[i] + delayedSample * feedback;
        this.delayBuffer[this.writeIndex] = echoSample;
        outputChannel[i] = inputChannel[i] * dryLevel - echoSample * wetLevel;
      } else {
        // Для всех остальных случаев просто пропускаем сигнал
        outputChannel[i] = inputChannel[i];
      }
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
    }
    
    return true;
  }
}

registerProcessor('echo-processor', EchoProcessor); 
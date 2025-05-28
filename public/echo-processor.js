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
    this.lastProcessTime = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !input[0]) return true;

    const inputChannel = input[0];
    const outputChannel = output[0];
    
    // Получаем параметры
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

    // Определяем, воспроизводится ли сейчас аудио
    if (maxLevel > silenceThreshold) {
      this.silenceCounter = 0;
      this.isPlaying = true;
    } else {
      this.silenceCounter++;
      if (this.silenceCounter >= silenceFrames) {
        this.isPlaying = false;
      }
    }
    
    for (let i = 0; i < inputChannel.length; i++) {
      if (this.isPlaying && !this.isVoiceActive) {
        // Если воспроизводится аудио и нет голоса, пропускаем сигнал
        outputChannel[i] = inputChannel[i];
      } else {
        // Применяем эхо-компенсацию
        const readIndex = (this.writeIndex - Math.floor(delayTime * this.sampleRate) + this.bufferSize) % this.bufferSize;
        const delayedSample = this.delayBuffer[readIndex];
        const echoSample = inputChannel[i] + delayedSample * feedback;
        this.delayBuffer[this.writeIndex] = echoSample;
        outputChannel[i] = inputChannel[i] * dryLevel - echoSample * wetLevel;
      }
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
    }
    
    return true;
  }
}

registerProcessor('echo-processor', EchoProcessor); 
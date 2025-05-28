import { MicVAD } from "@ricky0123/vad-web"

interface AudioProcessorOptions {
  sampleRate?: number;
  onAudioData?: (data: string, voicestop: boolean) => void; // Изменили тип на string для base64
  onError?: (error: Error) => void;
  onLevel?: (level: number) => void; // Новый колбэк
  onVoiceActivity?: (isActive: boolean) => void; // Новый колбэк для VAD
  vadThreshold?: number; // Порог для определения голоса
  vadSilenceFrames?: number; // Количество тихих фреймов для определения тишины
  audioQueue?: any;
}

export class AudioWorkletManager {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private echoNode: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private options: Required<AudioProcessorOptions>;
  private isVoiceActive: boolean = false;
  private vad: MicVAD | null = null;
  private voicestopFlag: boolean = false;

  constructor(options: AudioProcessorOptions = {}) {
    this.options = {
      sampleRate: 16000,
      onAudioData: () => {},
      onError: () => {},
      onLevel: () => {},
      onVoiceActivity: () => {},
      vadThreshold: 0.003, // Порог по умолчанию
      vadSilenceFrames: 10, // 10 тихих фреймов для определения тишины
      audioQueue: {},
      ...options
    };
  }

  async initialize(stream: MediaStream): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      await this.audioContext.audioWorklet.addModule('audio-processor.js');
      await this.audioContext.audioWorklet.addModule('echo-processor.js');
      
      // Настройки аудио с шумоподавлением
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        googEchoCancellation: true,
        googNoiseSuppression: true,
        googAutoGainControl: true,
        volume: 0.1, // Сильно уменьшаем чувствительность микрофона
        sampleRate: 16000, // Фиксированная частота дискретизации
        channelCount: 1 // Используем только один канал
      };

      const processedStream = stream.clone();
      const audioTracks = processedStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.applyConstraints(audioConstraints);
      });

      // Создаем цепочку обработки аудио
      this.source = this.audioContext.createMediaStreamSource(processedStream);

      // Добавляем анализатор для определения уровня шума
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      // Добавляем фильтр для шумоподавления
      const noiseGate = this.audioContext.createDynamicsCompressor();
      noiseGate.threshold.value = -30; // Еще выше порог
      noiseGate.knee.value = 20;
      noiseGate.ratio.value = 30; // Увеличиваем соотношение
      noiseGate.attack.value = 0;
      noiseGate.release.value = 0.25;

      // Добавляем фильтр для подавления низкочастотного шума
      const lowpassFilter = this.audioContext.createBiquadFilter();
      lowpassFilter.type = 'lowpass';
      lowpassFilter.frequency.value = 2500; // Еще ниже частота
      lowpassFilter.Q.value = 0.7;

      // Добавляем фильтр высоких частот
      const highpassFilter = this.audioContext.createBiquadFilter();
      highpassFilter.type = 'highpass';
      highpassFilter.frequency.value = 300; // Отрезаем низкие частоты
      highpassFilter.Q.value = 0.7;

      // Добавляем контроль громкости
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.05;

      // Initialize VAD с еще более высокими порогами
      this.vad = await MicVAD.new({
        onSpeechStart: () => {
          console.log('Speech started');
          this.isVoiceActive = true;
          this.options.onVoiceActivity(true);
          if (this.options.audioQueue?.current) {
            this.options.audioQueue.current.stop();
            this.voicestopFlag = true;
          }
          this.echoNode?.port.postMessage({ isVoiceActive: true });
        },
        onSpeechEnd: () => {
          console.log('Speech ended');
          this.isVoiceActive = false;
          this.options.onVoiceActivity(false);
          this.echoNode?.port.postMessage({ isVoiceActive: false });
        },
        stream: processedStream,
        positiveSpeechThreshold: 0.95, // Очень высокий порог начала речи
        negativeSpeechThreshold: 0.9, // Очень высокий порог окончания речи
        redemptionFrames: 15, // Больше фреймов для подтверждения
        preSpeechPadFrames: 4
      });

      await this.vad.start();
      
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
      
      // Базовые настройки echo-processor
      this.echoNode = new AudioWorkletNode(this.audioContext, 'echo-processor', {
        parameterData: {
          delayTime: 0.1,
          feedback: 0.15, // Еще меньше обратная связь
          wetLevel: 0.15, // Еще меньше уровень эффекта
          dryLevel: 0.85, // Еще больше уровень прямого сигнала
          silenceThreshold: 0.02, // Еще выше порог тишины
          silenceFrames: 20 // Еще больше фреймов тишины
        }
      });

      // Собираем цепочку обработки
      this.source
        .connect(analyser)
        .connect(noiseGate)
        .connect(highpassFilter)
        .connect(lowpassFilter)
        .connect(gainNode)
        .connect(this.workletNode);
      
      this.workletNode.connect(this.echoNode);
      this.echoNode.connect(this.audioContext.destination);

      // Добавляем обработчик сообщений
      this.workletNode.port.onmessage = (event) => {
        const inputData = event.data;
        const audioData16kHz = this.resampleTo16kHz(inputData, this.audioContext!.sampleRate);
        const base64Data = this.float32ToBase64(audioData16kHz);
        
        if (this.isVoiceActive) {
          this.options.onAudioData(base64Data, this.voicestopFlag);
          if (this.voicestopFlag) this.voicestopFlag = false;
        }

        const level = this.calculateLevel(audioData16kHz);
        this.options.onLevel(level);
      };
    } catch (error) {
      this.options.onError(error as Error);
      throw error;
    }
  }

  private float32ToBase64(audioData: Float32Array): string {
    const uint8Array = new Uint8Array(audioData.buffer);
    let binaryString = '';
    
    for (let i = 0; i < uint8Array.length; i++) {
      const byte = uint8Array[i];
      if (byte !== undefined) {
        binaryString += String.fromCharCode(byte);
      }
    }
    
    return btoa(binaryString);
  }

  private resampleTo16kHz(audioData: Float32Array, origSampleRate: number): Float32Array {
    const targetLength = Math.round(audioData.length * (this.options.sampleRate / origSampleRate));
    const resampledData = new Float32Array(targetLength);
    
    const springFactor = (audioData.length - 1) / (targetLength - 1);
    resampledData[0] = audioData[0] ?? 0;
    resampledData[targetLength - 1] = audioData[audioData.length - 1] ?? 0;
    
    for (let i = 1; i < targetLength - 1; i++) {
      const index = i * springFactor;
      const leftIndex = Math.floor(index);
      const rightIndex = Math.ceil(index);
      const fraction = index - leftIndex;
      
      const leftValue = audioData[leftIndex] ?? 0;
      const rightValue = audioData[rightIndex] ?? 0;
      resampledData[i] = leftValue + (rightValue - leftValue) * fraction;
    }
    
    return resampledData;
  }

  private calculateLevel(audioData?: Float32Array): number {
    if (typeof audioData === 'undefined') return 0;
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i]! * audioData[i]!;
    }
    return Math.sqrt(sum / audioData.length); // RMS
  }

  async start(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  stop(): void {
    this.vad?.pause();
    this.workletNode?.disconnect();
    this.echoNode?.disconnect();
    this.source?.disconnect();
    this.audioContext?.close();
    this.audioContext = null;
    this.workletNode = null;
    this.echoNode = null;
    this.source = null;
    this.vad = null;
  }
} 
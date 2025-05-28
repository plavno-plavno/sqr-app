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
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isUserSpeaking: boolean = false;
  private silenceThreshold: number = 0.01;
  private speechThreshold: number = 0.05;
  private lastLevel: number = 0;
  private silenceFrames: number = 0;
  private readonly SILENCE_FRAMES_THRESHOLD = 10;

  constructor(options: AudioProcessorOptions = {}) {
    this.options = {
      sampleRate: 16000,
      onAudioData: () => {},
      onError: () => {},
      onLevel: () => {},
      onVoiceActivity: () => {},
      vadThreshold: 0.003,
      vadSilenceFrames: 10,
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
        volume: 0.3,
        sampleRate: 16000,
        channelCount: 1,
        latency: 0.1
      };

      const processedStream = stream.clone();
      const audioTracks = processedStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.applyConstraints(audioConstraints);
      });

      // Создаем цепочку обработки аудио
      this.source = this.audioContext.createMediaStreamSource(processedStream);

      // Создаем анализатор для определения уровня звука
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 1024;
      this.analyserNode.smoothingTimeConstant = 0.3;

      // Создаем узел усиления для адаптивной чувствительности
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.05; // Начальное значение - низкая чувствительность

      // Добавляем фильтр для шумоподавления
      const noiseGate = this.audioContext.createDynamicsCompressor();
      noiseGate.threshold.value = -40;
      noiseGate.knee.value = 15;
      noiseGate.ratio.value = 20;
      noiseGate.attack.value = 0;
      noiseGate.release.value = 0.25;

      // Добавляем фильтр для подавления низкочастотного шума
      const lowpassFilter = this.audioContext.createBiquadFilter();
      lowpassFilter.type = 'lowpass';
      lowpassFilter.frequency.value = 3000;
      lowpassFilter.Q.value = 0.7;

      // Добавляем фильтр высоких частот
      const highpassFilter = this.audioContext.createBiquadFilter();
      highpassFilter.type = 'highpass';
      highpassFilter.frequency.value = 200;
      highpassFilter.Q.value = 0.7;

      // Initialize VAD
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
        positiveSpeechThreshold: 0.7,
        negativeSpeechThreshold: 0.6,
        redemptionFrames: 8,
        preSpeechPadFrames: 2
      });

      await this.vad.start();
      
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
      
      // Базовые настройки echo-processor
      this.echoNode = new AudioWorkletNode(this.audioContext, 'echo-processor', {
        parameterData: {
          delayTime: 0.1,
          feedback: 0.2,
          wetLevel: 0.2,
          dryLevel: 0.8,
          silenceThreshold: 0.015,
          silenceFrames: 15
        }
      });

      // Собираем цепочку обработки
      this.source
        .connect(this.analyserNode)
        .connect(noiseGate)
        .connect(highpassFilter)
        .connect(lowpassFilter)
        .connect(this.gainNode)
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
      };

      // Запускаем мониторинг уровня звука
      this.startLevelMonitoring();

    } catch (error) {
      this.options.onError(error as Error);
      throw error;
    }
  }

  private startLevelMonitoring() {
    if (!this.analyserNode || !this.gainNode || !this.audioContext) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    const updateLevel = () => {
      if (!this.analyserNode || !this.gainNode || !this.audioContext) return;

      this.analyserNode.getByteTimeDomainData(dataArray);
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const sample = (dataArray[i]! - 128) / 128;
        sumSquares += sample * sample;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);
      this.lastLevel = rms;

      // Адаптивная чувствительность
      if (rms > this.speechThreshold) {
        // Пользователь начал говорить
        this.isUserSpeaking = true;
        this.silenceFrames = 0;
        this.gainNode.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.01); // Быстрое включение
      } else if (rms < this.silenceThreshold) {
        // Возможно тишина
        this.silenceFrames++;
        if (this.silenceFrames > this.SILENCE_FRAMES_THRESHOLD) {
          this.isUserSpeaking = false;
          this.gainNode.gain.setTargetAtTime(0.05, this.audioContext.currentTime, 0.1); // Плавное выключение
        }
      } else {
        // Промежуточный уровень
        this.silenceFrames = 0;
      }

      this.options.onLevel(rms);
      requestAnimationFrame(updateLevel);
    };

    requestAnimationFrame(updateLevel);
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
    this.gainNode?.disconnect();
    this.analyserNode?.disconnect();
    this.audioContext?.close();
    this.audioContext = null;
    this.workletNode = null;
    this.echoNode = null;
    this.source = null;
    this.vad = null;
    this.gainNode = null;
    this.analyserNode = null;
  }
} 
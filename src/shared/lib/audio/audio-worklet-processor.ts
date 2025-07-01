import { MicVAD } from "@ricky0123/vad-web"

interface AudioProcessorOptions {
  sampleRate?: number;
  onAudioData?: (data: string, voicestop: boolean) => void; // Изменили тип на string для base64
  onError?: (error: Error) => void;
  onLevel?: (level: number) => void; // Новый колбэк
  onVoiceActivity?: (isActive: boolean) => void; // Новый колбэк для VAD
  vadThreshold?: number; // Порог для определения голоса
  vadSilenceFrames?: number; // Количество тихих фреймов для определения тишины
  // eslint-disable-next-line
  audioQueue?: any;
}
export class AudioWorkletManager {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private echoNode: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private options: Required<AudioProcessorOptions>;
  public isVoiceActive: boolean = false;
  private vad: MicVAD | null = null;
  private voicestopFlag: boolean = false;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private silenceThreshold: number = 0.015;
  private speechThreshold: number = 0.03;
  // private lastLevel: number = 0;
  private silenceFrames: number = 0;
  private readonly SILENCE_FRAMES_THRESHOLD = 10;
  private playbackBuffer: Float32Array | null = null;
  private micBuffer: Float32Array | null = null;
  private readonly BUFFER_SIZE = 1024;
  private readonly ECHO_THRESHOLD = 0.85; // Повышаем порог схожести
  private readonly CROSS_CORRELATION_WINDOW = 500;
  private readonly MIN_AMPLITUDE_THRESHOLD = 0.02; // Повышаем порог амплитуды
  // private readonly MAX_DELAY = 1000;
  // private readonly MIN_SIMILARITY_DURATION = 0.2; // Увеличиваем время проверки
  // private similarityCounter: number = 0;
  // private lastSimilarityTime: number = 0;
  private mediaStream: MediaStream | null = null;
  private isPlaying: boolean = false;
  private playbackHistory: Float32Array[] = [];
  private readonly HISTORY_SIZE = 10;
  private readonly MIN_ECHO_DURATION = 0.1; // Минимальная длительность эха
  private echoStartTime: number = 0;
  private isEchoDetected: boolean = false;
  private speechStartTime: number = 0;
  public speechDuration: number = 0;
  public isUserFinished: boolean | null = null;
  private speechTimer: ReturnType<typeof setInterval> | null = null;
  private isMuted: boolean = false;

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
      await this.audioContext.audioWorklet.addModule('/audio-processor.js');
      await this.audioContext.audioWorklet.addModule('/echo-processor.js');
      
      // Настройки аудио с шумоподавлением
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        googEchoCancellation: true,
        googNoiseSuppression: true,
        googAutoGainControl: true,
        volume: 1.0,
        sampleRate: 16000,
        channelCount: 1,
        latency: 0.1
      };

      this.mediaStream = stream;
      const audioTracks = this.mediaStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.applyConstraints(audioConstraints);
      });

      // Создаем цепочку обработки аудио
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Создаем анализатор для определения уровня звука
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = this.BUFFER_SIZE;
      this.analyserNode.smoothingTimeConstant = 0.3;

      // Создаем узел усиления для адаптивной чувствительности
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;

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
          this.speechStartTime = Date.now();
          this.speechDuration = 0;
          this.isUserFinished = null;
          this.speechTimer = setInterval(() => {
            this.speechDuration = (Date.now() - this.speechStartTime) / 1000;
          }, 100);
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
          this.isUserFinished = true;
          if (this.speechTimer) {
            clearInterval(this.speechTimer);
            this.speechTimer = null;
            this.speechDuration = 0;
          }
          console.log(`Speech duration: ${this.speechDuration.toFixed(1)}s`);
          this.options.onVoiceActivity(false);
          this.echoNode?.port.postMessage({ isVoiceActive: false });
        },
        stream: this.mediaStream,
        positiveSpeechThreshold: 0.8,
        negativeSpeechThreshold: 0.8,
        redemptionFrames: 15, // ~1.5 seconds of silence tolerance
        preSpeechPadFrames: 4,
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
        
        // Отправляем данные только если пользователь активно говорит и микрофон не заглушен
        if (this.isVoiceActive && !this.isMuted) {
          this.options.onAudioData(base64Data, this.voicestopFlag);
          if (this.voicestopFlag) this.voicestopFlag = false;
        }

        // Обработка эха только если есть воспроизведение и микрофон не заглушен
        if (this.isPlaying && this.playbackBuffer && !this.isMuted) {
          this.micBuffer = new Float32Array(inputData);
          const similarity = this.compareBuffers(this.playbackBuffer, this.micBuffer);
          if (similarity > this.ECHO_THRESHOLD) {
            this.gainNode!.gain.setTargetAtTime(0.1, this.audioContext!.currentTime, 0.01);
          } else {
            this.gainNode!.gain.setTargetAtTime(1.0, this.audioContext!.currentTime, 0.01);
          }
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

      // Если микрофон заглушен, пропускаем обработку, но продолжаем цикл
      if (this.isMuted) {
        this.options.onLevel(0); // Отправляем нулевой уровень для анимации
        requestAnimationFrame(updateLevel);
        return;
      }

      this.analyserNode.getByteTimeDomainData(dataArray);
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const sample = (dataArray[i]! - 128) / 128;
        sumSquares += sample * sample;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);
      // this.lastLevel = rms;

      // Адаптивная чувствительность
      if (rms > this.speechThreshold) {
        // Пользователь начал говорить
        // this.isUserSpeaking = true;
        this.silenceFrames = 0;
        this.gainNode.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.01);
      } else if (rms < this.silenceThreshold) {
        // Возможно тишина
        this.silenceFrames++;
        if (this.silenceFrames > this.SILENCE_FRAMES_THRESHOLD) {
          // this.isUserSpeaking = false;
          this.gainNode.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.1);
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
    try {
      const uint8Array = new Uint8Array(audioData.buffer);
      let binaryString = '';
      
      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        if (byte !== undefined) {
          binaryString += String.fromCharCode(byte);
        }
      }
      
      return btoa(binaryString);
    } catch (error) {
      console.error('Error converting to base64:', error);
      return '';
    }
  }

  private resampleTo16kHz(audioData: Float32Array, origSampleRate: number): Float32Array {
    try {
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
    } catch (error) {
      console.error('Error resampling audio:', error);
      return new Float32Array(0);
    }
  }

  async start(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  stop(): void {
    if (this.speechTimer) {
      clearInterval(this.speechTimer);
    }
    this.mediaStream?.getAudioTracks().forEach(track => {
      track.stop();
    });
    this.vad?.pause();
    this.workletNode?.disconnect();
    this.echoNode?.disconnect();
    this.source?.disconnect();
    this.gainNode?.disconnect();
    this.analyserNode?.disconnect();
    this.audioContext?.close();
    this.mediaStream = null;
    this.audioContext = null;
    this.workletNode = null;
    this.echoNode = null;
    this.source = null;
    this.vad = null;
    this.gainNode = null;
    this.analyserNode = null;
  }

  private compareBuffers(playback: Float32Array, mic: Float32Array): number {
    // Нормализуем буферы
    const normalizedPlayback = this.normalizeBuffer(playback);
    const normalizedMic = this.normalizeBuffer(mic);

    // Проверяем амплитуды
    const playbackAmplitude = this.getAmplitude(normalizedPlayback);
    const micAmplitude = this.getAmplitude(normalizedMic);
    
    if (playbackAmplitude < this.MIN_AMPLITUDE_THRESHOLD || micAmplitude < this.MIN_AMPLITUDE_THRESHOLD) {
      this.resetEchoDetection();
      return 0;
    }

    // Проверяем соотношение амплитуд
    const amplitudeRatio = Math.min(playbackAmplitude, micAmplitude) / Math.max(playbackAmplitude, micAmplitude);
    if (amplitudeRatio < 0.3) { // Если амплитуды сильно различаются, это не эхо
      this.resetEchoDetection();
      return 0;
    }

    // Ищем задержку и схожесть для каждого буфера в истории
    let maxSimilarity = 0;
    let bestDelay = 0;

    // Добавляем текущий буфер в историю
    this.playbackHistory.push(normalizedPlayback);
    if (this.playbackHistory.length > this.HISTORY_SIZE) {
      this.playbackHistory.shift();
    }

    // Проверяем каждый буфер в истории
    for (const historyBuffer of this.playbackHistory) {
      const { delay, similarity } = this.findDelayAndSimilarity(historyBuffer, normalizedMic);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestDelay = delay;
      }
    }

    const currentTime = this.audioContext?.currentTime ?? 0;

    // Проверяем длительность эха
    if (maxSimilarity > this.ECHO_THRESHOLD) {
      if (!this.isEchoDetected) {
        this.echoStartTime = currentTime;
        this.isEchoDetected = true;
      }
      
      // Проверяем, прошло ли достаточно времени
      if (currentTime - this.echoStartTime >= this.MIN_ECHO_DURATION) {
        console.log('Echo detected:', maxSimilarity, 'Delay:', bestDelay);
        return maxSimilarity;
      }
    } else {
      this.resetEchoDetection();
    }

    return 0;
  }

  private resetEchoDetection() {
    this.isEchoDetected = false;
    this.echoStartTime = 0;
  }

  private findDelayAndSimilarity(playback: Float32Array, mic: Float32Array): { delay: number, similarity: number } {
    let maxCorrelation = -1;
    let bestDelay = 0;
    
    // Ищем задержку через кросс-корреляцию
    for (let delay = 0; delay < this.CROSS_CORRELATION_WINDOW; delay++) {
      let correlation = 0;
      let count = 0;
      
      for (let i = 0; i < mic.length - delay; i++) {
        correlation += mic[i]! * playback[i + delay]!;
        count++;
      }
      
      correlation /= count;
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestDelay = delay;
      }
    }

    // Если корреляция слишком слабая, считаем что это не эхо
    if (maxCorrelation < 0.4) { // Повышаем порог корреляции
      return { delay: 0, similarity: 0 };
    }

    // Вычисляем схожесть с учетом задержки
    let sumSquaredDiff = 0;
    let sumSquaredPlayback = 0;
    let validSamples = 0;
    
    for (let i = 0; i < mic.length; i++) {
      const playbackIndex = i + bestDelay;
      if (playbackIndex < playback.length) {
        const diff = mic[i]! - playback[playbackIndex]!;
        sumSquaredDiff += diff * diff;
        sumSquaredPlayback += playback[playbackIndex]! * playback[playbackIndex]!;
        validSamples++;
      }
    }
    
    if (validSamples < this.BUFFER_SIZE * 0.5) {
      return { delay: 0, similarity: 0 };
    }

    const similarity = 1 - Math.sqrt(sumSquaredDiff / sumSquaredPlayback);
    return { delay: bestDelay, similarity };
  }

  private normalizeBuffer(buffer: Float32Array): Float32Array {
    const max = Math.max(...buffer.map(Math.abs));
    if (max === 0) return buffer;
    return buffer.map(x => x / max);
  }

  private getAmplitude(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += Math.abs(buffer[i]!);
    }
    return sum / buffer.length;
  }

  public updatePlaybackBuffer(buffer: Float32Array) {
    this.playbackBuffer = buffer;
    this.isPlaying = true;
  }

  public stopPlayback() {
    this.isPlaying = false;
    this.playbackBuffer = null;
    this.playbackHistory = [];
    this.resetEchoDetection();
  }

  public toggleMute(mute?: boolean): void {
    if (!this.gainNode || !this.audioContext || !this.vad) return;
    
    this.isMuted = mute ?? !this.isMuted;

    if (this.isMuted) {
      this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.01);
      this.vad.pause();
    } else {
      this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.gainNode.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.01);
      this.vad.start();
    }
  }
} 
import { MicVAD } from "@ricky0123/vad-web"

interface AudioProcessorOptions {
  sampleRate?: number;
  onAudioData?: (data: string, voicestop: boolean) => void;
  onError?: (error: Error) => void;
  onLevel?: (level: number) => void;
  onVoiceActivity?: (isActive: boolean) => void;
  vadThreshold?: number;
  vadSilenceFrames?: number;
  onStopAudioQueue?: (() => void) | null;
}

export class AudioWorkletManager {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private options: Required<AudioProcessorOptions>;
  public isVoiceActive: boolean = false;
  private vad: MicVAD | null = null;
  private voicestopFlag: boolean = false;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private silenceThreshold: number = 0.015;
  private speechThreshold: number = 0.03;
  private silenceFrames: number = 0;
  private readonly SILENCE_FRAMES_THRESHOLD = 10;
  private readonly BUFFER_SIZE = 1024;
  private mediaStream: MediaStream | null = null;
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
      onStopAudioQueue: null,
      ...options
    };
  }

  async initialize(): Promise<void> {
    try {
      this.audioContext = new AudioContext();
      await this.audioContext.audioWorklet.addModule('/audio-processor.js');
      
      // Audio constraints with built-in echo cancellation
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

      // Get user media with proper constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints
      });

      // Create audio processing chain
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create analyser for sound level detection
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = this.BUFFER_SIZE;
      this.analyserNode.smoothingTimeConstant = 0.3;

      // Create gain node for adaptive sensitivity
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;

      // Add noise gate filter
      const noiseGate = this.audioContext.createDynamicsCompressor();
      noiseGate.threshold.value = -40;
      noiseGate.knee.value = 15;
      noiseGate.ratio.value = 20;
      noiseGate.attack.value = 0;
      noiseGate.release.value = 0.25;

      // Add low-pass filter for noise suppression
      const lowpassFilter = this.audioContext.createBiquadFilter();
      lowpassFilter.type = 'lowpass';
      lowpassFilter.frequency.value = 3000;
      lowpassFilter.Q.value = 0.7;

      // Add high-pass filter
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
          if (this.options.onStopAudioQueue) {
            this.options.onStopAudioQueue();
            this.voicestopFlag = true;
          }
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
        },
        stream: this.mediaStream,
        positiveSpeechThreshold: 0.8,
        negativeSpeechThreshold: 0.8,
        redemptionFrames: 15, // ~1.5 seconds of silence tolerance
        preSpeechPadFrames: 4,
      });

      await this.vad.start();
      
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');

      // Build processing chain
      this.source
        .connect(this.analyserNode)
        .connect(noiseGate)
        .connect(highpassFilter)
        .connect(lowpassFilter)
        .connect(this.gainNode)
        .connect(this.workletNode);
      
      this.workletNode.connect(this.audioContext.destination);

      // Add message handler
      this.workletNode.port.onmessage = (event) => {
        const inputData = event.data;
        const audioData16kHz = this.resampleTo16kHz(inputData, this.audioContext!.sampleRate);
        const base64Data = this.float32ToBase64(audioData16kHz);
        
        // Send data only if user is actively speaking and microphone is not muted
        if (this.isVoiceActive && !this.isMuted) {
          this.options.onAudioData(base64Data, this.voicestopFlag);
          if (this.voicestopFlag) this.voicestopFlag = false;
        }
      };

      // Start level monitoring
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

      // If microphone is muted, skip processing but continue the cycle
      if (this.isMuted) {
        this.options.onLevel(0);
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

      // Adaptive sensitivity
      if (rms > this.speechThreshold) {
        this.silenceFrames = 0;
        this.gainNode.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.01);
      } else if (rms < this.silenceThreshold) {
        this.silenceFrames++;
        if (this.silenceFrames > this.SILENCE_FRAMES_THRESHOLD) {
          this.gainNode.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.1);
        }
      } else {
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
    this.source?.disconnect();
    this.gainNode?.disconnect();
    this.analyserNode?.disconnect();
    this.audioContext?.close();
    this.mediaStream = null;
    this.audioContext = null;
    this.workletNode = null;
    this.source = null;
    this.vad = null;
    this.gainNode = null;
    this.analyserNode = null;
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
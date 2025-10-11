import { MicVAD } from "@ricky0123/vad-web";
import type { SpeechProbabilities } from "@ricky0123/vad-web/dist/models";
import { DynamicVoicePauseDetector1 } from "./dynamic-voice-pause-detector1";

interface AudioProcessorOptions {
  sampleRate?: number;
  onAudioData?: (data: string, voicestop: boolean) => void;
  onError?: (error: Error) => void;
  onVoiceLevel?: (level: number) => void;
  onVoiceEnd?: () => void;
  onStopAudioQueue?: (() => void) | null;
}

export class AudioWorkletManager {
  private readonly SILENCE_FRAMES_THRESHOLD = 10;
  private readonly BUFFER_SIZE = 1024;

  // VAD frame size in V5 - 512 samples. sampleRate = 16000
  // 1 frame = 0.032 ms
  private readonly PRE_SPEECH_FRAMES = 15; // 0.48ms
  private readonly MIN_SPEECH_FRAMES = 3; // 0.096ms
  private readonly SPEECH_PROBABILITY = 0.2;
  private readonly AGENT_ACTIVE_SPEECH_PROBABILITY = 0.7;
  private readonly SILENCE_PROBABILITY = 0.5;
  private readonly MIN_PAUSE_MS = 2500;
  private readonly MAX_PAUSE_MS = 3500;

  private audioContext: AudioContext | null = null;
  private voicePauseDetector: DynamicVoicePauseDetector1 | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private options: Required<AudioProcessorOptions>;
  public isVoiceActive: boolean = false;
  public vad: MicVAD | null = null;
  private voicestopFlag: boolean = false;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private silenceThreshold: number = 0.015;
  private speechThreshold: number = 0.03;
  private silenceFrames: number = 0;
  private mediaStream: MediaStream | null = null;
  private isMuted: boolean = false;
  private agentAudioLevel: number = 0;
  private preSpeechBuffer: Float32Array[] = [];
  private speechFrameCount: number = 0;

  constructor(options: AudioProcessorOptions = {}) {
    this.options = {
      sampleRate: 16000,
      onAudioData: () => {},
      onError: () => {},
      onVoiceLevel: () => {},
      onVoiceEnd: () => {},
      onStopAudioQueue: null,
      ...options,
    };
  }

  async initialize(): Promise<void> {
    try {
      this.audioContext = new AudioContext({
        sampleRate: this.options.sampleRate,
      });
      await this.audioContext.audioWorklet.addModule("/audio-processor.js");

      // Audio constraints with built-in echo cancellation
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        googEchoCancellation: true,
        googNoiseSuppression: true,
        googAutoGainControl: true,
        volume: 1.0,
        sampleRate: this.options.sampleRate,
        channelCount: 1,
        latency: 0.1,
      };

      // Get user media with proper constraints
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
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
      lowpassFilter.type = "lowpass";
      lowpassFilter.frequency.value = 3000;
      lowpassFilter.Q.value = 0.7;

      // Add high-pass filter
      const highpassFilter = this.audioContext.createBiquadFilter();
      highpassFilter.type = "highpass";
      highpassFilter.frequency.value = 200;
      highpassFilter.Q.value = 0.7;

      // Initialize smart pause detector
      this.voicePauseDetector = new DynamicVoicePauseDetector1({
        confidenceThreshold: this.SILENCE_PROBABILITY,
        minPauseMs: this.MIN_PAUSE_MS,
        maxPauseMs: this.MAX_PAUSE_MS,
        onAgentCanSpeak: () => this.onAgentCanSpeak(),
      });
      this.vad = await MicVAD.new({
        onFrameProcessed: (probabilities, frame) =>
          this.onFrameProcessed(probabilities, frame),
        model: "v5",
        getStream: async () => this.mediaStream!,
        baseAssetPath: "/vad/",
        onnxWASMBasePath: "/vad/",
      });

      await this.vad.start();

      this.workletNode = new AudioWorkletNode(
        this.audioContext,
        "audio-processor"
      );

      // Build processing chain
      this.source
        .connect(this.analyserNode)
 //       .connect(noiseGate)
 //       .connect(highpassFilter)
 //       .connect(lowpassFilter)
        .connect(this.gainNode)
        .connect(this.workletNode);

      this.workletNode.connect(this.audioContext.destination);

      // Add message handler
      this.workletNode.port.onmessage = (event) => {
        const base64Data = this.float32ToBase64(event.data);

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

  private onAgentCanSpeak() {
    console.log("=========================SPEECH END");
    this.isVoiceActive = false;
    this.speechFrameCount = 0;
    this.options.onVoiceEnd();
  }

  private onFrameProcessed(
    probabilities: SpeechProbabilities,
    frame: Float32Array<ArrayBufferLike>
  ) {
    // Добавляем фрейм в буфер pre-speech
    if (!this.isVoiceActive) {
      this.preSpeechBuffer.push(frame);
      if (this.preSpeechBuffer.length > this.PRE_SPEECH_FRAMES)
        this.preSpeechBuffer.shift(); // Удаляем старый фрейм
    }

    this.voicePauseDetector?.addProbabilities(
      probabilities.isSpeech,
      probabilities.notSpeech
    );

    // Если агент сейчас отвечает, то увеличиваем порог для восприятия голоса
    const speechProbability =
      this.agentAudioLevel > 0
        ? this.AGENT_ACTIVE_SPEECH_PROBABILITY
        : this.SPEECH_PROBABILITY;

    if (probabilities.isSpeech > speechProbability) {
      this.speechFrameCount++;

      // Начинаем запись только если накопили достаточно речевых фреймов подряд
      if (this.speechFrameCount < this.MIN_SPEECH_FRAMES) return;
      console.log("SPEECH START======================");

      this.isVoiceActive = true;

      // Отправляем буферизованные pre-speech фреймы
      this.preSpeechBuffer.forEach((bufferedFrame) => {
        const base64Data = this.float32ToBase64(bufferedFrame);
        this.options.onAudioData(base64Data, false);
      });
      this.preSpeechBuffer = [];

      if (this.options.onStopAudioQueue) {
        this.options.onStopAudioQueue();
        this.voicestopFlag = true;
      }
    } else {
      this.speechFrameCount = 0;
    }
  }

  private startLevelMonitoring() {
    if (!this.analyserNode || !this.gainNode || !this.audioContext) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    const updateLevel = () => {
      if (!this.analyserNode || !this.gainNode || !this.audioContext) return;

      // If microphone is muted, skip processing but continue the cycle
      if (this.isMuted) {
        this.options.onVoiceLevel(0);
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
        this.gainNode.gain.setTargetAtTime(
          1.0,
          this.audioContext.currentTime,
          0.01
        );
      } else if (rms < this.silenceThreshold) {
        this.silenceFrames++;
        if (this.silenceFrames > this.SILENCE_FRAMES_THRESHOLD) {
          this.gainNode.gain.setTargetAtTime(
            1.0,
            this.audioContext.currentTime,
            0.1
          );
        }
      } else {
        this.silenceFrames = 0;
      }

      this.options.onVoiceLevel(rms);
      requestAnimationFrame(updateLevel);
    };

    requestAnimationFrame(updateLevel);
  }

  private float32ToBase64(audioData: Float32Array): string {
    try {
      const uint8Array = new Uint8Array(audioData.buffer);
      let binaryString = "";

      for (let i = 0; i < uint8Array.length; i++) {
        const byte = uint8Array[i];
        if (byte !== undefined) {
          binaryString += String.fromCharCode(byte);
        }
      }

      return btoa(binaryString);
    } catch (error) {
      console.error("Error converting to base64:", error);
      return "";
    }
  }

  // @ts-expect-error - Method preserved for future use
  private resampleTo16kHz(
    audioData: Float32Array,
    origSampleRate: number
  ): Float32Array {
    try {
      const targetLength = Math.round(
        audioData.length * (this.options.sampleRate / origSampleRate)
      );
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
      console.error("Error resampling audio:", error);
      return new Float32Array(0);
    }
  }

  async start(): Promise<void> {
    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  async stop(): Promise<void> {
    this.mediaStream?.getAudioTracks().forEach((track) => {
      track.stop();
    });
    this.vad?.pause();
    this.workletNode?.disconnect();
    this.source?.disconnect();
    this.gainNode?.disconnect();
    this.analyserNode?.disconnect();
    await this.audioContext?.close();
    this.isVoiceActive = false;
    this.speechFrameCount = 0;
    this.preSpeechBuffer = [];
    this.mediaStream = null;
    this.audioContext = null;
    this.workletNode = null;
    this.source = null;
    this.vad = null;
    this.voicePauseDetector = null;
    this.gainNode = null;
    this.analyserNode = null;
  }

  public updateAudioLevel(level: number): void {
    this.agentAudioLevel = level;
  }

  public toggleMute(mute?: boolean): void {
    if (!this.gainNode || !this.audioContext || !this.vad) return;

    this.isMuted = mute ?? !this.isMuted;

    if (this.isMuted) {
      this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.gainNode.gain.setTargetAtTime(
        0,
        this.audioContext.currentTime,
        0.01
      );
      this.vad.pause();
    } else {
      this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.gainNode.gain.setTargetAtTime(
        1.0,
        this.audioContext.currentTime,
        0.01
      );
      this.vad.start();
    }
  }
}

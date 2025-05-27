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
        },
        onSpeechEnd: () => {
          console.log('Speech ended');
          this.isVoiceActive = false;
          this.options.onVoiceActivity(false);
        },
        stream: stream // Передаем поток напрямую в VAD
      });

      // Start VAD
      await this.vad.start();
      
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
      
      this.workletNode.port.onmessage = (event) => {
        const inputData = event.data;
        const audioData16kHz = this.resampleTo16kHz(inputData, this.audioContext!.sampleRate);
        const base64Data = this.float32ToBase64(audioData16kHz);
        
        // Отправляем аудио только когда есть голос
        if (this.isVoiceActive) {
          this.options.onAudioData(base64Data, this.voicestopFlag);
          if (this.voicestopFlag) this.voicestopFlag = false;
        }

        const level = this.calculateLevel(audioData16kHz);
        this.options.onLevel(level);
      };
      
      this.source.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);
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
    this.source?.disconnect();
    this.audioContext?.close();
    this.audioContext = null;
    this.workletNode = null;
    this.source = null;
    this.vad = null;
  }
} 
import type { AudioResponse } from "@/shared/model/websocket";
import type { AudioWorkletManager } from "./audio-worklet-processor";

export interface AudioQueueManagerOptions {
  onAudioLevel?: (level: number) => void;
  audioWorkletManager?: AudioWorkletManager | null;
  onPlaybackComplete?: () => void;
}

export class AudioQueueManager {
  private audioContext: AudioContext | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;

  private options: AudioQueueManagerOptions;
  private isWorkletReady: boolean = false;
  private isPlaying: boolean = false;

  public audioLevel: number = 0;

  constructor(options: AudioQueueManagerOptions = {}) {
    this.options = options;
  }

  public async initializeAudioContext() {
    if (typeof AudioContext === "undefined") return;

    try {
      this.audioContext = new AudioContext({ sampleRate: 22050 });
      await this.initializeWorklet();
    } catch (error) {
      console.error("Failed to initialize AudioContext:", error);
    }
  }

  private async initializeWorklet() {
    if (!this.audioContext) return;

    try {
      await this.audioContext.audioWorklet.addModule("/player-processor.js");
      this.audioWorkletNode = new AudioWorkletNode(
        this.audioContext,
        "player-processor"
      );

      // Создаем узлы для обработки звука используя сохраненную ссылку
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;

      // Подключаем граф: worklet -> gain -> analyser -> destination
      this.audioWorkletNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);

      // Слушаем сообщения от воркера (уровень громкости и завершение воспроизведения)
      this.audioWorkletNode.port.onmessage = (event) => {
        if (event.data.type === "level" && this.options.onAudioLevel) {
          this.audioLevel = event.data.value;
          this.options.onAudioLevel(event.data.value);
        }

        // Обработка завершения воспроизведения
        if (event.data.type === "playbackComplete") {
          if (this.isPlaying && this.options.audioWorkletManager) {
            console.log(`[Audio Queue] ✅ Audio playback COMPLETED for stream_id: ${event.data.stream_id}`);
            this.isPlaying = false;
            this.options.audioWorkletManager.restoreSensitivity();
          }

          // Вызываем callback если установлен
          this.options.onPlaybackComplete?.();
        }
      };

      this.isWorkletReady = true;
    } catch (error) {
      console.error("Failed to initialize AudioWorklet:", error);
    }
  }

  private async ensureAudioContextRunning(): Promise<boolean> {
    if (!this.audioContext) return false;

    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error("Failed to resume AudioContext:", error);
        return false;
      }
    }

    return this.audioContext.state === "running";
  }

  private decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private async convertMP3ToBuffer(audioBuffer: ArrayBuffer) {
    try {
      const decodedAudio = await this.audioContext!.decodeAudioData(
        audioBuffer.slice(0)
      );
      // Конвертируем AudioBuffer в Float32Array для передачи в worklet
      const channelData = decodedAudio.getChannelData(0);
      const float32Buffer = new ArrayBuffer(channelData.length * 4);
      new Float32Array(float32Buffer).set(channelData);

      return { float32Buffer, sampleRate: decodedAudio.sampleRate };
    } catch (error) {
      console.error("Failed to decode MP3 audio:", error);
      return null;
    }
  }

  public async addToQueue(audioData: AudioResponse) {
    // Убеждаемся что контекст активен
    if (!(await this.ensureAudioContextRunning())) return;
    if (!this.isWorkletReady || !this.audioWorkletNode) return;

    const message = {
      type: "addChunk",
      data: {
        stream_id: audioData.stream_id,
        chunk_id: audioData.chunk_id,
        audioBuffer: null as null | ArrayBuffer,
        format: audioData.format || "raw",
        sampleRate: audioData.format === "mp3" ? 44100 : audioData.sampleRate,
      },
    };

    // Обработка терминального чанка
    if (audioData.chunk_id === -1) {
      console.log(`[Audio Queue] 🏁 Terminal chunk received for stream_id: ${audioData.stream_id}`);
      this.audioWorkletNode.port.postMessage(message);
      // Не устанавливаем isPlaying = false здесь!
      // AudioWorklet сообщит нам когда воспроизведение реально завершится
      return;
    }

    // Если нет данных и это не завершающий чанк, то не обрабатываем это аудио
    if (!audioData.audio) return;

    // Reduce microphone sensitivity when first audio chunk starts playing
    if (!this.isPlaying && this.options.audioWorkletManager) {
      console.log(`[Audio Queue] 🎵 Audio playback STARTED for stream_id: ${audioData.stream_id}, chunk_id: ${audioData.chunk_id}`);
      this.isPlaying = true;
      this.options.audioWorkletManager.reduceSensitivity();
    }

    const audioBuffer = this.decodeBase64ToArrayBuffer(audioData.audio);

    if (audioData.format === "mp3") {
      const data = await this.convertMP3ToBuffer(audioBuffer);
      if (!data?.float32Buffer || !data?.sampleRate) return;
      message.data.audioBuffer = data?.float32Buffer;
      message.data.sampleRate = data?.sampleRate;
    } else {
      message.data.audioBuffer = audioBuffer;
    }

    // Отправляем данные в AudioWorklet (используем transferable для эффективности)
    this.audioWorkletNode.port.postMessage(message, [message.data.audioBuffer]);
  }

  public setAudioWorkletManager(audioWorkletManager: AudioWorkletManager | null): void {
    this.options.audioWorkletManager = audioWorkletManager;
  }

  public stop() {
    if (this.audioWorkletNode)
      this.audioWorkletNode.port.postMessage({ type: "stop" });

    // Restore microphone sensitivity when audio is stopped
    if (this.isPlaying && this.options.audioWorkletManager) {
      console.log('[Audio Queue] 🛑 Audio playback STOPPED manually');
      this.isPlaying = false;
      this.options.audioWorkletManager.restoreSensitivity();
    }
  }

  public async destroy() {
    this.stop();

    // Отключаем все узлы
    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    // Закрываем AudioContext и ждем завершения
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
      } catch (error) {
        console.error(`Error closing AudioContext:`, error);
      }
      this.audioContext = null;
    }

    this.isWorkletReady = false;
    this.options.onAudioLevel?.(0);
    this.audioLevel = 0;
  }
}

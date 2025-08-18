import type { AudioResponse } from "@/shared/model/websocket";

export interface AudioQueueManagerOptions {
  onLevel?: (level: number) => void;
}

export class AudioQueueManager {
  private audioContext: AudioContext | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;

  private options: AudioQueueManagerOptions;
  private isWorkletReady: boolean = false;

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
    const audioContext = this.audioContext;
    if (!audioContext) return;

    try {
      await audioContext.audioWorklet.addModule("/pcm-player-processor.js");
      this.audioWorkletNode = new AudioWorkletNode(
        audioContext,
        "pcm-player-processor"
      );

      // Создаем узлы для обработки звука используя сохраненную ссылку
      this.gainNode = audioContext.createGain();
      this.gainNode.gain.setValueAtTime(1.0, audioContext.currentTime);

      this.analyserNode = audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;

      // Подключаем граф: worklet -> gain -> analyser -> destination
      this.audioWorkletNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(audioContext.destination);

      // Слушаем сообщения от воркера (уровень громкости)
      this.audioWorkletNode.port.onmessage = (event) => {
        if (event.data.type === "level" && this.options.onLevel) {
          this.options.onLevel(event.data.value);
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
      },
    };

    if (audioData.chunk_id === -1) {
      this.audioWorkletNode.port.postMessage(message);
      return;
    }

    // Декодируем base64 в главном потоке
    const audioBuffer = this.decodeBase64ToArrayBuffer(audioData.audio);
    message.data.audioBuffer = audioBuffer;

    // Отправляем данные в AudioWorklet (используем transferable для эффективности)
    this.audioWorkletNode.port.postMessage(message, [audioBuffer]);
  }

  public stop() {
    if (this.audioWorkletNode)
      this.audioWorkletNode.port.postMessage({ type: "stop" });
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
    this.options.onLevel?.(0);
  }
}

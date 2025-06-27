import { AudioWorkletManager } from ".";

export class AudioQueueManager {
  private audioQueue: string[] = [];
  private isPlaying: boolean = false;
  private audioContext: AudioContext | null = null;
  private onLevel?: (level: number) => void;

  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentGainNode: GainNode | null = null;
  private currentAnalyserNode: AnalyserNode | null = null;
  private audioWorkletManager: AudioWorkletManager | null = null;

  private fadeDuration: number = 0.7;
  private isStopping: boolean = false;

  private audioWorkletNode: AudioWorkletNode | null = null;

  constructor(
    onLevel?: (level: number) => void,
    audioWorkletManager?: AudioWorkletManager
  ) {
    this.onLevel = onLevel;
    this.audioWorkletManager = audioWorkletManager || null;
    if (typeof AudioContext !== "undefined") {
      this.audioContext = new AudioContext();
      this.audioContext.onstatechange = () => {};
    }
  }

  private async initializeAudioWorklet() {
    if (!this.audioContext || this.audioWorkletNode) return;

    try {
      await this.audioContext.audioWorklet.addModule('/audio-buffer-processor.js');
      
      this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-buffer-processor', {
        processorOptions: { bufferSize: 8192 }
      });

      this.audioWorkletNode.port.onmessage = (event) => {
        if (event.data.type === 'audioData' && this.audioWorkletManager) {
          const bufferCopy = event.data.buffer;
          this.audioWorkletManager.updatePlaybackBuffer(bufferCopy);
        }
      };
    } catch (error) {
      console.error('Failed to initialize AudioWorklet:', error);
    }
  }

  public addToQueue(audioData: string) {
    if (!this.audioContext) {
      return;
    }
    if (this.isStopping) {
      this.audioQueue = [];
      this.audioQueue.push(audioData);
    } else {
      this.audioQueue.push(audioData);
      if (!this.isPlaying) {
        this.playNext();
      }
    }
  }

  private async playNext() {
    if (this.isStopping) return;

    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.disconnectAndClearNodes();
      return;
    }

    if (!this.audioContext) {
      this.audioQueue = [];
      this.isPlaying = false;
      return;
    }

    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.error("Failed to resume AudioContext:", e);
        this.audioQueue = [];
        this.isPlaying = false;
        this.disconnectAndClearNodes();
        this.onLevel?.(0);
        return;
      }
    } else if (this.audioContext.state === "closed") {
      this.audioQueue = [];
      this.isPlaying = false;
      this.disconnectAndClearNodes();
      return;
    }

    this.isPlaying = true;
    const audioData = this.audioQueue.shift();

    if (!audioData) {
      this.playNext();
      return;
    }

    try {
      const arrayBuffer = await this.decodeBase64Audio(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      await this.initializeAudioWorklet();

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;

      this.currentSourceNode = source;
      this.currentGainNode = gainNode;
      this.currentAnalyserNode = analyser;

      // Подключение аудио графа
      source.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(this.audioContext.destination);
      if (this.audioWorkletNode) {
        gainNode.connect(this.audioWorkletNode);
        this.audioWorkletNode.connect(this.audioContext.destination);
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = (currentAnalyser: AnalyserNode) => {
        if (
          !this.isPlaying ||
          this.currentAnalyserNode !== currentAnalyser ||
          !this.audioContext ||
          this.audioContext.state !== "running"
        ) {
          this.onLevel?.(0);
          return;
        }

        currentAnalyser.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const sample = (dataArray[i]! - 128) / 128;
          sumSquares += sample * sample;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);

        if (this.onLevel) this.onLevel(rms);

        requestAnimationFrame(() => updateLevel(currentAnalyser));
      };

      if (this.onLevel) {
        requestAnimationFrame(() => updateLevel(analyser));
      }

      source.onended = () => {
        if (this.audioWorkletNode) {
          this.audioWorkletNode.disconnect();
        }
        if (this.audioWorkletManager) {
          this.audioWorkletManager.stopPlayback();
        }
        if (!this.isStopping) {
          this.disconnectAndClearNodes();
          this.playNext();
        }
      };

      source.start(0);
    } catch (error) {
      console.error("Error playing audio segment:", error);
      this.disconnectAndClearNodes();
      this.playNext();
    }
  }

  public stop() {
    this.isStopping = true;
    this.audioQueue = [];

    if (
      this.currentGainNode &&
      this.audioContext &&
      this.audioContext.state === "running"
    ) {
      const currentTime = this.audioContext.currentTime;
      const stopTime = currentTime + this.fadeDuration;

      this.currentGainNode.gain.cancelScheduledValues(currentTime);
      this.currentGainNode.gain.linearRampToValueAtTime(
        this.currentGainNode.gain.value,
        currentTime
      );
      this.currentGainNode.gain.linearRampToValueAtTime(0, stopTime);

      setTimeout(() => {
        this.isPlaying = false;
        this.disconnectAndClearNodes();
        this.onLevel?.(0);
        this.isStopping = false;

        if (this.audioQueue.length > 0) {
          this.playNext();
        }
      }, this.fadeDuration * 1000);
    } else {
      this.isPlaying = false;
      this.disconnectAndClearNodes();
      this.onLevel?.(0);
      this.isStopping = false;

      if (this.audioQueue.length > 0) {
        this.playNext();
      }
    }
  }

  private async decodeBase64Audio(base64: string): Promise<ArrayBuffer> {
    const base64WithoutHeader = base64.split(",")[1] || base64;
    const byteCharacters = atob(base64WithoutHeader);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers).buffer;
  }

  private disconnectAndClearNodes() {
    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
    }
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch (e) {
        console.warn("Error stopping/disconnecting source:", e);
      }
    }
    if (this.currentGainNode) {
      try {
        this.currentGainNode.disconnect();
      } catch (e) {
        console.warn("Error disconnecting gain:", e);
      }
    }
    if (this.currentAnalyserNode) {
      try {
        this.currentAnalyserNode.disconnect();
      } catch (e) {
        console.warn("Error disconnecting analyser:", e);
      }
    }

    this.audioWorkletNode = null;
    this.currentSourceNode = null;
    this.currentGainNode = null;
    this.currentAnalyserNode = null;
  }

  public destroy() {
    this.stop();
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext
        .close()
        .then(() => {
          this.audioContext = null;
        })
        .catch((error) => {
          console.error("Error closing AudioContext during destroy:", error);
          this.audioContext = null;
        });
    } else {
      this.audioContext = null;
    }
    this.onLevel?.(0);
  }
}


import type { AudioResponse } from "@/shared/model/websocket";

export interface AudioQueueManagerOptions {
  onLevel?: (level: number) => void;
}

export class AudioQueueManager {
  private audioStreams: Map<number, Map<number, AudioResponse>> = new Map();
  private currentStreamId: number | null = null;
  private currentChunkId: number = 0;
  private streamTimeouts: Map<number, NodeJS.Timeout> = new Map();
  private streamEndMap: Map<number, number> = new Map();
  private readonly STREAM_TIMEOUT_MS = 1000;

  private isPlaying: boolean = false;
  private audioContext: AudioContext | null = null;
  private options: AudioQueueManagerOptions;

  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentGainNode: GainNode | null = null;
  private currentAnalyserNode: AnalyserNode | null = null;

  private fadeDuration: number = 0.7;
  private isStopping: boolean = false;

  constructor(options: AudioQueueManagerOptions = {}) {
    this.options = options;
    if (typeof AudioContext !== "undefined") {
      this.audioContext = new AudioContext();
      this.audioContext.onstatechange = () => {};
    }
  }

  private setupStreamTimeout(audioData: AudioResponse) {
    clearTimeout(this.streamTimeouts.get(audioData.stream_id));

    const timeout = setTimeout(() => {
      this.streamEndMap.set(audioData.stream_id, audioData.chunk_id);
    }, this.STREAM_TIMEOUT_MS);

    this.streamTimeouts.set(audioData.stream_id, timeout);
  }

  public addToQueue(audioData: AudioResponse) {
    // If stopping, clear all streams and start new stream
    if (this.isStopping) {
      this.audioStreams.clear();
      this.audioStreams.set(
        audioData.stream_id,
        new Map([[audioData.chunk_id, audioData]])
      );
      this.currentStreamId = audioData.stream_id;
      this.currentChunkId = audioData.chunk_id;
      return;
    }

    // Add chunk to appropriate stream
    const streamChunksMap =
      this.audioStreams.get(audioData.stream_id) || new Map();
    streamChunksMap.set(audioData.chunk_id, audioData);
    this.audioStreams.set(audioData.stream_id, streamChunksMap);

    // If this is the first chunk, update current stream id and expected chunk id
    if (this.currentStreamId === null) {
      this.currentStreamId = audioData.stream_id;
      this.currentChunkId = audioData.chunk_id;
    }

    // Можно будет удалить, когда обновится сервер
    this.setupStreamTimeout(audioData);

    // If not playing, start playback
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    // Check if we can proceed with playback
    if (!this.checkCanPlay()) return;

    // Handle AudioContext state
    if (!(await this.handleAudioContextState())) return;

    // Get and validate audio data
    const audioData = this.getCurrentAudioChunk();

    if (!audioData) return;
    this.isPlaying = true;

    console.log("audioData", audioData);

    try {
      // Process audio data and setup complete audio graph
      const audioNodes = await this.processAndSetupAudioGraph(audioData);

      // Setup level monitoring
      this.setupLevelMonitoring(audioNodes.analyser);

      // Setup playback handlers and start playback
      this.setupPlaybackHandlers(audioNodes.source);

      audioNodes.source.start(0);
    } catch (error) {
      console.error("Error playing audio segment:", error);
      this.disconnectAndClearNodes();

      if (this.currentStreamId) {
        this.audioStreams
          .get(this.currentStreamId)
          ?.delete(this.currentChunkId);
        this.playNext();
      }
    }
  }

  private checkCanPlay(): boolean {
    if (this.isStopping) return false;

    if (this.audioStreams.size === 0) {
      this.isPlaying = false;
      this.disconnectAndClearNodes();
      return false;
    }

    if (!this.audioContext) {
      this.audioStreams.clear();
      this.isPlaying = false;
      return false;
    }

    return true;
  }

  private async handleAudioContextState(): Promise<boolean> {
    if (!this.audioContext) return false;

    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.error("Failed to resume AudioContext:", e);
        this.audioStreams.clear();
        this.isPlaying = false;
        this.disconnectAndClearNodes();
        this.options.onLevel?.(0);
        return false;
      }
    } else if (this.audioContext.state === "closed") {
      this.audioStreams.clear();
      this.isPlaying = false;
      this.disconnectAndClearNodes();
      return false;
    }

    return true;
  }

  private getCurrentAudioChunk(): AudioResponse | null {
    if (!this.currentStreamId) return null;

    const currentStream = this.audioStreams.get(this.currentStreamId);
    const nextChunk = currentStream?.get(this.currentChunkId);

    return nextChunk || null;
  }

  private async processAndSetupAudioGraph(audioData: AudioResponse): Promise<{
    source: AudioBufferSourceNode;
    gainNode: GainNode;
    analyser: AnalyserNode;
  }> {
    // Process audio data
    const arrayBuffer = this.decodeBase64Audio(audioData.audio);
    const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);

    // Create audio graph nodes
    const source = this.audioContext!.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = this.audioContext!.createGain();
    gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);

    const analyser = this.audioContext!.createAnalyser();
    analyser.fftSize = 256;

    // Store current nodes
    this.currentSourceNode = source;
    this.currentGainNode = gainNode;
    this.currentAnalyserNode = analyser;

    // Connect audio graph
    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(this.audioContext!.destination);

    return { source, gainNode, analyser };
  }

  private setupLevelMonitoring(analyser: AnalyserNode) {
    if (!this.options.onLevel) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateLevel = (currentAnalyser: AnalyserNode) => {
      if (
        !this.isPlaying ||
        this.currentAnalyserNode !== currentAnalyser ||
        !this.audioContext ||
        this.audioContext.state !== "running"
      ) {
        this.options.onLevel?.(0);
        return;
      }

      currentAnalyser.getByteTimeDomainData(dataArray);
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const sample = (dataArray[i]! - 128) / 128;
        sumSquares += sample * sample;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);

      if (this.options.onLevel) this.options.onLevel(rms);

      requestAnimationFrame(() => updateLevel(currentAnalyser));
    };

    requestAnimationFrame(() => updateLevel(analyser));
  }

  private getNextStreamId(): number | null {
    if (this.audioStreams.size === 0) {
      return null;
    }

    const streamIds = Array.from(this.audioStreams.keys());
    const minStreamId = Math.min(...streamIds);

    return minStreamId;
  }

  private setupPlaybackHandlers(source: AudioBufferSourceNode) {
    source.onended = () => {
      this.isPlaying = false;
      
      if (!this.isStopping) {
        // Remove current chunk from stream to prevent memory leaks
        if (this.currentStreamId) {
          const currentStream = this.audioStreams.get(this.currentStreamId);
          currentStream?.delete(this.currentChunkId);
        }

        // Check if current stream has ended
        if (
          this.currentStreamId &&
          this.streamEndMap.get(this.currentStreamId) === this.currentChunkId
        ) {
          // Move to next stream
          this.audioStreams.delete(this.currentStreamId);
          this.streamTimeouts.delete(this.currentStreamId);
          this.streamEndMap.delete(this.currentStreamId);
          this.currentStreamId = this.getNextStreamId();
          this.currentChunkId = 0;
        } else {
          this.currentChunkId++;
        }

        this.disconnectAndClearNodes();
        this.playNext();
      }
    };
  }

  public stop() {
    this.isStopping = true;
    this.audioStreams.clear();
    this.currentStreamId = null;
    this.currentChunkId = 0;

    this.streamTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.streamTimeouts.clear();
    this.streamEndMap.clear();

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
        this.options.onLevel?.(0);
        this.isStopping = false;

        if (this.audioStreams.size > 0) {
          this.playNext();
        }
      }, this.fadeDuration * 1000);
    } else {
      this.isPlaying = false;
      this.disconnectAndClearNodes();
      this.options.onLevel?.(0);
      this.isStopping = false;

      if (this.audioStreams.size > 0) {
        this.playNext();
      }
    }
  }

  private decodeBase64Audio(base64: string): ArrayBuffer {
    const base64WithoutHeader = base64.split(",")[1] || base64;
    const byteCharacters = atob(base64WithoutHeader);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers).buffer;
  }

  private disconnectAndClearNodes() {
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
    this.options.onLevel?.(0);
  }
}

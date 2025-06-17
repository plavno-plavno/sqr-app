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

  constructor(onLevel?: (level: number) => void, audioWorkletManager?: AudioWorkletManager) {
    this.onLevel = onLevel;
    this.audioWorkletManager = audioWorkletManager || null;
    if (typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
      this.audioContext.onstatechange = () => {
       // console.log(`AudioContext state changed: ${this.audioContext?.state}`);
      };
    } else {
      //console.error("AudioContext not supported in this browser.");
    }
  }

  public addToQueue(audioData: string) {
    if (!this.audioContext) {
     //  console.error("AudioContext not initialized. Cannot add to queue.");
      return;
    }
    if (this.isStopping) {
     //  console.log("Currently stopping/fading. Clearing queue and adding new data.");
      this.audioQueue = [];
      this.audioQueue.push(audioData);
    } else {
      this.audioQueue.push(audioData);
      // console.log(`Added item to queue. Queue size: ${this.audioQueue.length}`);
      if (!this.isPlaying) {
       //  console.log("Not currently playing, starting playback.");
        this.playNext();
      } else {
       //  console.log("Currently playing, item added to queue.");
      }
    }
  }

  private async playNext() {
    if (this.isStopping) {
      // console.log("Stop process is active, deferring playNext.");
      return;
    }

    // console.log("Attempting to play next item...");
    if (this.audioQueue.length === 0) {
     //  console.log("Queue is empty. Stopping playback cycle.");
      this.isPlaying = false;
      this.disconnectAndClearNodes();
      return;
    }

    if (!this.audioContext) {
     //  console.error("AudioContext is null. Cannot play.");
      this.audioQueue = [];
      this.isPlaying = false;
      return;
    }

    if (this.audioContext.state === 'suspended') {
     //  console.log("AudioContext is suspended. Attempting to resume.");
      try {
        await this.audioContext.resume();
       //  console.log("AudioContext resumed.");
      } catch (e) {
       //  console.error("Failed to resume AudioContext:", e);
        this.audioQueue = [];
        this.isPlaying = false;
        this.disconnectAndClearNodes();
        this.onLevel?.(0);
        return;
      }
    } else if (this.audioContext.state === 'closed') {
    //   console.error("AudioContext is closed. Cannot play.");
      this.audioQueue = [];
      this.isPlaying = false;
      this.disconnectAndClearNodes();
      return;
    }

    this.isPlaying = true;
    const audioData = this.audioQueue.shift();
   //  console.log(`Processing next item. Queue size remaining: ${this.audioQueue.length}`);

    if (!audioData) {
    //   console.warn("Shifted item was null or undefined. Playing next.");
      this.playNext();
      return;
    }

    try {
      const arrayBuffer = await this.decodeBase64Audio(audioData);
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);

      const source = this.audioContext!.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = this.audioContext!.createGain();
      gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);

      const analyser = this.audioContext!.createAnalyser();
      analyser.fftSize = 256;

      this.currentSourceNode = source;
      this.currentGainNode = gainNode;
      this.currentAnalyserNode = analyser;

      const scriptNode = this.audioContext!.createScriptProcessor(1024, 1, 1);
      scriptNode.onaudioprocess = (e) => {
        const inputBuffer = e.inputBuffer.getChannelData(0);
        if (this.audioWorkletManager) {
          const bufferCopy = new Float32Array(inputBuffer.length);
          bufferCopy.set(inputBuffer);
          this.audioWorkletManager.updatePlaybackBuffer(bufferCopy);
        }
      };

      source.connect(gainNode);
      gainNode.connect(analyser);
      gainNode.connect(scriptNode);
      scriptNode.connect(this.audioContext!.destination);
      analyser.connect(this.audioContext!.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = (currentAnalyser: AnalyserNode) => {
        if (!this.isPlaying || this.currentAnalyserNode !== currentAnalyser || !this.audioContext || this.audioContext.state !== 'running') {
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
      //   console.log("Current source ended.");
        scriptNode.disconnect();
        if (this.audioWorkletManager) {
          this.audioWorkletManager.stopPlayback();
        }
        if (!this.isStopping) {
          this.disconnectAndClearNodes();
          this.playNext();
        } else {
       //    console.log("Source ended during stop process. Cleanup handled by stop timeout.");
        }
      };

    //   console.log("Starting source playback.");
      source.start(0);

    } catch (error) {
      console.error('Error playing audio segment:', error);
      this.disconnectAndClearNodes();
      this.playNext();
    }
  }

  public stop() {
  //   console.log("Stop requested.");
    this.isStopping = true;
    this.audioQueue = [];

    if (this.currentGainNode && this.audioContext && this.audioContext.state === 'running') {
   //    console.log("Fading out current sound...");
      const currentTime = this.audioContext.currentTime;
      const stopTime = currentTime + this.fadeDuration;

      this.currentGainNode.gain.cancelScheduledValues(currentTime);
      this.currentGainNode.gain.linearRampToValueAtTime(this.currentGainNode.gain.value, currentTime);
      this.currentGainNode.gain.linearRampToValueAtTime(0, stopTime);

      setTimeout(() => {
       //  console.log("Fade complete, stopping source and cleaning up nodes.");
        this.isPlaying = false;
        this.disconnectAndClearNodes();
        this.onLevel?.(0);
        this.isStopping = false;

        if (this.audioQueue.length > 0) {
        //   console.log("New data arrived during stop. Playing next.");
          this.playNext();
        } else {
        //   console.log("Queue is empty after stop. Staying idle.");
        }
      }, this.fadeDuration * 1000);
    } else {
     //  console.log("No sound playing or context not running. Immediate stop.");
      this.isPlaying = false;
      this.disconnectAndClearNodes();
      this.onLevel?.(0);
      this.isStopping = false;

      if (this.audioQueue.length > 0) {
      //   console.log("New data arrived during immediate stop. Playing next.");
        this.playNext();
      } else {
     //    console.log("Queue is empty after immediate stop. Staying idle.");
      }
    }
  }

  private async decodeBase64Audio(base64: string): Promise<ArrayBuffer> {
    const base64WithoutHeader = base64.split(',')[1] || base64;
    const byteCharacters = atob(base64WithoutHeader);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers).buffer;
  }

  private disconnectAndClearNodes() {
  //   console.log("Disconnecting and clearing nodes...");
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
 //    console.log("Nodes cleared.");
  }

  public destroy() {
  //   console.log("Destroying AudioQueueManager.");
    this.stop();
    if (this.audioContext && this.audioContext.state !== 'closed') {
  //     console.log("Closing final AudioContext.");
      this.audioContext.close().then(() => {
  //       console.log("AudioContext closed successfully during destroy.");
        this.audioContext = null;
      }).catch(error => {
        console.error("Error closing AudioContext during destroy:", error);
        this.audioContext = null;
      });
    } else {
      this.audioContext = null;
    }
    this.onLevel?.(0);
  }
} 
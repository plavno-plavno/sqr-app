export class AudioQueueManager {
  private audioQueue: string[] = [];
  private isPlaying: boolean = false;
  private audioContext: AudioContext | null = null;
  private onLevel?: (level: number) => void;

  constructor(onLevel?: (level: number) => void) {
    this.onLevel = onLevel;
    this.audioContext = new AudioContext();
  }

  public addToQueue(audioData: string) {
    this.audioQueue.push(audioData);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.audioQueue.shift();
    
    if (!audioData || !this.audioContext) return;

    try {
      const response = await fetch(`data:audio/wav;base64,${audioData}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // --- анализатор уровня ---
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(this.audioContext.destination);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteTimeDomainData(dataArray);
        const rms = Math.sqrt(dataArray.reduce((sum, v) => sum + Math.pow(v - 128, 2), 0) / dataArray.length) / 128;
        if (this.onLevel) this.onLevel(rms);
        if (this.isPlaying) requestAnimationFrame(updateLevel);
      };
      updateLevel();
      // --- конец анализатора ---
      
      source.onended = () => {
        this.playNext();
      };

      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  public stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
  }
} 
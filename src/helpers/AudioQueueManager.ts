export class AudioQueueManager {
  private audioQueue: string[] = [];
  private isPlaying: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor() {
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
      source.connect(this.audioContext.destination);
      
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
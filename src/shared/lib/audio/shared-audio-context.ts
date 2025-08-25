/**
 * Единый AudioContext менеджер для всего приложения
 * Решает проблему конфликта производительности между несколькими AudioContext
 */
export class SharedAudioContextManager {
  private static instance: SharedAudioContextManager | null = null;
  private audioContext: AudioContext | null = null;

  private constructor() {}

  public static getInstance(): SharedAudioContextManager {
    if (!SharedAudioContextManager.instance) {
      SharedAudioContextManager.instance = new SharedAudioContextManager();
    }
    return SharedAudioContextManager.instance;
  }

  public async getAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    return this.audioContext!;
  }

  private async initializeAudioContext(): Promise<void> {
    if (typeof AudioContext === "undefined") {
      throw new Error("AudioContext is not supported in this browser");
    }

    try {
      // Единый sample rate 22050Hz для всего приложения
      // Используем "playback" latencyHint для лучшей производительности с микрофоном
      this.audioContext = new AudioContext({
        sampleRate: 22050,
        latencyHint: "playback",
      });

      // Если контекст приостановлен (например, до пользовательского взаимодействия)
      if (this.audioContext.state === "suspended") {
        console.log(
          "🔊 AudioContext suspended, will resume on user interaction"
        );
      }
    } catch (error) {
      console.error("Failed to initialize shared AudioContext:", error);
      throw error;
    }
  }

  public async ensureAudioContextRunning(): Promise<boolean> {
    const context = await this.getAudioContext();

    if (context.state === "suspended") {
      try {
        console.log("🔊 Resuming suspended AudioContext");
        await context.resume();
        console.log("🔊 AudioContext resumed:", context.state);
      } catch (error) {
        console.error("Failed to resume AudioContext:", error);
        return false;
      }
    }

    return context.state === "running";
  }

  public async cleanup(): Promise<void> {
    if (this.audioContext) {
      try {
        await this.audioContext.close();
        console.log("🔊 Shared AudioContext closed");
      } catch (error) {
        console.error("Error closing AudioContext:", error);
      } finally {
        this.audioContext = null;
      }
    }
  }
}

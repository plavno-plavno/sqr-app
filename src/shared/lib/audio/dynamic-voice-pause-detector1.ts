export class DynamicVoicePauseDetector1 {
  private confidenceThreshold: number;
  private minPauseMs: number;
  private maxPauseMs: number;
  private windowSize: number;
  private onAgentCanSpeak: () => void;

  private voiceProbHistory: number[] = [];
  private isInSpeech: boolean = false;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor({
    confidenceThreshold = 0.8,
    minPauseMs = 700,
    maxPauseMs = 2000,
    windowSize = 8,
    onAgentCanSpeak = () => {},
  }) {
    this.confidenceThreshold = confidenceThreshold;
    this.minPauseMs = minPauseMs;
    this.maxPauseMs = maxPauseMs;
    this.windowSize = windowSize;
    this.onAgentCanSpeak = onAgentCanSpeak;
  }

  public addProbabilities(voiceProb: number, silenceProb: number): void {
    // Сохраняем историю для анализа
    this.voiceProbHistory.push(voiceProb);
    if (this.voiceProbHistory.length > this.windowSize) {
      this.voiceProbHistory.shift();
    }

    const isSpeaking = voiceProb >= this.confidenceThreshold;

    if (isSpeaking) {
      // Отменяем таймер если речь возобновилась
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      this.isInSpeech = true;
    } else if (this.isInSpeech && silenceProb >= this.confidenceThreshold) {
      // Анализируем окончание речи и запускаем таймер
      this.handleSpeechEnd();
    }
  }

  private handleSpeechEnd(): void {
    this.isInSpeech = false;
    const pauseDuration = this.calculatePause();

    console.log(`[DynamicVoicePauseDetector] Pause: ${pauseDuration}ms`);

    this.startPauseTimer(pauseDuration);
  }

  private calculatePause(): number {
    if (this.voiceProbHistory.length < 3) {
      return this.maxPauseMs;
    }

    // Простой анализ: насколько резко упала voiceProb
    const recent = this.voiceProbHistory.slice(-4);
    const drop = recent[0] - recent[recent.length - 1];

    // Чем резче спад, тем короче пауза
    const dropFactor = Math.min(1, Math.max(0, drop));
    const pauseDuration =
      this.maxPauseMs - dropFactor * (this.maxPauseMs - this.minPauseMs);

    return Math.round(pauseDuration);
  }

  private startPauseTimer(pauseMs: number): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    this.silenceTimer = setTimeout(() => {
      this.onAgentCanSpeak();
      this.silenceTimer = null;
    }, pauseMs);
  }

  public reset(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.voiceProbHistory = [];
    this.isInSpeech = false;
  }
}

export class DynamicVoicePauseDetector {
  private confidenceThreshold: number;
  private minPauseMs: number;
  private maxPauseMs: number;
  private windowSize: number;
  private onAgentCanSpeak: () => void;
  private voiceProbHistory: number[];
  private silenceProbHistory: number[];
  private silenceTimer: ReturnType<typeof setTimeout> | null;
  private hasSpeechEnded: boolean = true; // Флаг состояния: true = тишина, false = активная речь

  /**
   * @param {number} confidenceThreshold - мин. уверенность для учёта (например, 0.7)
   * @param {number} minPauseMs минимальная пауза перед ответом агента (мс)
   * @param {number} maxPauseMs максимальная пауза (если речь "вялая")
   * @param {number} windowSize - сколько последних точек анализировать (рекомендуется 5-10)
   * @param {Function} onAgentCanSpeak - колбэк, когда агент может отвечать
   */
  constructor({
    confidenceThreshold = 0.8,
    minPauseMs = 700,
    maxPauseMs = 1500,
    windowSize = 5,
    onAgentCanSpeak = () => {},
  }) {
    this.confidenceThreshold = confidenceThreshold;
    this.minPauseMs = minPauseMs;
    this.maxPauseMs = maxPauseMs;
    this.windowSize = windowSize;
    this.onAgentCanSpeak = onAgentCanSpeak;
    this.voiceProbHistory = [];
    this.silenceProbHistory = [];
    this.silenceTimer = null;
    this.hasSpeechEnded = true; // Начинаем с состояния тишины
  }

  /**
   * Добавляет новые вероятности и анализирует, можно ли передать очередь агенту.
   * @param {number} voiceProb - вероятность речи (0..1)
   * @param {number} silenceProb - вероятность тишины (0..1)
   */
  public addProbabilities(voiceProb: number, silenceProb: number) {
    // Сохраняем историю
    this.voiceProbHistory.push(voiceProb);
    this.silenceProbHistory.push(silenceProb);

    // Поддерживаем фиксированный размер окна
    if (this.voiceProbHistory.length > this.windowSize) {
      this.voiceProbHistory.shift();
      this.silenceProbHistory.shift();
    }

    // Если тишина достаточно уверенна, начинаем проверку
    if (silenceProb >= this.confidenceThreshold) {
      // Запускаем таймер только если переходим из состояния речи в тишину
      if (!this.hasSpeechEnded) this.evaluatePause();
    } else {
      // Если речь активна, отменяем таймер и переходим в состояние речи
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      this.hasSpeechEnded = false; // Состояние: активная речь
    }
  }

  // Анализирует, нужно ли ждать и как долго
  private evaluatePause() {
    if (this.voiceProbHistory.length < 2) return;
    const window = this.voiceProbHistory;
    const timestamps = Array(window.length)
      .fill(0)
      .map((_, i) => i * 100); // эмулируем временные метки

    // 1. Рассчитываем скорость спада voiceProb
    const derivative =
      (window[window.length - 1] - window[0]) /
      (timestamps[timestamps.length - 1] - timestamps[0]);
    const isSharpDrop = derivative < -0.01; // резкий спад

    // 2. Оцениваем волатильность (стандартное отклонение)
    const stdDev = this.calculateStdDev(window);

    // 3. Динамически вычисляем паузу
    let dynamicPause = this.minPauseMs;
    if (isSharpDrop) {
      // Резкий спад — реагируем быстро
      dynamicPause = this.minPauseMs;
    } else if (stdDev > 0.05) {
      // Есть колебания — ждём дольше
      dynamicPause = this.maxPauseMs;
    } else {
      // Средний случай
      dynamicPause = (this.minPauseMs + this.maxPauseMs) / 2;
    }

    // Запускаем таймер только если его еще нет
    if (!this.silenceTimer) {
      this.silenceTimer = setTimeout(() => {
        this.hasSpeechEnded = true; // Состояние: тишина/речь закончилась
        this.onAgentCanSpeak();
        this.silenceTimer = null;
      }, dynamicPause);
    }
  }

  // Считает стандартное отклонение для оценки волатильности
  private calculateStdDev(values: number[]) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    return Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        values.length
    );
  }
}

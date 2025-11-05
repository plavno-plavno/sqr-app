import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FFT_SIZE,
  SMOOTHING_TIME_CONSTANT,
  BAR_WIDTH,
  BAR_GAP,
  MIN_BAR_HEIGHT,
  BG_COLOR,
  GRID_COLOR,
  TIME_TEXT_COLOR,
  WAVEFORM_COLOR_PRIMARY,
  WAVEFORM_COLOR_SECONDARY,
  WAVEFORM_COLOR_WHITE,
  WAVEFORM_GRADIENT,
  PADDING_TOP,
  PADDING_BOTTOM,
  VISUALIZATION_HEIGHT,
  DEFAULT_TIME_STEP,
  DB_MAX_THRESHOLD,
  DB_MIN_REFERENCE,
  DB_MAX_REFERENCE,
} from './audioTimelineConfig';

export class AudioTimelineHelper {
  #context: CanvasRenderingContext2D;

  #analyser: AnalyserNode;

  #bufferLength: number;

  #dataArray: Uint8Array;

  #startTime: number;

  #timeStep: number;

  #audioHistory: number[][] = [];

  #gradient: CanvasGradient | null = null;

  #currentDb: number = 0;

  #gainNode: GainNode;

  constructor(
    context: CanvasRenderingContext2D,
    mediaStream: MediaStream,
    timeStep: number = DEFAULT_TIME_STEP
  ) {
    this.#context = context;
    this.#timeStep = timeStep;
    this.#startTime = Date.now();

    // Set up audio context and analyser
    const audioContext = new AudioContext();
    this.#analyser = audioContext.createAnalyser();
    this.#gainNode = audioContext.createGain();
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(this.#gainNode);
    this.#gainNode.connect(this.#analyser);

    this.#analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;
    this.#analyser.fftSize = FFT_SIZE;
    this.#bufferLength = this.#analyser.frequencyBinCount;
    this.#dataArray = new Uint8Array(this.#bufferLength);

    // Create gradient for waveform
    if (WAVEFORM_GRADIENT) {
      this.#gradient = this.#context.createLinearGradient(
        0,
        PADDING_TOP,
        0,
        CANVAS_HEIGHT - PADDING_BOTTOM
      );
      this.#gradient.addColorStop(0, WAVEFORM_COLOR_PRIMARY);
      this.#gradient.addColorStop(1, WAVEFORM_COLOR_SECONDARY);
    }

    // Set initial sensitivity based on DB_MAX_THRESHOLD
    this.setSensitivityFromThreshold();
  }

  initRenderLoop() {
    let animationFrameId: number;

    const renderFrame = () => {
      this.#analyser.getByteFrequencyData(this.#dataArray);
      this.#updateFrame();

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    animationFrameId = requestAnimationFrame(renderFrame);

    return animationFrameId;
  }

  #updateFrame() {
    // Calculate current audio level (average of frequency data)
    // const average = this.#calculateAverageVolume();

    // Calculate decibels
    this.#currentDb = this.#calculateDecibels();

    // Store current audio data column
    this.#audioHistory.push(this.#getFrequencySnapshot());

    // Limit history length to prevent memory issues
    const maxHistoryLength = Math.ceil(CANVAS_WIDTH / (BAR_WIDTH + BAR_GAP)) + 50;
    if (this.#audioHistory.length > maxHistoryLength) {
      this.#audioHistory.shift();
    }

    // Clear canvas
    this.#context.fillStyle = BG_COLOR;
    this.#context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw threshold line at -30 dB
    this.#drawDbThresholds();

    // Draw grid and time markers
    this.#drawGrid();
    this.#drawTimeMarkers();

    // Draw audio visualization
    this.#drawAudioWaveform();

    // Draw dB meter
    this.#drawDbMeter();
  }

  // #calculateAverageVolume(): number {
  //   let sum = 0;
  //   for (let i = 0; i < this.#bufferLength; i++) {
  //     sum += this.#dataArray[i];
  //   }
  //   return sum / this.#bufferLength;
  // }

  #getFrequencySnapshot(): number[] {
    const snapshot: number[] = [];
    // Sample all frequency data points instead of every nth point
    for (let i = 0; i < this.#bufferLength; i++) {
      snapshot.push(this.#dataArray[i]);
    }

    return snapshot;
  }

  #drawGrid() {
    this.#context.strokeStyle = GRID_COLOR;
    this.#context.lineWidth = 1;

    // Draw horizontal center line
    const centerY = PADDING_TOP + VISUALIZATION_HEIGHT / 2;
    this.#context.beginPath();
    this.#context.moveTo(0, centerY);
    this.#context.lineTo(CANVAS_WIDTH, centerY);
    this.#context.stroke();

    // Draw top and bottom lines
    this.#context.beginPath();
    this.#context.moveTo(0, PADDING_TOP);
    this.#context.lineTo(CANVAS_WIDTH, PADDING_TOP);
    this.#context.stroke();

    this.#context.beginPath();
    this.#context.moveTo(0, CANVAS_HEIGHT - PADDING_BOTTOM);
    this.#context.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - PADDING_BOTTOM);
    this.#context.stroke();
  }

  #drawTimeMarkers() {
    const elapsedTime = Date.now() - this.#startTime;
    const elapsedSeconds = elapsedTime / 1000;

    this.#context.fillStyle = TIME_TEXT_COLOR;
    this.#context.font = '12px monospace';
    this.#context.textAlign = 'center';

    // Calculate time step in seconds
    const timeStepSeconds = this.#timeStep / 1000;
    const pixelsPerSecond = CANVAS_WIDTH / 60; // 60 seconds visible

    // Find the most recent marker time
    const latestMarkerTime = Math.floor(elapsedSeconds / timeStepSeconds) * timeStepSeconds;

    // Draw markers going backwards from the latest
    for (let markerTime = latestMarkerTime; markerTime >= 0; markerTime -= timeStepSeconds) {
      // Calculate how many seconds ago this marker was
      const secondsAgo = elapsedSeconds - markerTime;

      // If this marker is too far in the past, stop
      if (secondsAgo > 60) {
        break;
      }

      // Calculate x position (newer on right)
      const x = Math.round(CANVAS_WIDTH - secondsAgo * pixelsPerSecond);

      // Only draw if visible on canvas and with enough spacing
      if (x >= 40 && x <= CANVAS_WIDTH - 40) {
        // Draw marker line
        this.#context.strokeStyle = GRID_COLOR;
        this.#context.lineWidth = 1;
        this.#context.beginPath();
        this.#context.moveTo(x, PADDING_TOP);
        this.#context.lineTo(x, CANVAS_HEIGHT - PADDING_BOTTOM);
        this.#context.stroke();

        // Draw time label with shadow for better visibility
        this.#context.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.#context.shadowBlur = 4;
        const formattedTime = this.#formatTime(markerTime * 1000);
        this.#context.fillText(formattedTime, x, PADDING_TOP - 10);
        this.#context.shadowBlur = 0;
      }
    }
  }

  #formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => {
      return num.toString().padStart(2, '0');
    };

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  #calculateDecibels(): number {
    // Calculate RMS (Root Mean Square) from frequency data
    // Based on: https://github.com/takispig/db-meter/blob/main/script.js
    let rms = 0;

    for (let i = 0; i < this.#bufferLength; i++) {
      let value = this.#dataArray[i];
      // Cap at 255 (max value for Uint8Array)
      if (value > 255) {
        value = 255;
      }
      rms += value * value;
    }

    rms = Math.sqrt(rms / this.#bufferLength);

    // Map RMS (0-255) to -50 to +50 dB range
    // RMS 0 = -50 dB (silent), RMS 255 = +50 dB (screaming/very close to mic)
    const dbRange = DB_MAX_REFERENCE - DB_MIN_REFERENCE; // 100
    const db = DB_MIN_REFERENCE + (rms / 255) * dbRange;

    return Math.max(DB_MIN_REFERENCE, Math.min(DB_MAX_REFERENCE, db));
  }

  // #getWaveformColor(): string {
  //   // Color scheme:
  //   // Above -30 dB = green (loud enough)
  //   // Below -30 dB = white (default/quiet)
  //
  //   if (this.#currentDb >= DB_MAX_THRESHOLD) {
  //     return WAVEFORM_COLOR_PRIMARY; // Green - above -30 dB
  //   }
  //
  //   // Below -30 dB - white
  //   return WAVEFORM_COLOR_WHITE;
  // }

  #drawDbThresholds() {
    // Draw threshold line at -30 dB (green threshold)
    // Range: -50 to +50 dB, center at 0 dB
    const dbRange = DB_MAX_REFERENCE - DB_MIN_REFERENCE; // 100
    const pixelsPerDb = VISUALIZATION_HEIGHT / dbRange;

    // Calculate Y position for -30 dB threshold
    // Y increases downward, so: Y = PADDING_TOP + (MAX_REF - dB) * pixelsPerDb
    const thresholdY = PADDING_TOP + (DB_MAX_REFERENCE - DB_MAX_THRESHOLD) * pixelsPerDb; // -30 dB line

    // Draw -30 dB threshold line (green)
    this.#context.strokeStyle = WAVEFORM_COLOR_PRIMARY;
    this.#context.lineWidth = 2;
    this.#context.setLineDash([5, 5]); // Dashed line
    this.#context.beginPath();
    this.#context.moveTo(0, thresholdY);
    this.#context.lineTo(CANVAS_WIDTH, thresholdY);
    this.#context.stroke();

    // Reset line dash
    this.#context.setLineDash([]);
  }

  #drawDbMeter() {
    // Draw dB value in top-left corner
    this.#context.font = 'bold 16px monospace';
    this.#context.textAlign = 'left';

    // Background for better visibility
    const currentValue = this.#currentDb + DB_MAX_REFERENCE;
    const text = `${currentValue.toFixed(1)} dB`;
    const textMetrics = this.#context.measureText(text);
    const padding = 8;
    const bgX = 10;
    const bgY = 5;
    const bgWidth = textMetrics.width + padding * 2;
    const bgHeight = 24;

    // Draw background
    this.#context.fillStyle = 'rgba(139, 0, 0, 0.8)';
    this.#context.fillRect(bgX, bgY, bgWidth, bgHeight);

    // Determine text color based on dB level (match waveform colors)
    let textColor = WAVEFORM_COLOR_WHITE; // White for below -30 dB
    if (this.#currentDb >= DB_MAX_THRESHOLD) {
      textColor = WAVEFORM_COLOR_PRIMARY; // Green for above -30 dB
    }

    // Draw text
    this.#context.fillStyle = textColor;
    this.#context.fillText(text, bgX + padding, bgY + 18);
  }

  #drawAudioWaveform() {
    const barSpacing = BAR_WIDTH + BAR_GAP;
    let x = CANVAS_WIDTH;

    // Draw from right to left (newest data on the right)
    for (let i = this.#audioHistory.length - 1; i >= 0; i--) {
      const snapshot = this.#audioHistory[i];

      // Calculate RMS (Root Mean Square) for this snapshot
      let rms = 0;
      for (let j = 0; j < snapshot.length; j++) {
        const value = Math.min(snapshot[j], 255); // Cap at 255
        rms += value * value;
      }
      rms = Math.sqrt(rms / snapshot.length);

      const normalizedValue = rms / 255;
      const barHeight = Math.max(normalizedValue * VISUALIZATION_HEIGHT, MIN_BAR_HEIGHT);

      // Convert normalized value (0-1) to dB range (-50 to 50)
      const dbValue = DB_MIN_REFERENCE + normalizedValue * (DB_MAX_REFERENCE - DB_MIN_REFERENCE);

      // console.log(dbValue);

      // Color bars based on DB_MAX_THRESHOLD
      // Bars are colored green if their dB value exceeds DB_MAX_THRESHOLD (-30 dB)
      const waveformColor =
        dbValue >= DB_MAX_THRESHOLD ? WAVEFORM_COLOR_PRIMARY : WAVEFORM_COLOR_WHITE;

      // Draw bar centered vertically
      const centerY = PADDING_TOP + VISUALIZATION_HEIGHT / 2;
      const y = centerY - barHeight / 2;

      this.#context.fillStyle = waveformColor;
      this.#context.fillRect(x, y, BAR_WIDTH, barHeight);

      x -= barSpacing;

      if (x < 0) break;
    }
  }

  static renderInitialState(context: CanvasRenderingContext2D) {
    // Clear canvas
    context.fillStyle = BG_COLOR;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    context.strokeStyle = GRID_COLOR;
    context.lineWidth = 1;

    // Draw horizontal center line
    const centerY = PADDING_TOP + VISUALIZATION_HEIGHT / 2;
    context.beginPath();
    context.moveTo(0, centerY);
    context.lineTo(CANVAS_WIDTH, centerY);
    context.stroke();

    // Draw top and bottom lines
    context.beginPath();
    context.moveTo(0, PADDING_TOP);
    context.lineTo(CANVAS_WIDTH, PADDING_TOP);
    context.stroke();

    context.beginPath();
    context.moveTo(0, CANVAS_HEIGHT - PADDING_BOTTOM);
    context.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - PADDING_BOTTOM);
    context.stroke();

    // Draw initial time label
    context.fillStyle = TIME_TEXT_COLOR;
    context.font = '12px monospace';
    context.textAlign = 'center';
    context.fillText('00:00:00', CANVAS_WIDTH / 2, PADDING_TOP - 10);

    // Draw flat line in center
    context.fillStyle = WAVEFORM_COLOR_PRIMARY;
    const barSpacing = BAR_WIDTH + BAR_GAP;
    for (let x = 0; x < CANVAS_WIDTH; x += barSpacing) {
      context.fillRect(x, centerY - MIN_BAR_HEIGHT / 2, BAR_WIDTH, MIN_BAR_HEIGHT);
    }
  }

  setTimeStep(timeStep: number) {
    this.#timeStep = timeStep;
  }

  setSensitivity(threshold: number) {
    // Convert dB threshold to gain multiplier
    // -30 dB = normal sensitivity
    // -20 dB = higher sensitivity (10 dB more sensitive)
    // -40 dB = lower sensitivity (10 dB less sensitive)

    // Map threshold from dB to linear gain (0.1 to 10.0)
    const gainValue = 10 ** (-threshold / 20);

    // Clamp gain between 0.1 and 10.0 for safety
    const clampedGain = Math.max(0.1, Math.min(10.0, gainValue));

    if (this.#gainNode) {
      this.#gainNode.gain.value = clampedGain;
    }
  }

  setSensitivityFromThreshold() {
    // Use DB_MAX_THRESHOLD from config to set sensitivity
    this.setSensitivity(DB_MAX_THRESHOLD);
  }

  resetTimeline() {
    this.#startTime = Date.now();
    this.#audioHistory = [];
  }
}

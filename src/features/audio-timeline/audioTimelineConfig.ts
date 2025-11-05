// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 300; // Increased for better visibility

// Timeline configuration
export const TIME_STEP_1S = 1000; // 1 second in milliseconds
export const TIME_STEP_5S = 5000; // 5 seconds in milliseconds
export const TIME_STEP_10S = 10000; // 10 seconds in milliseconds
export const DEFAULT_TIME_STEP = TIME_STEP_5S; // Changed default to 5 seconds for better spacing

// Audio visualization
export const FFT_SIZE = 2048;
export const SMOOTHING_TIME_CONSTANT = 0.8;
export const BAR_WIDTH = 3;
export const BAR_GAP = 1;
export const MIN_BAR_HEIGHT = 2;

// Colors
export const BG_COLOR = 'rgb(249, 249, 249)';
export const GRID_COLOR = '#333333';
export const TIME_TEXT_COLOR = '#ffffff';
export const WAVEFORM_COLOR_PRIMARY = '#4CAF50'; // Green (normal range)
export const WAVEFORM_COLOR_SECONDARY = '#2196F3'; // Blue
export const WAVEFORM_COLOR_WHITE = 'rgba(36, 36, 36, 1)'; // White (too quiet, below 10dB)
export const WAVEFORM_COLOR_RED = '#F44336'; // Red (too loud, above 70dB)
export const WAVEFORM_GRADIENT = false; // Disabled for 3-block color scheme

// Decibel thresholds (-50 to +50 scale)
// DB_MAX_THRESHOLD теперь влияет на чувствительность микрофона:
// Значения ближе к 0 (например -20) = выше чувствительность
// Значения дальше от 0 (например -40) = ниже чувствительность
// Также влияет на цветовую индикацию: выше этого порога = зеленый, ниже = белый
export const DB_MAX_THRESHOLD = -20; // Порог чувствительности и цвета
export const DB_MIN_REFERENCE = -50; // Reference minimum for dB calculation
export const DB_MAX_REFERENCE = 50; // Reference maximum for dB calculation

// Timeline behavior
export const SCROLL_SPEED = 2; // pixels per frame at 60fps
export const TIMELINE_DURATION = 60000; // 60 seconds visible at once

// Time formatting
export const PADDING_TOP = 30; // Space for time labels at top
export const PADDING_BOTTOM = 10;
export const VISUALIZATION_HEIGHT = CANVAS_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

// Frame rate
export const TARGET_FPS = 60;

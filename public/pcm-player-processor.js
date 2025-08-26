// Логика работы:
// Аудио чанки приходят через postMessage в AudioQueueManager и в правильном порядке заносяться в буффер audioData.
// Получается один большой буфер аудиоданных без склеек. Далее метод process, который бразуер вызвает автоматически,
// мы постоянно обрабатываем эти данные без остановок и переодически отчищаем буфер.

// Utility function to check if a number is empty (null, undefined, NaN)
function isEmptyNumber(value) {
  if (value === null || value === undefined) return true;
  if (value === "" || value === " ") return true;
  if (typeof value === "number" && isNaN(value)) return true;
  return false;
}

class PCMPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // Динамический буфер для воспроизведения
    this.audioData = new Float32Array(0);
    this.readPosition = 0;

    // Двойная мапа для хранения чанков: Map<stream_id, Map<chunk_id, {data: Float32Array, isLast?: boolean}>>
    this.audioStreams = new Map();

    // Текущий воспроизводимый поток
    this.currentStreamId = null;
    this.currentChunkId = 0;

    // Fade out при остановке
    this.isStopping = false;
    this.fadeOutGain = 1.0;

    // Мониторинг уровня (каждые ~100ms при 22050Hz/128samples = каждые 34 вызова)
    this.levelCounter = 0;

    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    const { type, data } = event.data;

    switch (type) {
      case "addChunk":
        this.addAudioChunk(data);
        break;
      case "stop":
        this.stopAudio();
        break;
      case "clear":
        this.clearBuffer();
        break;
    }
  }

  addAudioChunk(data) {
    const { stream_id, chunk_id, audioBuffer } = data;

    // Обработка завершающего чанка
    if (chunk_id === -1) {
      const streamChunks = this.audioStreams.get(stream_id);

      if (!streamChunks || streamChunks.size === 0) return;

      // Добавляем дополнительный завершающий чанк в конец текущего стрима
      const maxChunkId = Math.max(...streamChunks.keys());
      const nextChunkId = maxChunkId + 1;
      const endChunk = { data: new Float32Array(0), isLast: true };
      streamChunks.set(nextChunkId, endChunk);

      // Пытаемся загрузить оставшиеся чанки в буфер
      this.processBufferedChunks();
      return;
    }

    // Конвертируем ArrayBuffer с Int16 PCM -> Float32
    const pcmData = this.convertPCMToFloat32(audioBuffer);

    // Получаем или создаем мапу чанков для этого стрима
    const streamChunks = this.audioStreams.get(stream_id) || new Map();
    streamChunks.set(chunk_id, { data: pcmData });
    this.audioStreams.set(stream_id, streamChunks);

    // Если это первый стрим, начинаем с него
    if (isEmptyNumber(this.currentStreamId)) {
      this.currentStreamId = stream_id;
      this.currentChunkId = chunk_id;
    }

    // Пытаемся обработать накопившиеся чанки
    this.processBufferedChunks();
  }

  stopAudio() {
    if (this.isStopping || this.audioData.length === 0) return;
    this.isStopping = true;
  }

  convertPCMToFloat32(audioBuffer) {
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return new Float32Array(0);
    }

    // Конвертируем Int16 PCM -> Float32
    const int16Array = new Int16Array(audioBuffer);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      // Нормализуем до [-1, 1]
      float32Array[i] = int16Array[i] / 32768.0;
    }

    return float32Array;
  }

  appendToBuffer(data) {
    const newBuffer = new Float32Array(this.audioData.length + data.length);
    newBuffer.set(this.audioData, 0);
    newBuffer.set(data, this.audioData.length);
    this.audioData = newBuffer;
  }

  getNextStreamId() {
    if (this.audioStreams.size === 0) {
      return null;
    }

    const streamIds = Array.from(this.audioStreams.keys());
    const minStreamId = Math.min(...streamIds);

    return minStreamId;
  }

  // Обрабатываем все доступные чанки и добавляем их в буфер воспроизведения
  processBufferedChunks() {
    while (true) {
      if (isEmptyNumber(this.currentStreamId)) break;

      const streamChunks = this.audioStreams.get(this.currentStreamId);
      if (!streamChunks) break;

      const chunk = streamChunks.get(this.currentChunkId);
      if (isEmptyNumber(chunk)) break;

      // Добавляем чанк в буфер воспроизведения
      this.appendToBuffer(chunk.data);

      // Проверяем, был ли это последний чанк стрима
      if (chunk.isLast) {
        this.audioStreams.delete(this.currentStreamId);
        this.currentStreamId = this.getNextStreamId();
        this.currentChunkId = 0;
      } else {
        this.currentChunkId++;
      }
    }
  }

  clearBuffer() {
    this.audioData = new Float32Array(0);
    this.readPosition = 0;
    this.audioStreams.clear();
    this.currentStreamId = null;
    this.currentChunkId = 0;
    this.isStopping = false;
    this.fadeOutGain = 1.0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (!output?.[0]) return true;

    const channel = output[0];
    let levelSum = 0;
    let hasData = false;

    // Читаем данные из буфера
    for (let i = 0; i < channel.length; i++) {
      let sample = 0;

      if (this.readPosition < this.audioData.length) {
        sample = this.audioData[this.readPosition] * 0.3;
        this.readPosition++;
        hasData = true;

        // Fade out при остановке (500ms)
        if (this.isStopping && this.fadeOutGain > 0) {
          this.fadeOutGain -= 0.0000906; // 500ms fade out при 22050Hz
          if (this.fadeOutGain < 0) this.fadeOutGain = 0;
        }
        sample *= this.fadeOutGain;
      }

      channel[i] = sample;
      levelSum += sample * sample;
    }

    // Очищаем буфер сразу после завершения fade out (300ms)
    if (this.isStopping && this.fadeOutGain === 0) {
      this.clearBuffer();
    }

    // Очистка обработанных данных (каждые 5 секунд)
    if (this.readPosition > 110250) {
      const remaining = this.audioData.length - this.readPosition;
      if (remaining > 0) {
        const newBuffer = new Float32Array(remaining);
        newBuffer.set(this.audioData.subarray(this.readPosition), 0);
        this.audioData = newBuffer;
      } else {
        this.audioData = new Float32Array(0);
      }
      this.readPosition = 0;
    }

    // Отправка уровня громкости каждые ~100ms
    if (++this.levelCounter >= 34) {
      const rms = Math.sqrt(levelSum / channel.length);
      this.port.postMessage({
        type: "level",
        value: hasData && !this.isStopping ? rms : 0,
      });
      this.levelCounter = 0;
    }

    return true;
  }
}

registerProcessor("pcm-player-processor", PCMPlayerProcessor);

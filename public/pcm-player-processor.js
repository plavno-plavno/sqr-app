// Логика работы:
// Аудио чанки приходят через postMessage в AudioQueueManager и в правильном порядке заносяться в буффер audioData. 
// Получается один большой буфер аудиоданных без склеек. Далее метод process, который бразуер вызвает автоматически,
// мы постоянно обрабатываем эти данные без остановок и переодически отчищаем буфер.
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
        this.isStopping = true;
        break;
      case "clear":
        this.clearBuffer();
        break;
    }
  }

  addAudioChunk(data) {
    const { stream_id, chunk_id, audioBuffer } = data;

    console.log(
      `[AudioWorklet] Received chunk: stream_id=${stream_id}, chunk_id=${chunk_id}`
    );

    // Обработка завершающего чанка
    if (chunk_id === -1) {
      console.log(`[AudioWorklet] End of stream ${stream_id}`);
      const streamChunks = this.audioStreams.get(stream_id);

      if (!streamChunks || streamChunks.size === 0) return;

      const maxChunkId = Math.max(...streamChunks.keys());
      const lastChunk = streamChunks.get(maxChunkId);
      if (lastChunk) lastChunk.isLast = true;

      // Пытаемся загрузить оставшиеся чанки в буфер
      this.processBufferedChunks();
      return;
    }

    // Конвертируем ArrayBuffer с Int16 PCM -> Float32
    const pcmData = this.convertPCMToFloat32(audioBuffer);
    console.log(
      `[AudioWorklet] Processing ${pcmData.length} samples for chunk ${chunk_id}`
    );

    // Получаем или создаем мапу чанков для этого стрима
    const streamChunks = this.audioStreams.get(stream_id) || new Map();
    streamChunks.set(chunk_id, { data: pcmData });
    this.audioStreams.set(stream_id, streamChunks);

    // Если это первый стрим, начинаем с него
    if (this.currentStreamId === null) {
      this.currentStreamId = stream_id;
      this.currentChunkId = 0;
      console.log(`[AudioWorklet] Starting playback with stream ${stream_id}`);
    }

    // Пытаемся обработать накопившиеся чанки
    this.processBufferedChunks();

    // Сбрасываем флаг остановки при новых данных
    if (this.isStopping) {
      console.log(`[AudioWorklet] Resuming playback`);
      this.isStopping = false;
      this.fadeOutGain = 1.0;
    }
  }

  convertPCMToFloat32(audioBuffer) {
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
      if (!this.currentStreamId) break;

      const streamChunks = this.audioStreams.get(this.currentStreamId);
      if (!streamChunks) break;

      const chunk = streamChunks.get(this.currentChunkId);
      if (!chunk) break;

      // Добавляем чанк в буфер воспроизведения
      this.appendToBuffer(chunk.data);

      // Удаляем обработанный чанк из мапы
      streamChunks.delete(this.currentChunkId);

      // Проверяем, был ли это последний чанк стрима
      if (chunk.isLast) {
        console.log(`[AudioWorklet] Stream ${this.currentStreamId} completed`);
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

        // Fade out при остановке
        if (this.isStopping && this.fadeOutGain > 0) {
          this.fadeOutGain -= 0.001;
          if (this.fadeOutGain < 0) this.fadeOutGain = 0;
        }
        sample *= this.fadeOutGain;
      }

      channel[i] = sample;
      levelSum += sample * sample;
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
        value: hasData ? rms : 0,
      });
      this.levelCounter = 0;
    }

    return true;
  }
}

registerProcessor("pcm-player-processor", PCMPlayerProcessor);

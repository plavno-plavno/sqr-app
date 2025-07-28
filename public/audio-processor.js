class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(0);
    this.BUFFER_SIZE = 2048; // 2KB in samples (assuming 32-bit float samples)
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input) return true;
    
    const channel = input[0];
    if (channel) {
      // Concatenate new samples to buffer
      const newBuffer = new Float32Array(this.buffer.length + channel.length);
      newBuffer.set(this.buffer);
      newBuffer.set(channel, this.buffer.length);
      this.buffer = newBuffer;

      // If we have enough data, send it and clear buffer
      if (this.buffer.length >= this.BUFFER_SIZE) {
        this.port.postMessage(this.buffer.slice(0, this.BUFFER_SIZE));
        this.buffer = this.buffer.slice(this.BUFFER_SIZE);
      }
    }
    
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor); 
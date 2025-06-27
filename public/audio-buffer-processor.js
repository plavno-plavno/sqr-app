class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    // Use the same buffer size as the old ScriptProcessor (8192 samples)
    this.bufferSize = options.processorOptions?.bufferSize || 8192;
    this.currentBuffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (input && output && input.length > 0 && output.length > 0) {
      const inputChannel = input[0];
      const outputChannel = output[0];
      
      if (inputChannel && outputChannel) {
        // Copy input to output for passthrough
        outputChannel.set(inputChannel);
        
        // Accumulate samples to match ScriptProcessor buffer size (8192)
        for (let i = 0; i < inputChannel.length; i++) {
          this.currentBuffer[this.bufferIndex] = inputChannel[i];
          this.bufferIndex++;
          
          // When we have enough samples, send them like ScriptProcessor did
          if (this.bufferIndex >= this.bufferSize) {
            // Create copy exactly like the old code: bufferCopy.set(inputBuffer)
            const bufferCopy = new Float32Array(this.currentBuffer.length);
            bufferCopy.set(this.currentBuffer);
            
            // Send to main thread (equivalent to updatePlaybackBuffer call)
            this.port.postMessage({
              type: 'audioData',
              buffer: bufferCopy
            });
            
            // Reset for next buffer
            this.bufferIndex = 0;
          }
        }
      }
    }
    
    return true;
  }
}

registerProcessor("audio-buffer-processor", AudioProcessor);

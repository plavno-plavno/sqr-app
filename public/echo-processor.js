class EchoProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 48000;
    this.delayBuffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.delayTime = 0.1;
    this.feedback = 0.3;
    this.wetLevel = 0.3;
    this.dryLevel = 0.7;
    this.sampleRate = 48000;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !input[0]) return true;

    const inputChannel = input[0];
    const outputChannel = output[0];
    
    for (let i = 0; i < inputChannel.length; i++) {
      const readIndex = (this.writeIndex - Math.floor(this.delayTime * this.sampleRate) + this.bufferSize) % this.bufferSize;
      const delayedSample = this.delayBuffer[readIndex];
      const echoSample = inputChannel[i] + delayedSample * this.feedback;
      this.delayBuffer[this.writeIndex] = echoSample;
      outputChannel[i] = inputChannel[i] * this.dryLevel - echoSample * this.wetLevel;
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
    }
    
    return true;
  }
}

registerProcessor('echo-processor', EchoProcessor); 
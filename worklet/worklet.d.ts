interface AudioWorkletProcessor {
  readonly port: MessagePort;
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Map<string, Float32Array>): void;
}

declare var AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor;
  new(options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;

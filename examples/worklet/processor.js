class ResampleProcessor extends AudioWorkletProcessor {
  src = null;

  constructor(options) {
    super(options);
    this.init();
  }

  async init() {
    const { create, ConverterType } = globalThis.LibSampleRate;

    let nChannels = 1;
    let inputSampleRate = 44100;
    let outputSampleRate = 16000; // or another target sample rate

    create(nChannels, inputSampleRate, outputSampleRate, {
      converterType: ConverterType.SRC_SINC_BEST_QUALITY, // or some other quality
    }).then((src) => {
      this.src = src;
    });
  }

  process(inputs, outputs, parameters) {
    // copy ins to outs (gross)
    for (let inputNum = 0; inputNum < inputs.length; inputNum++) {
      let input = inputs[inputNum];
      // copy channels
      for (let channelNum = 0; channelNum < input.length; channelNum++) {
        let channel = input[channelNum];
        // copy samples
        for (let sampleNum = 0; sampleNum < channel.length; sampleNum++) {
          outputs[inputNum][channelNum][sampleNum] = channel[sampleNum];
        }
      }
    }

    // do something w.r.t. resampling
    if (this.src != null) {
      const resampled = this.src.full(inputs[0][0]);
      console.log(
        `Resampled to ${inputs[0][0].length} samples to  ${resampled.length} samples`
      );
    }

    return true;
  }
}

registerProcessor('my-processor', ResampleProcessor);

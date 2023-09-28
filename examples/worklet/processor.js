class MyAudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
    }

    process(inputs, outputs, parameters) {
        
        return true;
    }
}

registerProcessor('my-processor', MyAudioProcessor);

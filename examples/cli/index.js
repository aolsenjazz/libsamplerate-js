const LibSampleRate = require("../../dist/libsamplerate");
const WaveFile = require("wavefile").WaveFile;
const fs = require('fs');

if (process.argv.length !== 4) {
    throw new Error('Usage: node index.js path-to-source.wav resampled-file-name.wav');
}

let converterType = LibSampleRate.ConverterType.SRC_SINC_BEST_QUALITY;
const outputSampleRate = parseInt(process.argv[2])
const inFile = 'test.wav';
const outFile = process.argv[3];

const data = fs.readFileSync(inFile, {encoding: 'base64'});
const wav = new WaveFile();
wav.fromBase64(data);

const nChannels = wav.fmt.numChannels;
const sampleRate = wav.fmt.sampleRate;

LibSampleRate.create(nChannels, sampleRate, outputSampleRate, {
    converterType: converterType, // default SRC_SINC_FASTEST. see API for more
    wasmPath: "../../dist/libsamplerate.wasm", // default '/libsamplerate.wasm'
}).then((src) => {
    // get the raw samples, then convert to Float32 where -1 < sample < 1
    let samples = wav.getSamples(true, Int16Array);
    var float32 = new Float32Array(samples);

    for (var i = 0; i < samples.length; i++) {
        float32[i] = samples[i] / 32767;
    }

    samples = float32;

    const newSamples = src.simple(samples);
    for (let i = 0; i < newSamples.length; i++) {
        newSamples[i] = newSamples[i] * 32767;
    }

    const newWav = new WaveFile();
    newWav.fromScratch(nChannels, outputSampleRate, '16', newSamples);
    fs.writeFileSync(outFile, newWav.toBuffer());

    src.destroy(); // clean up
})


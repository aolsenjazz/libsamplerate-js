import "babel-polyfill";
import { ConverterType, create } from "../dist/libsamplerate";

let converterType = ConverterType.SRC_SINC_BEST_QUALITY;
let nChannels = 2;
let inputSampleRate = 48000;
let outputSampleRate = 96000;

test("resamples data successfully in node", () => {
    return create(nChannels, inputSampleRate, outputSampleRate, {
            converterType: converterType, // default SRC_SINC_FASTEST. see API for more
            wasmPath: "dist/libsamplerate.wasm", // default '/libsamplerate.wasm'
    }).then((src) => {
        let data = new Float32Array(48000);
        let resampledData = src.simple(data);
        src.destroy(); // clean up

        expect(resampledData.length).toBe(96000);
    })
});

test('return correct num samples with 96k then 192000k outputs', () => {
    return create(nChannels, inputSampleRate, outputSampleRate, {
        converterType: converterType, // default SRC_SINC_FASTEST. see API for more
        wasmPath: "dist/libsamplerate.wasm", // default '/libsamplerate.wasm'
    }).then((src) => {
        let data = new Float32Array(48000);
        let resampledData = src.simple(data);
        expect(resampledData.length).toBe(96000);

        src.outputSampleRate = 192000;

        let secondResampled = src.simple(data);

        expect(secondResampled.length).toBe(192000);
    });
});

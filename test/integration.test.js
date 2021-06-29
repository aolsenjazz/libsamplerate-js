import "babel-polyfill";
import { ConverterType, create } from "../dist/libsamplerate";

let converterType = ConverterType.SRC_SINC_BEST_QUALITY;
let nChannels = 2;
let inputSampleRate = 44100;
let outputSampleRate = 48000;

test("resamples data successfully in node", async () => {
    const src = await create(nChannels, inputSampleRate, outputSampleRate, {
        converterType: converterType, // default SRC_SINC_FASTEST. see API for more
        wasmPath: "dist/libsamplerate.wasm", // default '/libsamplerate.wasm'
    });

    let data = new Float32Array(44100);
    let resampledData = src.full(data);
    src.destroy(); // clean up

    expect(resampledData.length).toBe(47688);
});

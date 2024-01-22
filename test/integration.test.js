import 'babel-polyfill';
import { ConverterType, create } from '../dist/libsamplerate';

let converterType = ConverterType.SRC_SINC_BEST_QUALITY;
let nChannels = 2;
let inputSampleRate = 48000;
let outputSampleRate = 96000;

test('resamples data successfully in node', () => {
  return create(nChannels, inputSampleRate, outputSampleRate, {
    converterType: converterType, // default SRC_SINC_FASTEST. see API for more
  }).then((src) => {
    let data = new Float32Array(48000);
    let resampledData = src.simple(data);
    src.destroy(); // clean up

    expect(resampledData.length).toBe(96000);
  });
});

test('return correct num samples with 96k then 192000k outputs', () => {
  return create(nChannels, inputSampleRate, outputSampleRate, {
    converterType: converterType,
  }).then((src) => {
    let data = new Float32Array(48000);
    let resampledData = src.simple(data);
    expect(resampledData.length).toBe(96000);

    src.outputSampleRate = 192000;

    let secondResampled = src.simple(data);

    expect(secondResampled.length).toBe(192000);
  });
});

test('correctly resamples edge case of output samples < 4mb, input samples > 4mb', () => {
  const inSr = 96000;
  const outSr = 48000;
  const nChan = 1;

  return create(nChan, inSr, outSr, {
    converterType: converterType,
  }).then((src) => {
    // calculate # elements for oa 7mb piece of "audio"
    const sizeInBytes = 7 * 1024 * 1024; // 7 MB
    const elementSizeInBytes = 4; // Size of a float32 element in bytes
    const numberOfElements = sizeInBytes / elementSizeInBytes;

    let data = new Float32Array(numberOfElements);
    let resampledData = src.simple(data);
    expect(resampledData.length).toBe(917361); // arbitrary, but that's the algo
  });
});

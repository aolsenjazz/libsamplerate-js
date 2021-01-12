import 'babel-polyfill';

import LoadSRC from './wasm-src.js';
import SRC from './src.js';

/** Used by libsamplerate to determine what algorithm to use to resample */
export const ConverterType = {
	SRC_SINC_BEST_QUALITY: 0,
	SRC_SINC_MEDIUM_QUALITY: 1,
	SRC_SINC_FASTEST: 2,
	SRC_ZERO_ORDER_HOLD: 3,
	SRC_LINEAR: 4
}

/**
 * Load the libsamplerate wasm module and wrap it in a SRC object
 *
 * @param {Number}   converterType    ConverterType object. See benchmarks to get a sense of which is best for you.
 * @param {Number}   nChannels        the number of output channels. 1-8 supported
 * @param {Number}   inputSampleRate  The sample rate of whatever source audio you want to resample
 * @param {Number}   outputSampleRate If playing audio in-browser, this should be equal to AudioContext.sampleRate
 * @return {Promise}                  a promise containing the SRC object on resolve, or error message on error
 */
export function create(converterType=-1, nChannels=-1, inputSampleRate=-1, outputSampleRate=-1) {
	if (ConverterType.SRC_SINC_BEST_QUALITY > converterType || ConverterType.SRC_LINEAR < converterType) throw 'invalid converterType submitted';
	if (nChannels < 1 || nChannels > 8) throw 'invalid nChannels submitted';
	if (inputSampleRate < 1 || inputSampleRate > 192000) throw 'invalid inputSampleRate';
	if (outputSampleRate < 1 || outputSampleRate > 192000) throw 'invalid outputSampleRate';

	return new Promise((resolve, reject) => {
		LoadSRC()
			.then((module) => {
				let src = new SRC(module, converterType, nChannels, inputSampleRate, outputSampleRate);
				resolve(src);
			})
			.catch((err) => {
				reject(err);
			});
	});
}
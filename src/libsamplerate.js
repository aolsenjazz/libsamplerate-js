import LoadSRC from './glue.js';
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
 * Load the libsamplerate wasm module and wrap it in a SRC object.
 *
 * options = {
 *      converterType: {ConverterType} default SRC_SINC_FASTEST
 *      wasmPath:      {String}        default '/libsamplerate.wasm'. set this to the location of your wasm file
 * }
 *
 * @param  {Number} nChannels        the number of output channels. 1-8 supported
 * @param  {Number} inputSampleRate  The sample rate of whatever source audio you want to resample
 * @param  {Number} outputSampleRate If playing audio in-browser, this should be equal to AudioContext.sampleRate
 * @param  {Object} options          Additional configuration information. see above
 * @return {Promise}                  a promise containing the SRC object on resolve, or error message on error
 */
export function create(nChannels, inputSampleRate, outputSampleRate, options={}) {
	if (nChannels < 1 || nChannels > 8) throw 'invalid nChannels submitted';
	if (inputSampleRate < 1 || inputSampleRate > 192000) throw 'invalid inputSampleRate';
	if (outputSampleRate < 1 || outputSampleRate > 192000) throw 'invalid outputSampleRate';

	let cType = options.converterType === undefined ? ConverterType.SRC_SINC_FASTEST : options.converterType;
	let wasm  = options.wasmPath || '/libsamplerate.wasm';
	
	const overrides = {
		locateFile: (path) => {
			return wasm;
		}
	}

	return new Promise((resolve, reject) => {
		LoadSRC(overrides)
			.then((module) => {
				let src = new SRC(module, cType, nChannels, inputSampleRate, outputSampleRate);
				resolve(src);
			})
			.catch((err) => {
				reject(err);
			});
	});
}
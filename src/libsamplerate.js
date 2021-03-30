import LoadSRC from "./glue.js";
import SRC from "./src.js";

/** Used by libsamplerate to determine what algorithm to use to resample */
export const ConverterType = {
	SRC_SINC_BEST_QUALITY: 0,
	SRC_SINC_MEDIUM_QUALITY: 1,
	SRC_SINC_FASTEST: 2,
	SRC_ZERO_ORDER_HOLD: 3,
	SRC_LINEAR: 4,
};

/**
 * Load the libsamplerate wasm module and wrap it in a SRC object.
 *
 * options = {
 *      converterType: {ConverterType} default SRC_SINC_FASTEST
 *      wasmPath:      {String}        default '/libsamplerate.wasm'. set this to the location of your wasm file
 * }
 *
 * @param  {Number} nChannels        the number of output channels. 1-128 supported
 * @param  {Number} inputSampleRate  The sample rate of whatever source audio you want to resample
 * @param  {Number} outputSampleRate If playing audio in-browser, this should be equal to AudioContext.sampleRate
 * @param  {Object} options          Additional configuration information. see above
 * @return {Promise}                 a promise containing the SRC object on resolve, or error message on error
 */
export function create(
	nChannels,
	inputSampleRate,
	outputSampleRate,
	options = {}
) {
	let cType =
		options.converterType === undefined
			? ConverterType.SRC_SINC_FASTEST
			: options.converterType;
	let wasm = options.wasmPath || "/libsamplerate.wasm";

	validate(nChannels, inputSampleRate, outputSampleRate, cType);

	const overrides = {
		locateFile: () => {
			return wasm;
		},
	};

	return new Promise((resolve, reject) => {
		LoadSRC(overrides)
			.then((module) => {
				let src = new SRC(
					module,
					cType,
					nChannels,
					inputSampleRate,
					outputSampleRate
				);
				resolve(src);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

/**
 * Validates the input data
 *
 * @param  {Number} nChannels        the number of output channels. 1-128 supported
 * @param  {Number} inputSampleRate  The sample rate of whatever source audio you want to resample
 * @param  {Number} outputSampleRate If playing audio in-browser, this should be equal to AudioContext.sampleRate
 * @param  {Number} cType            ConverterType. See above
 */
function validate(nChannels, inputSampleRate, outputSampleRate, cType) {
	if (nChannels === undefined) throw "nChannels is undefined";
	if (inputSampleRate === undefined) throw "inputSampleRate is undefined";
	if (outputSampleRate === undefined) throw "outputSampleRate is undefined";

	if (nChannels < 1 || nChannels > 128) throw "invalid nChannels submitted";
	if (inputSampleRate < 1 || inputSampleRate > 192000)
		throw "invalid inputSampleRate";
	if (outputSampleRate < 1 || outputSampleRate > 192000)
		throw "invalid outputSampleRate";
	if (
		cType < ConverterType.SRC_SINC_BEST_QUALITY ||
		cType > ConverterType.SRC_LINEAR
	)
		throw "invalid converterType";
}

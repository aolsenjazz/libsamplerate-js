import { toChunks, copyOrWriteArray } from "./util";

// ~ 4 MB. default emscripten module heap size is 16 MB. heap size can be increased using emcc TOTAL_MEMORY flag
const BUFFER_SIZE = 1008000;

export default class SRC {
	/**
	 * Run WASM module initialization and retrieves WASM data transmission arrays. Data transmission to WASM
	 * code is owned by the WASM module to avoid extra copies
	 *
	 * @param {Module} module the loaded WASM module
	 * @param {Number} converterType     ConverterType object. See benchmarks to get a sense of which is best for you.
	 * @param {Number} nChannels         the number of output channels. 1-8 supported
	 * @param {Number} inputSampleRate   The sample rate of whatever source audio you want to resample
	 * @param {Number} outputSampleRate  If playing audio in-browser, this should be equal to AudioContext.sampleRate
	 */
	constructor(
		module,
		converterType,
		nChannels,
		inputSampleRate,
		outputSampleRate
	) {
		this.module = module;
		this.converterType = converterType;
		this.nChannels = nChannels;
		this.inputSampleRate = inputSampleRate;
		this.outputSampleRate = outputSampleRate;
		this.ratio = outputSampleRate / inputSampleRate;
		this.isDestroyed = false;

		// init can cause heap memory to be increased, so call it before we get references to arrays below
		module.init(nChannels, converterType, inputSampleRate, outputSampleRate);

		this.sourceArray = module.sourceArray(BUFFER_SIZE);
		this.targetArray = module.targetArray(BUFFER_SIZE);
	}

	/**
	 * Calls the libsamplerate `simple` API. This should be used when resampling one individual chunk of audio,
	 * and no more calls to are required. If more calls are required, use the `full` API. If the array submitted
	 * is > 4MB, audio will be broken up into chunks and the `full` API will be used
	 *
	 * More (and better) info available at: http://www.mega-nerd.com/SRC/api_simple.html
	 *
	 * @param  {Float32Array}         dataIn  Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
	 * @return {Float32Array}                 The resampled data
	 */
	simple(dataIn) {
		return this._resample(this.module.simple, dataIn);
	}

	/**
	 * Calls the libsamplerate `full` API. This should be used when resampling several chunks of the
	 * sample audio, e.g. receiving a live stream from WebRTC/websocket API.
	 *
	 * More (and better) info available at: http://www.mega-nerd.com/SRC/api_full.html
	 *
	 * @param  {Float32Array}         dataIn  Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
	 * @param  {Float32Array || null} dataOut Optionally, pass a Float32Array to avoid allocating an extra array for every resampling operation
	 * @return {Float32Array}                 The resampled data. If dataOut != null, dataOut is returned
	 */
	full(dataIn, dataOut = null) {
		return this._resample(this.module.full, dataIn, dataOut);
	}

	/**
	 * Cleans up WASM SRC resources. Once this is called on an instance, that instance should not
	 * be used again or else risk hitting a segfault in WASM code.
	 */
	destroy() {
		if (this.isDestroyed === true) {
			console.warn("destroy() has already been called on this instance");
		} else {
			this.module.destroy();
			this.isDestroyed = true;
		}
	}

	/**
	 * Splits a large (> 4MB) chunk of audio into many smaller pieces, to be consumed by the SRC `full` api.
	 *
	 * @param  {Float32Array} dataIn  Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
	 * @return {Float32Array}         The resampled data
	 */
	_chunkAndResample(dataIn) {
		let accumulatedSize = 0;
		let resampledChunks = []; // Float32Array[]

		let chunkSize = (this.inputSampleRate / 10) * this.nChannels;
		let chunks = toChunks(dataIn, chunkSize, Float32Array);

		for (let i = 0; i < chunks.length; i++) {
			let resampled = this._resample(this.module.full, chunks[i]);
			accumulatedSize += resampled.length;
			resampledChunks.push(resampled);
		}

		let accumulated = new Float32Array(accumulatedSize);
		let accumulatedIndex = 0;
		for (let i = 0; i < resampledChunks.length; i++) {
			for (let j = 0; j < resampledChunks[i].length; j++) {
				accumulated[accumulatedIndex++] = resampledChunks[i][j];
			}
		}

		return accumulated;
	}

	/**
	 * Calls libsamplerate `full` or `simple` API after validating data. If dataIn > 4MB,
	 * uses _chunkAndResample instead.
	 *
	 * @param {Function} resampleFunc this.module.simple || this.module.full
	 * @param {Float32Array} dataIn   Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
	 * @param {Float32Array} dataOut  if resampleFunc === this.module.full, pass an optional resuable buffer to avoid extra allocations
	 */
	_resample(resampleFunc, dataIn, dataOut = null) {
		// if we don't actually need to resample, just copy values
		if (this.inputSampleRate === this.outputSampleRate) return dataIn;

		if (dataOut !== null && dataOut.length < this.ratio * dataIn.length)
			throw "dataOut must be at least ceil(srcRatio * dataIn.length) samples long";

		// if client is trying to resample a big piece of audio, process in chunks
		let projectedSize = Math.ceil(dataIn.length * this.ratio);
		if (projectedSize > BUFFER_SIZE) return this._chunkAndResample(dataIn);

		this.sourceArray.set(dataIn);

		// outputFrames are *per channel*
		let outputFrames = resampleFunc(
			dataIn.length,
			this.nChannels, // ignored by module.full()
			this.converterType, // ignored by module.full()
			this.inputSampleRate, // ignored by module.full()
			this.outputSampleRate // ignored by module.full()
		);

		return copyOrWriteArray(
			outputFrames * this.nChannels,
			this.targetArray,
			dataOut
		);
	}
}

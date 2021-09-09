import { toChunks, copyOrWriteArray } from "./util";
import { ModuleType } from "./module-type";
import { ConverterTypeValue } from "./converter-type";

/**
 * The length (in `float`s) of the input and output buffers used to transmit data between
 * JS and WASM. Each buffer is currently set to ~4MB.
 */
const BUFFER_LENGTH = 1008000;

/**
 * Manages communication between WASM code and JS
 */
export class SRC {
	/** WASM module containing C code. Load outside of this class because it must be loaded async */
	module: ModuleType;

	/** Float32Array used to transmit data from JS to WASM */
	sourceArray: Float32Array;

	/** Float32Array used to receive data from WASM */
	targetArray: Float32Array;

	_converterType: ConverterTypeValue;
	_nChannels: number;
	_inputSampleRate: number;
	_outputSampleRate: number;
	ratio: number;
	isDestroyed: boolean;

	/**
	 * Run WASM module initialization and retrieves WASM data transmission arrays. Data transmission to WASM
	 * code is owned by the WASM module to avoid extra copies
	 * @param mod the loaded WASM module
	 * @param converterType     ConverterType object. See benchmarks to get a sense of which is best for you.
	 * @param nChannels         the number of output channels. 1-8 supported
	 * @param inputSampleRate   The sample rate of whatever source audio you want to resample
	 * @param outputSampleRate  If playing audio in-browser, this should be equal to AudioContext.sampleRate
	 */
	constructor(
		mod: ModuleType,
		converterType: ConverterTypeValue,
		nChannels: number,
		inputSampleRate: number,
		outputSampleRate: number
	) {
		this.module = mod;
		this._converterType = converterType;
		this._nChannels = nChannels;
		this._inputSampleRate = inputSampleRate;
		this._outputSampleRate = outputSampleRate;
		this.ratio = outputSampleRate / inputSampleRate;
		this.isDestroyed = false;

		// init can cause heap memory to be increased, so call it before we get references to arrays below
		mod.init(nChannels, converterType, inputSampleRate, outputSampleRate);

		this.sourceArray = mod.sourceArray(BUFFER_LENGTH);
		this.targetArray = mod.targetArray(BUFFER_LENGTH);
	}

	/**
	 * Calls the libsamplerate `simple` API. This should be used when resampling one individual chunk of audio,
	 * and no more calls to are required. If more calls are required, use the `full` API. If the array submitted
	 * is > 4MB, audio will be broken up into chunks and the `full` API will be used
	 *
	 * More (and better) info available at: http://www.mega-nerd.com/SRC/api_simple.html
	 *
	 * @param dataIn Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
	 * @returns The resampled data
	 */
	simple(dataIn: Float32Array): Float32Array {
		return this._resample(this.module.simple, dataIn);
	}

	/**
	 * Calls the libsamplerate `full` API. This should be used when resampling several chunks of the
	 * sample audio, e.g. receiving a live stream from WebRTC/websocket API.
	 *
	 * More (and better) info available at: http://www.mega-nerd.com/SRC/api_full.html
	 *
	 * @param dataIn Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
	 * @param dataOut Optionally, pass a Float32Array to avoid allocating an extra array for every resampling operation
	 * @returns The resampled data. If dataOut != null, dataOut is returned
	 */
	full(
		dataIn: Float32Array,
		dataOut: Float32Array | null = null
	): Float32Array {
		return this._resample(this.module.full, dataIn, dataOut);
	}

	/**
	 * Cleans up WASM SRC resources. Once this is called on an instance, that instance must be
	 * reinitialized with src.init() before it can be used again.
	 *
	 * TODO: destroy is a gross name
	 */
	destroy(): void {
		if (this.isDestroyed === true) {
			console.warn("destroy() has already been called on this instance");
		} else {
			this.module.destroy();
			this.isDestroyed = true;
		}
	}

	get inputSampleRate(): number {
		return this._inputSampleRate;
	}

	set inputSampleRate(inputSampleRate: number) {
		this._inputSampleRate = inputSampleRate;

		this.module.destroy();
		this.module.init(
			this.nChannels,
			this.converterType,
			this.inputSampleRate,
			this.outputSampleRate
		);
	}

	get outputSampleRate(): number {
		return this._outputSampleRate;
	}

	set outputSampleRate(outputSampleRate: number) {
		this._outputSampleRate = outputSampleRate;

		this.module.destroy();
		this.module.init(
			this.nChannels,
			this.converterType,
			this.inputSampleRate,
			this.outputSampleRate
		);
	}

	get nChannels(): number {
		return this._nChannels;
	}

	set nChannels(nChannels: number) {
		this._nChannels = nChannels;

		this.module.destroy();
		this.module.init(
			this.nChannels,
			this.converterType,
			this.inputSampleRate,
			this.outputSampleRate
		);
	}

	get converterType(): ConverterTypeValue {
		return this._converterType;
	}

	set converterType(converterType: ConverterTypeValue) {
		this._converterType = converterType;

		this.module.destroy();
		this.module.init(
			this.nChannels,
			this.converterType,
			this.inputSampleRate,
			this.outputSampleRate
		);
	}

	/**
	 * Splits a large (> 4MB) chunk of audio into many smaller pieces, to be consumed by the SRC `full` api.
	 *
	 * @param dataIn Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
	 * @returns The resampled data
	 */
	_chunkAndResample(dataIn: Float32Array): Float32Array {
		let accumulatedSize = 0;
		const resampledChunks: Float32Array[] = [];

		const chunkSize = (this.inputSampleRate / 10) * this.nChannels;
		const chunks = toChunks(dataIn, chunkSize, Float32Array) as Float32Array[];

		for (let i = 0; i < chunks.length; i++) {
			const resampled = this._resample(this.module.full, chunks[i]);
			accumulatedSize += resampled.length;
			resampledChunks.push(resampled);
		}

		const accumulated = new Float32Array(accumulatedSize);
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
	 * @param resampleFunc this.module.simple || this.module.full
	 * @param dataIn Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
	 * @param dataOut if resampleFunc === this.module.full, pass an optional resuable buffer to avoid extra allocations
	 * @returns The resampled audio, if any
	 */
	_resample(
		resampleFunc: ModuleType["simple"] | ModuleType["full"],
		dataIn: Float32Array,
		dataOut: Float32Array | null = null
	): Float32Array {
		// if we don't actually need to resample, just copy values
		if (this.inputSampleRate === this.outputSampleRate) return dataIn;

		if (dataOut !== null && dataOut.length < this.ratio * dataIn.length)
			throw "dataOut must be at least ceil(srcRatio * dataIn.length) samples long";

		// if client is trying to resample a big piece of audio, process in chunks
		const projectedSize = Math.ceil(dataIn.length * this.ratio);
		if (projectedSize > BUFFER_LENGTH) return this._chunkAndResample(dataIn);

		this.sourceArray.set(dataIn);

		// outputFrames are *per channel*
		const outputFrames = resampleFunc(
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

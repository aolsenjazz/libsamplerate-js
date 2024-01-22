import { ModuleType } from './module-type';
import { ConverterTypeValue } from './converter-type';
/**
 * Manages communication between WASM code and JS
 */
export declare class SRC {
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
    constructor(mod: ModuleType, converterType: ConverterTypeValue, nChannels: number, inputSampleRate: number, outputSampleRate: number);
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
    simple(dataIn: Float32Array): Float32Array;
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
    full(dataIn: Float32Array, dataOut?: Float32Array | null): Float32Array;
    /**
     * Cleans up WASM SRC resources. Once this is called on an instance, that instance must be
     * reinitialized with src.init() before it can be used again.
     *
     * TODO: destroy is a gross name
     */
    destroy(): void;
    get inputSampleRate(): number;
    set inputSampleRate(inputSampleRate: number);
    get outputSampleRate(): number;
    set outputSampleRate(outputSampleRate: number);
    get nChannels(): number;
    set nChannels(nChannels: number);
    get converterType(): ConverterTypeValue;
    set converterType(converterType: ConverterTypeValue);
    /**
     * Splits a large (> 4MB) chunk of audio into many smaller pieces, to be consumed by the SRC `full` api.
     *
     * @param dataIn Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
     * @returns The resampled data
     */
    _chunkAndResample(dataIn: Float32Array): Float32Array;
    /**
     * Calls libsamplerate `full` or `simple` API after validating data. If dataIn > 4MB,
     * uses _chunkAndResample instead.
     *
     * @param resampleFunc this.module.simple || this.module.full
     * @param dataIn Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
     * @param dataOut if resampleFunc === this.module.full, pass an optional resuable buffer to avoid extra allocations
     * @returns The resampled audio, if any
     */
    _resample(resampleFunc: ModuleType['simple'] | ModuleType['full'], dataIn: Float32Array, dataOut?: Float32Array | null): Float32Array;
}

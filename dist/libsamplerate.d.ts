/**
 * The entry point into this library. All of the actual resampling work is handled in src.ts
 */
import { SRC } from "./src";
import { ConverterTypeValue, ConverterType } from "./converter-type";
/**
 * Options that can be passed to create() when obtaining a copy of SRC.
 */
declare type CreateOptions = {
    converterType: ConverterTypeValue;
    wasmPath: string;
};
/**
 * Load the libsamplerate wasm module and wrap it in a SRC object.
 *
 * options = {
 *   converterType: {ConverterType} default SRC_SINC_FASTEST
 *   wasmPath:      {String}        default '/libsamplerate.wasm'. set this to the location of your wasm file
 * }
 *
 * @param nChannels the number of output channels. 1-128 supported
 * @param inputSampleRate The sample rate of whatever source audio you want to resample
 * @param outputSampleRate If playing audio in-browser, this should be equal to AudioContext.sampleRate
 * @param options Additional configuration information. see above
 * @returns a promise containing the SRC object on resolve, or error message on error
 */
export declare function create(nChannels: number, inputSampleRate: number, outputSampleRate: number, options?: CreateOptions): Promise<SRC>;
export { ConverterType };

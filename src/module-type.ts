import { ConverterTypeValue } from "./converter-type";

/** The object returned from loading WASM */
export type ModuleType = {
  /**
   * Initialize the src_data object in C
   * @param nChannels The number of channels
   * @param quality What quality the resampler will use
   * @param inSr Input sample rate
   * @param outSr Output sample rate
   */
  init(
    nChannels: number,
    quality: ConverterTypeValue,
    inSr: number,
    outSr: number
  ): void;

  /**
   * Returns the input array which is used to send data from JS to WASM
   * @param length The number of array elements to include
   * @returns A slice of the source array with specified length
   */
  sourceArray(length: number): Float32Array;

  /**
   * Returns the input array which is used to send data from WASM to JS
   * @param length The number of array elements to include
   * @returns A slice of the source array with specified length
   */
  targetArray(length: number): Float32Array;

  /**
   * Calls the libsamplerate `simple` API
   *
   * @param length The number of input frames to resampled
   * @param nChannels The number of channels represented
   * @param quality Converter algorithm. more (better) info: http://www.mega-nerd.com/SRC/api_misc.html#ErrorReporting
   * @param inSr Input sample rate
   * @param outSr Output sample rate
   *
   * @returns Output frames generated (per channel) or error code
   */
  simple(
    length: number,
    nChannels: number,
    quality: ConverterTypeValue,
    inSr: number,
    outSr: number
  ): number;

  /**
   * Calls the libsamplerate `full` API. nChannels, quality, inSr, and outSr all ignored. They're kept as
   * arguments because it simplifies the JS api.
   *
   * TODO: this is kind of gross. we should be binding function arguments rather than this smelly bit
   *
   * @param length    The number of input frames to resampled
   * @param nChannels The number of channels represented
   * @param quality   Converter algorithm. more (better) info: http://www.mega-nerd.com/SRC/api_misc.html#ErrorReporting
   * @param inSr      Input sample rate
   * @param outSr     Output sample rate
   *
   * @return          Output frames generated (per channel) or error code
   */
  full(
    length: number,
    nChannels: number,
    quality: ConverterTypeValue,
    inSr: number,
    outSr: number
  ): number;

  /**
   * Calls src_delete. Use to clean up resources once resampling is complete
   *
   * TODO: destroy really isn't a fitting name for what's happening
   */
  destroy(): void;
};

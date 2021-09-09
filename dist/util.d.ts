/** Convenient type that encapsulates all typed arrays in JS */
declare type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;
/** Represents a generic constructor for all typed arrays in JS */
interface TypedArrayConstructor {
    new (buffer: ArrayBuffer, byteOffset: number, length: number): Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;
}
/**
 * Splits a TypedArray into several chunks of size <= maxChunkSize
 *
 * @param { TypedArray }            array        The array to split into smaller TypedArrays
 * @param { number }                maxChunkSize Maximum length of the chunks. The last chunk is probably < maxChunkSize
 * @param { TypedArrayConstructor } contructor   A TypedArray constructor. Probably Float32Array
 * @return { TypedArray[] }                      An array of TypedArrays with length <= maxChunkSize
 */
export declare function toChunks(array: TypedArray, maxChunkSize: number, Constructor: TypedArrayConstructor): TypedArray[];
/**
 * Writes dataIn to dataOut, or a new Float32Array
 *
 * @param  { number }               length  Amount of data to copy
 * @param  { Float32Array }         dataIn  Array to copy values from
 * @param  { Float32Array | null }  dataOut If not null, copy data from dataIn into this array, then return it
 * @return { Float32Array }                 A new Float32Array or dataOut if dataOut != null
 */
export declare function copyOrWriteArray(length: number, dataIn: Float32Array, dataOut?: Float32Array | null): Float32Array;
/**
 * converts and *scales* TypedArray to Float32 where samples are scaled from
 * TypedArray.minValue < n < TypedArray.maxValue to -1 < n < 1
 *
 * @param  { TypedArray } data A TypedArray containing audio samples
 * @return { TypedArray }      The float32 representations scaled to -1 < n < 1
 */
export declare function toFloat32(data: Float32Array): Float32Array;
export {};

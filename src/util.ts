/** Convenient type that encapsulates all typed arrays in JS */
type TypedArray =
	| Int8Array
	| Uint8Array
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Uint8ClampedArray
	| Float32Array
	| Float64Array;

/** Represents a generic constructor for all typed arrays in JS */
interface TypedArrayConstructor {
	new (buffer: ArrayBuffer, byteOffset: number, length: number):
		| Int8Array
		| Uint8Array
		| Int16Array
		| Uint16Array
		| Int32Array
		| Uint32Array
		| Uint8ClampedArray
		| Float32Array
		| Float64Array;
}

/**
 * Splits a TypedArray into several chunks of size <= maxChunkSize
 *
 * @param { TypedArray }            array        The array to split into smaller TypedArrays
 * @param { number }                maxChunkSize Maximum length of the chunks. The last chunk is probably < maxChunkSize
 * @param { TypedArrayConstructor } contructor   A TypedArray constructor. Probably Float32Array
 * @returns { TypedArray[] }                      An array of TypedArrays with length <= maxChunkSize
 */
export function toChunks(
	array: TypedArray,
	maxChunkSize: number,
	Constructor: TypedArrayConstructor
): TypedArray[] {
	let lastPos = 0;
	const chunks: TypedArray[] = [];
	for (let i = 0; i < array.length; i += maxChunkSize) {
		const bound = Math.min(maxChunkSize, array.length - lastPos);
		const chunk = new Constructor(
			array.buffer,
			lastPos * array.BYTES_PER_ELEMENT,
			bound
		);
		lastPos += maxChunkSize;

		chunks.push(chunk);
	}

	return chunks;
}

/**
 * Writes dataIn to dataOut, or a new Float32Array
 *
 * @param length  Amount of data to copy
 * @param dataIn  Array to copy values from
 * @param dataOut If not null, copy data from dataIn into this array, then return it
 * @returns A new Float32Array or dataOut if dataOut != null
 */
export function copyOrWriteArray(
	length: number,
	dataIn: Float32Array,
	dataOut: Float32Array | null = null
): Float32Array {
	const _dataOut: Float32Array =
		dataOut === null ? new Float32Array(length) : dataOut;

	for (let i = 0; i < length; i++) {
		_dataOut[i] = dataIn[i];
	}

	return _dataOut;
}

/**
 * converts and *scales* TypedArray to Float32 where samples are scaled from
 * TypedArray.minValue < n < TypedArray.maxValue to -1 < n < 1
 *
 * @param data A TypedArray containing audio samples
 * @returns The float32 representations scaled to -1 < n < 1
 */
export function toFloat32(data: Float32Array): Float32Array {
	const divisor = maxValueForTypedArray(data);
	const float32 = new Float32Array(data.length);

	switch (data.constructor) {
		case Float32Array:
			return data;
		case Int8Array:
		case Int16Array:
		case Int32Array:
			for (let i = 0; i < data.length; i++) float32[i] = data[i] / divisor;
			break;
		case Uint8Array:
		case Uint16Array:
		case Uint32Array:
			for (let i = 0; i < data.length; i++)
				float32[i] = (data[i] - divisor) / divisor;
	}

	return float32;
}

/**
 * Get the maximum value which can be stored in the given TypedArray
 *
 * @param data A TypedArray containing audio samples
 * @returns The max value which can be stored in array
 */
function maxValueForTypedArray(array: TypedArray) {
	switch (array.constructor) {
		case Float32Array:
			return 1;
		case Int8Array:
		case Uint8Array:
			return 127;
		case Int16Array:
		case Uint16Array:
			return 32767;
		case Int32Array:
		case Uint32Array:
			return 2147483647;
		default:
			throw `Unsupport data type ${array.constructor}`;
	}
}

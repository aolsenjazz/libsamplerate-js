/**
 * Splits a TypedArray into several chunks of size <= maxChunkSize
 *
 * @param {TypedArray}    array        The array to split into smaller TypedArrays
 * @param {Number}        maxChunkSize Maximum length of the chunks. The last chunk is probably < maxChunkSize
 * @param {Constructor}   Constructor  A TypedArray constructor. Probably Float32Array
 * @return {TypedArray[]}              An array of TypedArrays with length <= maxChunkSize
 */
export function toChunks(array, maxChunkSize, Constructor) {
	let lastPos = 0;
	let chunks = [];
	for (let i = 0; i < array.length; i += maxChunkSize) {
		let bound = Math.min(maxChunkSize, array.length - lastPos);
		let chunk = new Constructor(array.buffer, lastPos * array.BYTES_PER_ELEMENT, bound);
		lastPos += maxChunkSize;

		chunks.push(chunk);
	}

	return chunks;
}

/**
 * Writes dataIn to dataOut, or a new Float32Array
 * 
 * @param  {Number}               length  Amount of data to copy
 * @param  {Float32Array}         dataIn  Array to copy values from
 * @param  {Float32Array || null} dataOut If not null, copy data from dataIn into this array, then return it
 * @return {Float32Array}                 A new Float32Array or dataOut if dataOut != null
 */
export function copyOrWriteArray(length, dataIn, dataOut=null) {
	let _dataOut = dataOut === null ? new Float32Array(length) : dataOut;

	for (let i = 0; i < length; i++) {
		_dataOut[i] = dataIn[i];
	}

	return _dataOut;
}

/**
 * converts and *scales* TypedArray to Float32 where samples are scaled from 
 * TypedArray.minValue < n < TypedArray.maxValue to -1 < n < 1
 *
 * @param  {TypedArray} data A TypedArray containing audio samples
 * @return {TypedArray}      The float32 representations scaled to -1 < n < 1
 */
export function toFloat32(data) {
	let divisor = maxValueForTypedArray(data);
	let float32 = new Float32Array(data.length);

	switch(data.constructor) {
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
			for (let i = 0; i < data.length; i++) float32[i] = (data[i] - divisor) / divisor;
	}

	return float32;
}

/**
 * Get the maximum value which can be stored in the given TypedArray
 *
 * @param  {TypedArray} data A TypedArray containing audio samples
 * @return {Number}          The max value which can be stored in array
 */
function maxValueForTypedArray(array) {
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
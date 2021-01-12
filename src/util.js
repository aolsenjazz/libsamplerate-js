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
/**
 * Checks that the file is present at the URL specified. If not, warns the user.
 * This is an unfortunately method that we need because WebAudio gives a terrible error message. More:
 * https://github.com/WebAudio/web-audio-api/issues/1846
 *
 * @param {String} pathToWorkletProcessor the path to feeder-node.processor.js
 */
export function checkFileExists(pathToFile) {
	return new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			let doneReadyState = 4;
			if (xhr.readyState === doneReadyState) {
				if (xhr.status === 404) {
					console.error(`Unable to find file at ${pathToFile}. You can change this url using the FeederNode constructor options arg`)
					reject();
				} else {
					resolve();
				}
			}
		}
		xhr.open('GET', pathToFile, true);
		xhr.send();
	});
}

/**
 * Writes 0 at every index in every channel
 * @param {Array} targetChannels An array of TypedArrays
 */
export function writeSilence(targetChannels) {
	for (let i = 0; i < targetChannels.length; i++) {
		let channel = targetChannels[i];

		for (let j = 0; j < channel.length; j++) {
			channel[j] = 0;
		}
	}
}

/**
 * Copies data from an interleaved data array to an mxn array of TypedArrays
 * @param  {TypedArray} interleavedData A TypedArray containing interleaved audio data.
 * @param  {Number}     nChannels       The number of channels to write interleavedData to
 * @return {Array}                      A multi-channel representation of the interleaved data
 */
export function writeInterleavedToChannels(interleavedData, nChannels) {
	if (!Number.isInteger(nChannels)) throw 'nChannels must be an integer';

	let dataPerChannel = interleavedData.length / nChannels;
	let channels = Array.apply(null, Array(nChannels)).map((x, i) => { return new Float32Array(dataPerChannel) });

	copyInterleavedToChannels(interleavedData, channels);
	return channels;
}

/**
 * Copies data from an interleaved data array to an mxn array of TypedArrays
 * @param {TypedArray} interleavedData A TypedArray containing interleaved audio data.
 * @param {Array}      targetChannels  An mxn array of m TypedArrays with length n. interleaved data is copied into these arrays
 */
export function copyInterleavedToChannels(interleavedData, targetChannels) {
	if (interleavedData.length > targetChannels[0].length * targetChannels.length) throw 'incorrect channel lengths';

	for (let channelNum = 0; channelNum < targetChannels.length; channelNum++) {
		let dataPos = channelNum;
		for (let channelPos = 0; channelPos < targetChannels[channelNum].length; channelPos++) {
			targetChannels[channelNum][channelPos] = interleavedData[dataPos];
			dataPos += targetChannels.length;
		}
	}
}

/**
 * Writes channel data to a new interleaved array. Basically just wraps copyChannelsToInterleaved
 * @param  {Array}      channels An mxn array containing m TypedArrays with length n
 * @return {TypedArray} an interleaved representation of channels
 */
export function writeChannelsToInterleaved(channels) {
	let interleavedLength = channels[0].length * channels.length;
	let interleaved = new Float32Array(interleavedLength);
	copyChannelsToInterleaved(channels, interleaved);
	return interleaved;
}

/**
 * Copies data from an mxn array to interleaved data array of size n*m
 * @param {Array}      channels An mxn array containing m TypedArrays with length n
 * @param {TypedArray} targetInterleaved A TypedArray to write interleaved data to
 */
export function copyChannelsToInterleaved(channels, targetInterleaved) {
	if (targetInterleaved.length < channels[0].length * channels.length) throw Error('incorrect channel lengths');

	let interleavedPos = 0;

	for (let i = 0; i < channels[0].length; i++) {	
		for (let j = 0; j < channels.length; j++) {
			targetInterleaved[interleavedPos++] = channels[j][i];
		}
	}
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
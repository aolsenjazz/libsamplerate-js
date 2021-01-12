import { toChunks, copyOrWriteArray } from '../src/util';

test('splitting a float32Array returns an Float32Array[]', () => {
	let array = new Float32Array(44100);
	let chunks = toChunks(array, 4410, Float32Array);

	for (let i = 0; i < chunks.length; i++) {
		expect(chunks[i].constructor.name).toBe('Float32Array');
	}
});

test('splitting a float32array of length 44100 creates 10 4410 chunks', () => {
	let array = new Float32Array(44100);
	let chunks = toChunks(array, 4410, Float32Array);

	for (let i = 0; i < chunks.length; i++) {
		expect(chunks[i].length).toBe(4410);
	}
});

test('splitting an array into non-divisible-length chunks works', () => {
	let array = new Float32Array(44101);
	let chunks = toChunks(array, 4410, Float32Array);

	for (let i = 0; i < chunks.length - 1; i++) {
		expect(chunks[i].length).toBe(4410);
	}

	expect(chunks[chunks.length - 1].length).toBe(1);
});

test('copyOrWriteArray with dataOut provided writes data to dataOut, then returns it', () => {
	let dataIn = new Float32Array(4410);
	let dataOut = new Float32Array(4410);

	for (let i = 0; i < dataIn.length; i++) {
		dataIn[i] = i;
	}

	copyOrWriteArray(dataIn.length, dataIn, dataOut);

	expect(JSON.stringify(dataOut)).toBe(JSON.stringify(dataIn));
});

test('copyOrWriteArray without dataOut creates a new array, and returns it', () => {
	let dataIn = new Float32Array(4410);

	for (let i = 0; i < dataIn.length; i++) {
		dataIn[i] = i;
	}

	let dataOut = copyOrWriteArray(dataIn.length, dataIn);

	expect(JSON.stringify(dataOut)).toBe(JSON.stringify(dataIn));
});

test('copyOrWriteArray with limited length copies only specified length', () => {
	let dataIn = new Float32Array(4410);
	let length = 2;

	for (let i = 0; i < dataIn.length; i++) {
		dataIn[i] = i;
	}

	let dataOut = copyOrWriteArray(length, dataIn);
	let correct = new Float32Array([0, 1]);

	expect(JSON.stringify(dataOut)).toBe(JSON.stringify(correct));
});
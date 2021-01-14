import { create } from '../src/libsamplerate';

test('creating SRC with converterType < 0 fails', () => {
	let nChannels = 2;
	let converterType = -1;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;

	expect(() => {
		create(nChannels, inputSampleRate, outputSampleRate, {converterType: -1});
	}).toThrow('invalid converterType')
});

test('creating SRC with nChannels < 0 fails', () => {
	let nChannels = -1;
	let converterType = 1;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;

	expect(() => {
		create(nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid nChannels submitted');
});

test('creating SRC with nChannels == undefined fails', () => {
	let converterType = 1;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;

	expect(() => {
		create();
	}).toThrow('nChannels is undefined');
});

test('creating SRC with nChannels > 128 fails', () => {
	let converterType = 1;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;
	let nChannels = 129;

	expect(() => {
		create(nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid nChannels submitted');
});

test('creating SRC with inputSampleRate < 0 fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = -1;
	let outputSampleRate = 44100;

	expect(() => {
		create(nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid inputSampleRate');
});

test('creating SRC with outputSampleRate < 0 fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = -1;

	expect(() => {
		create(nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid outputSampleRate');
});

test('creating SRC with inputSampleRate > 192k fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 193000;
	let outputSampleRate = 44100;

	expect(() => {
		create(nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid inputSampleRate');
});

test('creating SRC with outputSampleRate > 192k fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 193000;

	expect(() => {
		create(nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid outputSampleRate');
});

test('creating SRC with inputSampleRate == undefined fails', () => {
	let nChannels = 2;
	let converterType = 0;

	expect(() => {
		create(nChannels);
	}).toThrow('inputSampleRate is undefined');
});

test('creating SRC with outputSampleRate == undefined fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;

	expect(() => {
		create(nChannels, inputSampleRate);
	}).toThrow('outputSampleRate is undefined');
});

test('bad .wasm file causes promise rejection', (done) => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;

	create(nChannels, inputSampleRate, outputSampleRate, {wasmPath: 'badpath'})
		.then(() => {
			// shouldn't happen
		})
		.catch((err) => {
			expect(err).toBe('couldnt find wasm file');
			done();
		});
});

test('good .wasm file causes promise resolve()', (done) => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;

	create(nChannels, inputSampleRate, outputSampleRate, {wasmPath: '/libsamplerate.wasm'})
		.then((src) => {
			done();
		})
		.catch((err) => {

		});
});
import { create } from '../src/libsamplerate';

test('creating SRC with converterType < 0 fails', () => {
	let nChannels = 2;
	let converterType = -1;

	expect(() => {
		create(converterType, nChannels);
	}).toThrow('invalid converterType submitted')
});

test('createing SRC with nChannels < 0 fails', () => {
	let nChannels = -1;
	let converterType = 1;

	expect(() => {
		create(converterType, nChannels);
	}).toThrow('invalid nChannels submitted')
});

test('createing SRC with nChannels > 8 fails', () => {
	let nChannels = 9;
	let converterType = 1;

	expect(() => {
		create(converterType, nChannels);
	}).toThrow('invalid nChannels submitted')
});

test('creating SRC with converterType == undefined fails', () => {
	expect(() => {
		create();
	}).toThrow('invalid converterType submitted')
});

test('createing SRC with nChannels == undefined fails', () => {
	let converterType = 1;

	expect(() => {
		create(converterType);
	}).toThrow('invalid nChannels submitted')
});

test('creating SRC with inputSampleRate < 0 fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = -1;
	let outputSampleRate = 44100;

	expect(() => {
		create(converterType, nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid inputSampleRate')
});

test('creating SRC with outputSampleRate < 0 fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = -1;

	expect(() => {
		create(converterType, nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid outputSampleRate')
});

test('creating SRC with inputSampleRate < 192k fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 193000;
	let outputSampleRate = 44100;

	expect(() => {
		create(converterType, nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid inputSampleRate')
});

test('creating SRC with outputSampleRate < 192k fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 193000;

	expect(() => {
		create(converterType, nChannels, inputSampleRate, outputSampleRate);
	}).toThrow('invalid outputSampleRate')
});

test('creating SRC with inputSampleRate == undefined fails', () => {
	let nChannels = 2;
	let converterType = 0;

	expect(() => {
		create(converterType, nChannels);
	}).toThrow('invalid inputSampleRate')
});

test('creating SRC with outputSampleRate == undefined fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;

	expect(() => {
		create(converterType, nChannels, inputSampleRate);
	}).toThrow('invalid outputSampleRate')
});

test('creating SRC can\'t find the wasm file in jest & throws >.>', (done) => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;

	// mock the warn func. wasm glue code prints way too much info when its fails to find wasm code
	const consoleWarn = global.console.warn;
	global.console = { warn: jest.fn() }; 

	create(converterType, nChannels, inputSampleRate, outputSampleRate)
		.then(() => {
			// shouldn't happen
		})
		.catch(() => {
			done();
			global.console = { warn: jest.fn() } // reset the warn fn
		});
});
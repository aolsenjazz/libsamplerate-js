import SRC from '../src/src.js';

const BUFFER_SIZE = 1008000;

// the mocked wasm module
function module() {
	return {
		_sourceArray: new Float32Array(BUFFER_SIZE),
		_targetArray: new Float32Array(BUFFER_SIZE),

		simple: (length, nChannels, converterType, inputSampleRate, outputSampleRate) => {
			return Math.ceil(outputSampleRate / inputSampleRate * length);
		},
		full: (length, nChannels, converterType, inputSampleRate, outputSampleRate) => {
			return Math.ceil(outputSampleRate / inputSampleRate * length);
		},
		sourceArray: () => {
			return new Float32Array(BUFFER_SIZE);
		},
		targetArray: () => {
			return new Float32Array(BUFFER_SIZE);
		},
		init: () => {

		},
		destroy: () => {

		}
	}
}

test('simple() passes correct args to wasm backend', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 48000;
	let src = new SRC(module(), converterType, nChannels, inputSampleRate, outputSampleRate);

	const spy = jest.spyOn(src.module, 'simple');
	const data = new Float32Array(44100);

	src.simple(data);

	expect(spy).toHaveBeenCalledWith(data.length, nChannels, converterType, inputSampleRate, outputSampleRate);
});

test('full() passes correct args to wasm backend', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 48000;
	let src = new SRC(module(), converterType, nChannels, inputSampleRate, outputSampleRate);

	const spy = jest.spyOn(src.module, 'full');
	const data = new Float32Array(44100);

	src.full(data);

	expect(spy).toHaveBeenCalledWith(data.length, nChannels, converterType, inputSampleRate, outputSampleRate);
});

test('simple() w/200k samples calls src.module.full() 23 times', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 48000;
	let src = new SRC(module(), converterType, nChannels, inputSampleRate, outputSampleRate);

	const spy = jest.spyOn(src.module, 'full');
	const data = new Float32Array(BUFFER_SIZE + nChannels);

	src.simple(data);

	expect(spy).toHaveBeenCalledTimes(115);
});

test('full() w/200k samples calls src.module.full() 23 times', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 48000;
	let src = new SRC(module(), converterType, nChannels, inputSampleRate, outputSampleRate);

	const spy = jest.spyOn(src.module, 'full');
	const data = new Float32Array(BUFFER_SIZE + nChannels);

	src.full(data);

	expect(spy).toHaveBeenCalledTimes(115);
});

test('destroy() call module.destroy()', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 48000;
	let src = new SRC(module(), converterType, nChannels, inputSampleRate, outputSampleRate);

	const spy = jest.spyOn(src.module, 'destroy');
	src.destroy();

	expect(spy).toHaveBeenCalledTimes(1);
});

test('calling resample with inputSr===outputSr just returns dataIn', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;
	let src = new SRC(module(), converterType, nChannels, inputSampleRate, outputSampleRate);

	let dataIn = new Float32Array([1,2]);

	let result = src._resample(() => {}, dataIn);

	expect(result).toBe(dataIn);
});

test('calling resample with dataOut.length < dataIn.length && ratio > 1 fails', () => {
	let nChannels = 2;
	let converterType = 0;
	let inputSampleRate = 44100;
	let outputSampleRate = 48000;
	let src = new SRC(module(), converterType, nChannels, inputSampleRate, outputSampleRate);

	let dataIn = new Float32Array([1,2]);
	let dataOut = new Float32Array(1);

	expect(() => {
		src._resample(() => {}, dataIn, dataOut);
	}).toThrow('dataOut must be at least ceil(srcRatio * dataIn.length) samples long');
});
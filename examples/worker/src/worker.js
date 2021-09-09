import { create } from '../../../dist/libsamplerate'

let _src;

onmessage = (e) => {
	switch (e.data.command) {
		case 'init':
			init(e.data.quality, e.data.nChannels, e.data.inputSampleRate, e.data.outputSampleRate);
			break;
		case 'simple':
			simple(e.data.samples);
			break;
		case 'full':
			full(e.data.samples);
		case 'destroy':
			_src.destroy();
			break;
		default:
			throw `unrecognized command ${e.data.command}`;
	}
}

/** load the WASM module and initialize with default values */
function init(quality, nChannels, inputSampleRate, outputSampleRate) {
	create(nChannels, inputSampleRate, outputSampleRate, {
		converterType: quality,
		wasmPath: '/dist/libsamplerate.wasm'
	})
		.then((src) => {
			_src = src;
			postMessage({command: 'postInit'});
		})
		.catch((err) => {
			// unable to find the WASM file. handle however you choose
		});
}

/** call the libsamplerate `simple` api */
function simple(samples) {
	let resampled = _src.simple(samples);
	postMessage({command: 'postResample', samples: resampled})
}

/** call the libsamplerate `full` api */
function full(samples) {
	let resampled = _src.full(samples);
	postMessage({command: 'postResample', samples: resampled})
}

# libsamplerate-js

![AppVeyor](https://img.shields.io/appveyor/build/aolsenjazz/libsamplerate-js)

libsamplerate-js is a port of [libsamplerate](http://www.mega-nerd.com/SRC/) to Web Assembly exposed through a simple JS API for use in-browser. The [simple](http://www.mega-nerd.com/SRC/api_simple.html) API is ideal for resampling large pieces of audio. The [full](http://www.mega-nerd.com/SRC/api_full.html) API is ideal for quickly resampling small portions (128+ samples) of a larger piece of audio such as audio received from a Websocket or WebRTC connection.

#### Features:
- 1-128 channels
- 1-192000 sample rates
- libsamplerate [Full](http://www.mega-nerd.com/SRC/api_full.html) and [Simple](http://www.mega-nerd.com/SRC/api_simple.html) APIs
- See the [libsamplerate docs]() for much more (and better) info

## Installation

Install using NPM:
```bash
npm i @alexanderolsen/libsamplerate-js
```
### Important Note On libsamplerate.wasm
The web assembly file located at */node_modules/@alexanderolsen/libsamplerate-js/dist/libsamplerate.wasm* needs to be placed where libsamplerate-js can find it. The default location is at the root of your public directory. This location can be changed using the `wasmPath` variable in the options dict passed into `create()`:

```javascript
create(nChannels, inputSampleRate, outputSampleRate, { wasmPath: '/some/path/to/libsamplerate.wasm' });
```
See **Usage** or **API** for more examples and instructions.

## Usage

libsamplerate-js expects to receive Float32Array mono or multi-channel interleaved data, where each sample is -1 < sample < 1.

### In modules:
```javascript
import { create, ConverterType } from '@alexanderolsen/libsamplerate-js'; 

let converterType    = ConverterType.SRC_SINC_BEST_QUALITY;
let nChannels        = 2;
let inputSampleRate  = 44100;
let outputSampleRate = 48000;

create(nChannels, inputSampleRate, ouputSampleRate, {
	converterType: converterType,                  // default SRC_SINC_FASTEST. see API for more
	wasmPath: '/path/from/root/libsamplerate.wasm' // default '/libsamplerate.wasm'
})
	.then((src) => {
		let data = new Float32Array(44100);
		let resampledData = src.simple(data);
		src.destroy(); // clean up
	});
```
or
```javascript
const LibSampleRate = require('@alexanderolsen/libsamplerate-js'); 

let converterType    = LibSampleRate.ConverterType.SRC_SINC_BEST_QUALITY;
let nChannels        = 2;
let inputSampleRate  = 44100;
let outputSampleRate = 48000;

LibSampleRate.create(,nChannels, inputSampleRate, ouputSampleRate, {
	converterType: converterType,                  // default SRC_SINC_FASTEST. see API for more
	wasmPath: '/path/from/root/libsamplerate.wasm' // default '/libsamplerate.wasm'
})
	.then((src) => {
		let data = new Float32Array(44100);
		let resampledData = src.full(data);
		src.destroy(); // clean up
	});
```

### In HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js"></script>
<script>
	var converterType    = LibSampleRate.ConverterType.SRC_SINC_BEST_QUALITY;
	var nChannels        = 2;
	var inputSampleRate  = 44100;
	var outputSampleRate = 48000;

	LibSampleRate.create(nChannels, inputSampleRate, outputSampleRate, {
		converterType: converterType,                  // default SRC_SINC_FASTEST. see API for more
		wasmPath: '/path/from/root/libsamplerate.wasm' // default '/libsamplerate.wasm'
	})
		.then((src) => {
				var data = new Float32Array(44100);
				let resampledData = src.full(data);
				src.destroy(); // clean up
			});
</script>
```
Or use the libsamplerate.js file in the *dist* folder:
```html
<script src="libsamplerate.js"></script>
```

## API Reference

Once you've created the JS wrapper using `create()` or `LibSampleRate.create()`, the returned object exposes:
### `simple`
```javascript
/**
 * Calls the libsamplerate `simple` API. This should be used when resampling one individual chunk of audio,
 * and no more calls to are required. If more calls are required, use the `full` API. If the array submitted
 * is > 4MB, audio will be broken up into chunks and the `full` API will be used
 *
 * More (and better) info available at: http://www.mega-nerd.com/SRC/api_simple.html
 *
 * @param  {Float32Array}         dataIn  Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
 * @return {Float32Array}                 The resampled data
 */
simple(dataIn) { ... }
```

### `full`
```javascript
/**
 * Calls the libsamplerate `full` API. This should be used when resampling several chunks of the
 * sample audio, e.g. receiving a live stream from WebRTC/websocket API.
 *
 * More (and better) info available at: http://www.mega-nerd.com/SRC/api_full.html
 *
 * @param  {Float32Array}         dataIn  Float32Array containing mono|interleaved audio data where -1 < dataIn[i] < 1
 * @param  {Float32Array || null} dataOut Optionally, pass a Float32Array to avoid allocating an extra array for every esampling operation
 * @return {Float32Array}                 The resampled data. If dataOut != null, dataOut is returned
 */
full(dataIn, dataOut=null) { ... }
```

### `destroy`
```javascript
/**
 * Cleans up WASM SRC resources. Once this is called on an instance, that instance should not
 * be used again or else risk hitting a segfault in WASM code.
 */
destroy() { ... }
```

### `ConverterType`
Converter types are as follows. More information can be found at the [libsamplerate website](http://www.mega-nerd.com/SRC/api_misc.html#Converters).
```javascript
const ConverterType = {
	SRC_SINC_BEST_QUALITY: 0,   // highest quality, slowest
	SRC_SINC_MEDIUM_QUALITY: 1, // 
	SRC_SINC_FASTEST: 2,        // in-between
	SRC_ZERO_ORDER_HOLD: 3,     // poor quality, "blindingly" fast
	SRC_LINEAR: 4               // poor quality, "blindingly" fast
}
```

## Examples

Run any server ([http-server](https://www.npmjs.com/package/http-server), etc) from the project directory:
```bash
cd libsamplerate-js
http-server
```
and visit *localhost:8080/examples/basic* or *localhost:8080/examples/worker* in a browser. Examples and benchmarks **must be** hosted from the root directory, as they need to access the files in *dist*.

## Benchmarks

Get a sense of how long resampling operations take in your environment:
```bash
cd libsamplerate-js
http-server
```
and visit *localhost:8080/benchmarks*. A minimalistic UI is provided to test different batch sizes, APIs, sample rates, and `ConverterType`s.

## Building From Source

Before you can compile the WASM code you need to [download and install Empscripten](https://emscripten.org/docs/getting_started/downloads.html) and activate PATH variables for the current terminal. To build and compile the JS + WASM resources from source, run:

```bash
git clone https://github.com/aolsenjazz/libsamplerate-js
cd libsamplerate-js
npm run compile-wasm
npm run build
```

Production files are placed in the *dist* directory.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

Licenses are available in `LICENSE.md`.

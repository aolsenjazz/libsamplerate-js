# libsamplerate-js

libsamplerate-js is a port of [libsamplerate](http://www.mega-nerd.com/SRC/) to WASM exposed through a simple JS API for use in-browser. The [simple](http://www.mega-nerd.com/SRC/api_simple.html) and [full](http://www.mega-nerd.com/SRC/api_full.html) APIs are available.

## Installation

Install using NPM:
```bash
npm i libsamplerate-js
```
Then place the WASM code located at */node_modules/libsamplerate-js/wasm-src.wasm* into the root of your public directory. **libsamplerate-js will fail if it is unable to find this file in the root of your public directory.** Examples of this can be found in the *examples* or *benchmarks* folders.

## Usage

### In modules:
```javascript
import { create, ConverterType } from 'libsamplerate-js'; 

let converterType    = ConverterType.SRC_SINC_BEST_QUALITY;
let nChannels        = 2;
let inputSampleRate  = 44100;
let outputSampleRate = 48000;

create(converterType, nChannels, inputSampleRate, ouputSampleRate)
	.then((src) => {
		let data = new Float32Array(44100);
		let resampledData = src.simple(data);
	});
```
or
```javascript
const LibSampleRate = require('libsamplerate-js'); 

let converterType    = LibSampleRate.ConverterType.SRC_SINC_BEST_QUALITY;
let nChannels        = 2;
let inputSampleRate  = 44100;
let outputSampleRate = 48000;

LibSampleRate.create(converterType, nChannels, inputSampleRate, ouputSampleRate)
	.then((src) => {
		let data = new Float32Array(44100);
		let resampledData = src.full(data);
	});
```

### In HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/libsamplerate-js"></script>
<script>
	var converterType    = LibSampleRate.ConverterType.SRC_SINC_BEST_QUALITY;
	var nChannels        = 2;
	var inputSampleRate  = 44100;
	var outputSampleRate = 48000;

	LibSampleRate.create(converterType, nChannels, inputSampleRate, outputSampleRate)
		.then((src) => {
				var data = new Float32Array(44100);
				let resampledData = src.full(data);
			});
</script>
```
Or use the libsamplerate.js file in the *dist* folder:
```html
<script src="libsamplerate.js"></script>
```

## Building From Source

To build and compile the JS + WASM resources from source, run:

```bash
git clone https://github.com/aolsenjazz/libsamplerate-js
cd libsamplerate-js
npm run compile-wasm
npm run build
```

Production files are placed in the *dist* directory, and the WASM code required in examples/benchmarks is automatically copied to their respective directories.

## Examples

Run any http server ([http-server](https://www.npmjs.com/package/http-server), etc) from the root directory:
```bash
http-server
```
and visit *localhost:8080/examples/basic* or *localhost:8080/examples/worker* in a browser. Examples and benchmarks **must be** hosted from the root directory, as they need to access *dist/libsamplerate.js*.

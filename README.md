# libsamplerate-js

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/aolsenjazz/libsamplerate-js/build.yml?branch=main) [![Coverage Status](https://coveralls.io/repos/github/aolsenjazz/libsamplerate-js/badge.svg?branch=main)](https://img.shields.io/coveralls/github/aolsenjazz/libsamplerate-js) [![Maintainability](https://api.codeclimate.com/v1/badges/61ceec2449f7ab6a5ca2/maintainability)](https://codeclimate.com/github/aolsenjazz/libsamplerate-js/maintainability) [![Depfu](https://badges.depfu.com/badges/fb337ab1dda45e0d1ad17ab8f8572445/overview.svg)](https://depfu.com/github/aolsenjazz/libsamplerate-js?project_id=21222)

libsamplerate-js is a port of [libsamplerate](http://www.mega-nerd.com/SRC/) to Web Assembly exposed through a simple JS API for use in-browser or node. The [simple](http://www.mega-nerd.com/SRC/api_simple.html) API is ideal for resampling large pieces of audio. The [full](http://www.mega-nerd.com/SRC/api_full.html) API is ideal for quickly resampling small portions (128+ samples) of a larger piece of audio such as audio received from a Websocket or WebRTC connection.

#### Features:

- works both in-browser and in node!
- 1-128 channels
- 1-192000 sample rates
- libsamplerate [Full](http://www.mega-nerd.com/SRC/api_full.html) and [Simple](http://www.mega-nerd.com/SRC/api_simple.html) APIs
- See the [libsamplerate docs]() for much more (and better) info

## Installation

Install using NPM:

```bash
npm i @alexanderolsen/libsamplerate-js
```

See **Usage** or **API** for more examples and instructions.

## Usage

libsamplerate-js expects to receive Float32Array mono or multi-channel interleaved data, where each sample is -1 < sample < 1.

### In modules:

```javascript
import { create, ConverterType } from '@alexanderolsen/libsamplerate-js';

let converterType = ConverterType.SRC_SINC_BEST_QUALITY;
let nChannels = 2;
let inputSampleRate = 44100;
let outputSampleRate = 48000;

create(nChannels, inputSampleRate, outputSampleRate, {
  converterType: converterType, // default SRC_SINC_FASTEST. see API for more
}).then((src) => {
  let data = new Float32Array(44100);
  let resampledData = src.simple(data);
  src.destroy(); // clean up
});
```

or

```javascript
const LibSampleRate = require('@alexanderolsen/libsamplerate-js');

let converterType = LibSampleRate.ConverterType.SRC_SINC_BEST_QUALITY;
let nChannels = 2;
let inputSampleRate = 44100;
let outputSampleRate = 48000;

LibSampleRate.create(nChannels, inputSampleRate, outputSampleRate, {
  converterType: converterType, // default SRC_SINC_FASTEST. see API for more
}).then((src) => {
  let data = new Float32Array(44100);
  let resampledData = src.full(data);
  src.destroy(); // clean up
});
```

### In `AudioWorklets`:

```javascript
// project.js
const audioContext = new AudioContext({ sampleRate: 44100 });
await audioContext.audioWorklet.addModule('processor.js');
// You can also bundle libsamplerate.worklet.js with your own application; cnd link provided for convenience
await audioContext.audioWorklet.addModule(
  'https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js/dist/libsamplerate.worklet.js'
);
```

```javascript
// processor.js
const { create, ConverterType } = globalThis.LibSampleRate;

let nChannels = 1;
let inputSampleRate = 44100;
let outputSampleRate = 16000; // or another target sample rate

// somewhere in the declaration of your Processor:
create(nChannels, inputSampleRate, outputSampleRate, {
  converterType: ConverterType.SRC_SINC_BEST_QUALITY, // or some other quality
}).then((src) => {
  this.src = src;
});
```

See examples/worklet for a full implementation example. Configuring libsamplerate-js to work in `AudioWorklets` is less trival than it ought to be due to `AudioWorklet` limitations. _Note that typing support is not avaialble for LibSampleRate within the context of AudioWorklets._

### In HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js"></script>
<script>
  var converterType = LibSampleRate.ConverterType.SRC_SINC_BEST_QUALITY;
  var nChannels = 2;
  var inputSampleRate = 44100;
  var outputSampleRate = 48000;

  LibSampleRate.create(nChannels, inputSampleRate, outputSampleRate, {
    converterType: converterType, // default SRC_SINC_FASTEST. see API for more
  }).then((src) => {
    var data = new Float32Array(44100);
    let resampledData = src.full(data);
    src.destroy(); // clean up
  });
</script>
```

Or use the libsamplerate.js file in the _dist_ folder:

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
 * Cleans up WASM SRC resources. Once this is called on an instance, that instance must be
 * reinitialized with src.init() before it can be used again.
 */
destroy() { ... }
```

### Update `outputSampleRate` & `inputSampleRate`

```javascript
let nChannels = 2;
let inputSampleRate = 44100;
let outputSampleRate = 48000;

create(nChannels, inputSampleRate, outputSampleRate).then((src) => {
  let data = new Float32Array(44100);
  let resampled48k = src.simple(data); // returns ~48000 samples
  src.outputSampleRate = 96000;
  let resampled96k = src.simple(data); // returns ~96000 samples
});
```

### `ConverterType`

Converter types are as follows. More information can be found at the [libsamplerate website](http://www.mega-nerd.com/SRC/api_misc.html#Converters).

```javascript
const ConverterType = {
  SRC_SINC_BEST_QUALITY: 0, // highest quality, slowest
  SRC_SINC_MEDIUM_QUALITY: 1, //
  SRC_SINC_FASTEST: 2, // in-between
  SRC_ZERO_ORDER_HOLD: 3, // poor quality, "blindingly" fast
  SRC_LINEAR: 4, // poor quality, "blindingly" fast
};
```

## Examples

### Node

```bash
cd libsamplerate-js/examples/cli
node index.js 48000 result.wav
```

and listen to to the result

### Web

Run any server ([http-server](https://www.npmjs.com/package/http-server), etc) from the project directory:

```bash
cd libsamplerate-js
http-server
```

and visit _localhost:8080/examples/basic_ or _localhost:8080/examples/worker_ in a browser. Examples and benchmarks **must be** hosted from the root directory, as they need to access the files in _dist_.

## Benchmarks

Get a sense of how long resampling operations take in your environment:

```bash
cd libsamplerate-js
http-server
```

and visit _localhost:8080/benchmarks_. A minimalistic UI is provided to test different batch sizes, APIs, sample rates, and `ConverterType`s.

## Building From Source

Before you can compile the WASM code you need to [download and install Empscripten](https://emscripten.org/docs/getting_started/downloads.html) and activate PATH variables for the current terminal. To build and compile the JS + WASM resources from source, run:

```bash
git clone https://github.com/aolsenjazz/libsamplerate-js
cd libsamplerate-js
npm i
npm run compile-wasm
npm run build
```

You can also build with docker (either from scratch or the wasm only):

```bash
git clone https://github.com/aolsenjazz/libsamplerate-js
cd libsamplerate-js
git submodule update --init
cd scripts/library/
docker build -t gcc-emscripten .
cd ../../
npm run compile-library-docker
npm run compile-wasm-docker
npm run build
```

Production files are placed in the _dist_ directory.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

Licenses are available in `LICENSE.md`.

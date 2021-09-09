import React from 'react';
import ReactDOM from 'react-dom';

import { useState, useEffect, useCallback } from 'react';
import { WaveFile } from 'wavefile';
import { ConverterType } from '../../../dist/libsamplerate';

import Worker from './worker.js';

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
      throw "Unsupport data type " + array.constructor;
  }
}

function toFloat32(data) {
  var divisor = maxValueForTypedArray(data);
  var float32 = new Float32Array(data.length);
  switch (data.constructor) {
    case Float32Array:
      return data;
    case Int8Array:
    case Int16Array:
    case Int32Array:
      for (var i = 0; i < data.length; i++)
        float32[i] = data[i] / divisor;
      break;
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
      for (var j = 0; j < data.length; j++)
        float32[j] = (data[j] - divisor) / divisor;
  }
  return float32;
}

function App() {
	// worker
	const [worker, setWorker] = useState(new Worker());

	// benchmark meta information
	const [msg, setMsg] = useState(undefined);

	// libsamplerate settings
	const [wav, setWav]             = useState(new WaveFile()); // holds nChannels and sampleRate
	const [samples, setSamples]     = useState(undefined);
	const [algorithm, setAlgorithm] = useState('linear');
	const [api, setApi]             = useState('simple');
	const [outputSampleRateStr, setOutputSampleRateStr] = useState('44100');

	// read the file
	const [reader, setReader] = useState(new FileReader());
	useEffect(() => {
		document.getElementById('id').onchange = (e) => reader.readAsDataURL(e.target.files[0]);

		reader.onload = function(e) {
			let safariFixed = e.target.result.split('base64,')[1]; // safari reads wav as wav-x, which breaks WaveFile
			wav.fromBase64(safariFixed);

			let intSamples = wav.getSamples(true, Int16Array);
			setSamples(toFloat32(intSamples));
		}
	});

	// run the test
	const start = useCallback(() => {
		// parse whatever params needs to be parsed
		let _nChannels        = wav.fmt.numChannels;
		let _inputSampleRate  = wav.fmt.sampleRate;
		let _outputSampleRate = parseInt(outputSampleRateStr);

		// init audio ctx
		let AudioCtx = window.AudioContext || window.webkitAudioContext;
		let context = new AudioCtx({sampleRate: _outputSampleRate});

		let quality = qualityForString(algorithm);

		// init the web worker. see next useEffect() block for next steps
		worker.postMessage({
			command: 'init',
			quality: quality,
			nChannels: _nChannels,
			inputSampleRate: _inputSampleRate,
			outputSampleRate: _outputSampleRate,
		});
	});

	// handle messages from the worker
	useEffect(() => {
		let time;

		worker.onmessage = (e) => {
			switch (e.data.command) {
				case 'postInit':
					// initialization complete. resample some data
					setMsg('resampling...');
					time = Date.now();
					worker.postMessage({command: api, samples: samples});
					break;
				case 'postResample':
					// data has been resampled. do something with it
					let resampled = e.data.samples;
					setMsg(`Resampled to ${resampled.length} samples in ${Date.now() - time} ms`);
					worker.postMessage({command: 'destroy'}); // clean up
					break;
				default:
					throw `unrecognized command ${e.data.command}`;
			}
		}
	}, [samples]);
	
	return (
	<div className="App">
		<header className="App-header">
			<div>
				<h1>Run libsamplerate-js In a Web Worker</h1>
				<input id="id" type="file" accept="audio" /><br></br><br></br>
				<label>using algo</label>
				<select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
					<option value="linear">Linear</option>
					<option value="zero_order">Zero Order Hold</option>
					<option value="sinc_fastest">Sinc Fastest</option>
					<option value="sinc_medium">Sinc Medium</option>
					<option value="sinc_best">Sinc Best</option>
				</select><br></br><br></br>
				<label>and SRC API</label>
				<select value={api} onChange={(e) => setApi(e.target.value)}>
					<option value="simple">Simple</option>
					<option value="full">Full</option>
				</select> 
				<br></br><br></br>
				<label>outputting at sample rate</label>
				<select value={outputSampleRateStr} onChange={(e) => setOutputSampleRateStr(e.target.value)}>
					<option value="44100">44100</option>
					<option value="48000">48000</option>
					<option value="88200">88200</option>
					<option value="96000">96000</option>
				</select><br></br><br></br>
				<button onClick={start}>Start</button>
			</div>
			<p>{msg}</p>
		</header>
	</div>
	);
}

/** return the ConverterType for given string */
function qualityForString(qualityString) {
	switch(qualityString) {
		case 'linear':
			return ConverterType.SRC_LINEAR;
		case 'zero_order':
			return ConverterType.SRC_ZERO_ORDER_HOLD
		case 'sinc_fastest':
			return ConverterType.SRC_SINC_FASTEST;
		case 'sinc_medium':
			return ConverterType.SRC_SINC_MEDIUM_QUALITY;
		case 'sinc_best':
			return ConverterType.SRC_SINC_BEST_QUALITY;
		default:
			throw `unrecognized quality: ${qualityString}`;
	}
}

ReactDOM.render(<App />, document.getElementById('root'))

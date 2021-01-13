import React from 'react';
import ReactDOM from 'react-dom';

import { useState, useEffect, useCallback } from 'react';
import { WaveFile } from 'wavefile';
import { create, ConverterType } from '../../dist/libsamplerate';
import { Resampler } from './control-resampler';
import { writeInterleavedToChannels, toFloat32 } from './util';

function App() {
	// benchmark meta information
	const [nTests, setNTests] = useState('1000');
	const [batchSize, setBatchSize] = useState('512');
	const [msg, setMsg] = useState(undefined);

	// resampling strategy
	const [algorithm, setAlgorithm] = useState('control');
	const [api, setApi] = useState('simple');

	// libsamplerate settings
	const [outputSampleRateStr, setOutputSampleRateStr] = useState('44100');
	const [wav, setWav] = useState(new WaveFile()); // holds nChannels and sampleRate
	const [samples, setSamples] = useState(undefined);

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
		let _nTests           = parseInt(nTests);
		let _nChannels        = wav.fmt.numChannels;
		let _batchSize        = parseInt(batchSize);
		let _inputSampleRate  = wav.fmt.sampleRate;
		let _outputSampleRate = parseInt(outputSampleRateStr);
		let controlResampler  = new Resampler(_inputSampleRate, _outputSampleRate, _nChannels);

		// init audio ctx
		let AudioCtx = window.AudioContext || window.webkitAudioContext;
		let context = new AudioCtx({sampleRate: _outputSampleRate});

		if (algorithm === 'control') {
			// convert data from interleaved to a Float32Array[]
			let channels = writeInterleavedToChannels(samples, _nChannels);
			channels = channels.map(chan => {return new Float32Array(chan.buffer, 0, _batchSize)});

			// run the tests
			let testTimes = [];
			for (let i = 0; i < _nTests; i++) {
				let time = Date.now();
				controlResampler.resample(channels);
				testTimes.push(Date.now() - time);
			}

			// report
			let runtime = testTimes.reduce((a,b) => {return a+b});
			let timePerRun = runtime / _nTests;
			setMsg(`Ran ${_nTests} resampling operations at batchSize ${_batchSize} in ${runtime} ms at ${timePerRun} ms/run`);
		} else {
			let quality = qualityForString(algorithm);

			// init sample rate converter
			create(_nChannels, _inputSampleRate, _outputSampleRate, {
				converterType: quality,
				wasmPath: '/dist/libsamplerate.wasm'
			})
				.then((src) => {
					let testTimes = [];
					let batch = new Float32Array(samples.buffer, 0, _batchSize);

					// run the test
					if (api === 'simple') {
						for (let i = 0; i < _nTests; i++) {
							let time = Date.now();
							src.simple(batch);
							testTimes.push(Date.now() - time);
						}
					} else {
						for (let i = 0; i < _nTests; i++) {
							let time = Date.now();
							src.full(batch);
							testTimes.push(Date.now() - time);
						}
					}

					// report
					let runtime = testTimes.reduce((a,b) => {return a+b});
					let timePerRun = runtime / _nTests;
					setMsg(`Ran ${_nTests} resampling operations at batchSize ${_batchSize} in ${runtime} ms at ${timePerRun} ms/run`);

					// clean up
					src.destroy();
				})
				.catch((err) => {
					if (err instanceof WebAssembly.RuntimeError) {
						return 'Couldn\'t find wasm-src.wasm. See';
					}
					return err;
				});
		}
	});
	
	return (
	<div className="App">
		<header className="App-header">
			<div>
				<h1>Run libsamplerate-js Benchmarks</h1>
				<input id="id" type="file" accept="audio" /><br></br><br></br>
				<label>Run</label>
				<input value={nTests} onChange={(e) => {setNTests(e.target.value)}}></input><br></br><br></br>
				<label>tests of batch size</label>
				<input value={batchSize} onChange={(e) => {setBatchSize(e.target.value)}}></input><br></br><br></br>
				<label>using algo</label>
				<select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
					<option value="control">Control</option>
					<option value="linear">Linear</option>
					<option value="zero_order">Zero Order Hold</option>
					<option value="sinc_fastest">Sinc Fastest</option>
					<option value="sinc_medium">Sinc Medium</option>
					<option value="sinc_best">Sinc Best</option>
				</select><br></br><br></br>
				{ algorithm != 'control' ? 
					<div>
						<label>and SRC API</label>
						<select value={api} onChange={(e) => setApi(e.target.value)}>
							<option value="simple">Simple</option>
							<option value="full">Full</option>
						</select> 
						<br></br><br></br>
					</div>
					: 
					null 
				}
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
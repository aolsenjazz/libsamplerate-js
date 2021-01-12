/** 
 * Entire class yoinked from https://github.com/brion/audio-feeder
 */
export class Resampler {
	constructor(inputSampleRate, outputSampleRate, nChannels) {
		this.inputSampleRate = inputSampleRate;
		this.outputSampleRate = outputSampleRate;
		this.nChannels = nChannels;

		this._resampleFractional = 0;
		this._resampleLastSampleData = undefined;
	}

	/**
	@param {SampleBuffer} a list of Float32Arrays, one array per channel
	Taken from https://github.com/brion/audio-feeder/blob/master/src/index.js

	TODO: A much better resampling algo should definitely be used.
	*/
	resample(sampleData) {
		var rate = this.inputSampleRate,
			channels = this.nChannels,
			targetRate = this.outputSampleRate;

		if (rate == targetRate) return sampleData;
		var newSamples = [];

		// Mind that packet boundaries won't always align on
		// sample boundaries in the resamples output, so maintain
		// a running rounding fractional offset of the portion of
		// a sample we'll have to pull from the previous run on
		// the next one.
		var inputLen = sampleData[0].length,
			previousFractional = this._resampleFractional,
			outputLen = inputLen * targetRate / rate + previousFractional,
			outputSamples = Math.floor(outputLen),
			remainingFractional = (outputLen - outputSamples);

		var interpolate;
		if (rate < targetRate) {
			// Input rate is lower than the target rate,
			// use linear interpolation to minimize "tinny" artifacts.
			interpolate = function(input, output, previous, adjustment) {
				var inputSample = function(i) {
					if (i < 0) {
						if (previous && previous.length + i > 0) {
							// Beware sometimes we have empty bits at start.
							return previous[previous.length + i];
						} else {
							// this probably shouldn't happen
							// but if it does be safe ;)
							return input[0];
						}
					} else {
						return input[i];
					}
				};

				for (var i = 0; i < output.length; i++) {
					// Map the output sample to input space,
					// offset by one to give us room to interpolate.
					var j = ((i + 1 - previousFractional) * rate / targetRate) - 1;
					var a = Math.floor(j);
					var b = Math.ceil(j);

					var out;
					if (a == b) {
						out = inputSample(a);
					} else {
						out = inputSample(a) * (b - j) +
						      inputSample(b) * (j - a);
					}

					output[i] = out;
				}
			};
		} else {
			// Input rate is higher than the target rate.
			// For now, discard extra samples.
			interpolate = function(input, output, previous) {
				for (var i = 0; i < output.length; i++) {
					output[i] = input[(i * input.length / output.length) | 0];
				}
			};
		}
		

		for (var channel = 0; channel < channels; channel++) {
			var inputChannel = channel;
			var input = sampleData[inputChannel],
				output = new Float32Array(outputSamples),
				previous = this._resampleLastSampleData ? this._resampleLastSampleData[inputChannel] : undefined;

			interpolate(input, output, previous);

			newSamples.push(output);
		}
		this._resampleFractional = remainingFractional;
		this._resampleLastSampleData = sampleData;

		return newSamples;
	}
}
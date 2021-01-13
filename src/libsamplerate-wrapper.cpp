#include <emscripten/bind.h>

#include "libsamplerate-headers.h"

using namespace emscripten;

// ~ 4 MB. default emscripten module heap size is 16 MB. heap size can be increased using emcc TOTAL_MEMORY flag
const int BUFFER_LEN = 1008000;

// buffers to communicate w/js
float source[1008000];
float target[1008000];

SRC_STATE *src = nullptr;
SRC_DATA srcData;

/**
 * Called when the WASM module is loaded. Initializes part of SRC_DATA object
 *
 * @return 0 to be compliant
 */
int main() {
	srcData.end_of_input = 0;
	srcData.data_in = source;
	srcData.data_out = target;

	return 0;
}

/**
 * Initializes the SRC_STATE
 * 
 * @param nChannels The number of channels
 * @param quality   Converter algorithm. more (better) info: http://www.mega-nerd.com/SRC/api_misc.html#ErrorReporting
 * @param inSr      Input sample rate
 * @param outSr     Output sample rate
 * 
 * @return          Error code or zero
 */
int init(int nChannels, int quality, int inSr, int outSr) {
	srcData.src_ratio = outSr / (double) inSr;

	int* error = new int;
	src = src_new(quality, nChannels, error);
	
	if (*error != 0) {
		int err = *error;
		delete error;
		return err;
	}

	delete error;
	return 0;
}

/**
 * Returns the input array which is used to send data from JS to WASM
 * 
 * @return The number of samples from the array to return. Probably all of them
 */
emscripten::val sourceArray(int length) {
	return emscripten::val(emscripten::typed_memory_view(length, source));
}

/**
 * Returns the output array which is used to get data from WASM in JS
 * 
 * @return The number of samples from the array to return. Probably all of them
 */
emscripten::val targetArray(int length) {
	return emscripten::val(emscripten::typed_memory_view(length, target));
}

/**
 * Calls the libsamplerate `simple` API
 * 
 * @param length    The number of input frames to resampled
 * @param nChannels The number of channels represented
 * @param quality   Converter algorithm. more (better) info: http://www.mega-nerd.com/SRC/api_misc.html#ErrorReporting
 * @param inSr      Input sample rate
 * @param outSr     Output sample rate
 *
 * @return          Output frames generated (per channel) or error code
 */
int simple(int length, int nChannels, int quality, int inSr, int outSr) {
	srcData.src_ratio = outSr / (double) inSr;
	srcData.input_frames = length / nChannels;
	srcData.output_frames = BUFFER_LEN / nChannels;

	int error = src_simple(&srcData, quality, nChannels);
	std::string strError = src_strerror(error);

	if (error != 0) {
		return error;
	}

	return srcData.output_frames_gen;
}

/**
 * Calls the libsamplerate `full` API. nChannels, quality, inSr, and outSr all ignored. They're kept as
 * arguments because it simplifies the JS api.
 * 
 * @param length    The number of input frames to resampled
 * @param nChannels The number of channels represented
 * @param quality   Converter algorithm. more (better) info: http://www.mega-nerd.com/SRC/api_misc.html#ErrorReporting
 * @param inSr      Input sample rate
 * @param outSr     Output sample rate
 *
 * @return          Output frames generated (per channel) or error code
 */
int full(int length, int nChannels, int quality, int inSr, int outSr) {
	srcData.input_frames = length / nChannels;
	srcData.output_frames = BUFFER_LEN / nChannels;

	int processError = src_process(src, &srcData);
	if (processError != 0) {
		return processError;
	}
	
	return srcData.output_frames_gen;
}

/** Calls src_delete. Use to clean up resources once resampling is complete */
void destroy() {
	src_delete(src);
}

EMSCRIPTEN_BINDINGS(src) {
	function("init", &init);
	function("sourceArray", &sourceArray);
	function("targetArray", &targetArray);
	function("simple", &simple);
	function("full", &full);
	function("destroy", &destroy);
}
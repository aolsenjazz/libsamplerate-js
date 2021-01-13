export default function LoadSRC(overrides) {
	return new Promise((resolve, reject) => {
		if (overrides.locateFile() == '/libsamplerate.wasm') {
			resolve({});
		} else {
			throw 'couldnt find wasm file';
		}
	});
}
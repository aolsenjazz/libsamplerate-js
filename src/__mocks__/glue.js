// mock for the real LoadSRC. ignore me
export default function LoadSRC(overrides) {
	return new Promise((resolve, reject) => {
		if (overrides.locateFile() == "/libsamplerate.wasm") {
			resolve({
				init: () => {},
				sourceArray: () => {},
				targetArray: () => {},
			});
		} else {
			throw "couldnt find wasm file";
		}
	});
}

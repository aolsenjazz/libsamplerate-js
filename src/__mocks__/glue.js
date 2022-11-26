// mock for the real LoadSRC. ignore me
export default function LoadSRC(overrides) {
	return new Promise((resolve, reject) => {
			resolve({
				init: () => {},
				sourceArray: () => {},
				targetArray: () => {},
			});
	});
}

import { create } from "../src/libsamplerate";

test("creating SRC with converterType < 0 fails", async () => {
	let nChannels = 2;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;

	try {
		await create(nChannels, inputSampleRate, outputSampleRate, { converterType: -1 })
	} catch (e) {
		expect(e).toEqual("invalid converterType")
	}
});

test("creating SRC with nChannels < 0 fails", async () => {
	let nChannels = -1;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;

	try {
		await create(nChannels, inputSampleRate, outputSampleRate, { converterType: -1 })
	} catch (e) {
		expect(e).toEqual("invalid nChannels submitted")
	}
});

test("creating SRC with nChannels == undefined fails", async () => {
	try {
		await create()
	} catch (e) {
		expect(e).toEqual("nChannels is undefined")
	}
});

test("creating SRC with nChannels > 128 fails", async () => {
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;
	let nChannels = 129;

	try {
		await create(nChannels, inputSampleRate, outputSampleRate, { converterType: -1 })
	} catch (e) {
		expect(e).toEqual("invalid nChannels submitted")
	}
});

test("creating SRC with inputSampleRate < 0 fails", async () => {
	let nChannels = 2;
	let inputSampleRate = -1;
	let outputSampleRate = 44100;

	try {
		await create(nChannels, inputSampleRate, outputSampleRate, { converterType: -1 })
	} catch (e) {
		expect(e).toEqual("invalid inputSampleRate")
	}
});

test("creating SRC with outputSampleRate < 0 fails", async () => {
	let nChannels = 2;
	let inputSampleRate = 44100;
	let outputSampleRate = -1;

	try {
		await create(nChannels, inputSampleRate, outputSampleRate, { converterType: -1 })
	} catch (e) {
		expect(e).toEqual("invalid outputSampleRate")
	}
});

test("creating SRC with inputSampleRate > 192k fails", async () => {
	let nChannels = 2;
	let inputSampleRate = 193000;
	let outputSampleRate = 44100;

	try {
		await create(nChannels, inputSampleRate, outputSampleRate, { converterType: -1 })
	} catch (e) {
		expect(e).toEqual("invalid inputSampleRate")
	}
});

test("creating SRC with outputSampleRate > 192k fails", async () => {
	let nChannels = 2;
	let inputSampleRate = 44100;
	let outputSampleRate = 193000;

	try {
		await create(nChannels, inputSampleRate, outputSampleRate, { converterType: -1 })
	} catch (e) {
		expect(e).toEqual("invalid outputSampleRate")
	}
});

test("creating SRC with inputSampleRate == undefined fails", async () => {
	let nChannels = 2;

	try {
		await create(nChannels)
	} catch (e) {
		expect(e).toEqual("inputSampleRate is undefined")
	}
});

test("creating SRC with outputSampleRate == undefined fails", async () => {
	let nChannels = 2;
	let inputSampleRate = 44100;

	try {
		await create(nChannels, inputSampleRate);
	} catch (e) {
		expect(e).toEqual("outputSampleRate is undefined")
	}
});

test("good loading causes promise resolve()", (done) => {
	let nChannels = 2;
	let inputSampleRate = 44100;
	let outputSampleRate = 44100;

	create(nChannels, inputSampleRate, outputSampleRate)
		.then(() => {
			done();
		})
		.catch((e) => {
			console.log(e);
			throw new Error(e);
		});
});
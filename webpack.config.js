const path = require("path");

module.exports = {
	module: {
		rules: [{ test: /\.ts?$/, loader: "ts-loader", exclude: /node_modules/ }],
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	entry: path.join(__dirname, "src", "libsamplerate.ts"),
	mode: "production",
	output: {
		filename: "libsamplerate.js",
		chunkFilename : "[name].js",
		path: path.resolve(__dirname, "dist"),
		library: "LibSampleRate",
		libraryTarget: "umd",
		globalObject: "this",
	},
};

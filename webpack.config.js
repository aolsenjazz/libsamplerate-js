const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/preset-env', { targets: 'defaults' }]
						]
					}
				}
			},
		]
	},
	entry: path.join(__dirname, 'src', 'libsamplerate.js'),
	mode: 'production',
	output: {
		filename: 'libsamplerate.js',
		path: path.resolve(__dirname, 'dist'),
		library: 'LibSampleRate',
		libraryTarget: 'umd',
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: path.join(__dirname, 'src', 'wasm-src.wasm'), to: 'wasm-src.wasm' },
				{ from: path.join(__dirname, 'src', 'wasm-src.wasm'), to: path.join(__dirname, '..', 'benchmarks', 'wasm-src.wasm') },
				{ from: path.join(__dirname, 'src', 'wasm-src.wasm'), to: path.join(__dirname, '..', 'examples', 'worker', 'wasm-src.wasm') }
			]
		})
	],
}
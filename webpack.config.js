const path = require('path');

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
}
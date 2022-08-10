const path = require('path');

module.exports = {
	entry: path.join(__dirname, 'src', 'index.js'),
	mode: 'development',  
	output: {
		path: path.resolve('.'),
		filename: 'main.js'
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				include: [
					path.resolve(__dirname, 'src')
				],
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							['@babel/preset-env', { targets: 'defaults' }]
						]
					}
				}
			},
			{
				test: /\.(d.ts)$/,
    	  loader: 'ignore-loader',
			},
			{
				test: /worker\.js$/,
				use: { loader: "worker-loader" },
			},
		]
	},
	resolve: {
		fallback: {
			"fs": false,
			"path": false
		}
	}
}

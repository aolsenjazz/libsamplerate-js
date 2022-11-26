const path = require("path");

module.exports = {
	entry: path.join(__dirname, "src", "index.js"),
	mode: "development",
	output: {
		path: path.resolve("."),
		filename: "main.js",
	},
	module: {
		rules: [
			{
				test: /\.(d.ts)$/,
    	  loader: 'ignore-loader',
			},
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				include: [path.resolve(__dirname, "src")],
				use: {
					loader: "babel-loader",
					options: {
						presets: [["@babel/preset-env", { targets: "defaults" }]],
					},
				},
			},
		],
	},
	resolve: {
		fallback: {
			fs: false,
			path: false,
		},
	},
};

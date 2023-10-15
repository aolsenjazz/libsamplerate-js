const path = require('path');

const sharedConfig = {
  module: {
    rules: [{ test: /\.ts?$/, loader: 'ts-loader', exclude: /node_modules/ }],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  mode: 'production',
};

const umdConfig = {
  ...sharedConfig,
  entry: path.join(__dirname, 'src', 'libsamplerate.ts'),
  output: {
    filename: 'libsamplerate.js',
    path: __dirname + '/dist',
    libraryTarget: 'umd',
    library: 'LibSampleRate',
    globalObject: 'this',
  },
};

const workletConfig = {
  ...sharedConfig,
  entry: path.join(__dirname, 'src', 'libsamplerate.ts'),
  output: {
    filename: 'libsamplerate.worklet.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'module',
  },
  experiments: {
    outputModule: true,
  },
};

module.exports = [umdConfig, workletConfig];

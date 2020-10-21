// const path = require('path');
// const pkg = require('./package.json');
const WebpackAssetsManifest = require('webpack-assets-manifest');

module.exports = {
  // entry: './lib/google-file-picker.js',
  devtool: 'source-map',
  mode: 'development',
  output: {
    libraryTarget: 'umd',
    filename: 'google-file-picker.js'
  },
  plugins: [
    new WebpackAssetsManifest({
      writeToDisk: true,
      integrity: true,
    }),
  ],
};

// const path = require('path');
// const pkg = require('./package.json');
const WebpackAssetsManifest = require('webpack-assets-manifest');

module.exports = {
  devtool: 'source-map',
  mode: 'development',
  output: {
    libraryTarget: 'umd',
    filename: 'example.js'
  },
  plugins: [
    new WebpackAssetsManifest({
      writeToDisk: true,
      integrity: true,
    }),
  ],
};

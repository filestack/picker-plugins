const path = require('path');
const pkg = require('./package.json');

module.exports = {
  // entry: './lib/google-file-picker.js',
  devtool: 'source-map',
  mode: 'development',
  output: {
    libraryTarget: 'umd',
    filename: 'google-file-picker.js'
  },
};

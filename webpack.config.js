module.exports = {
  entry: './src/index.js',
  output: {
    path: './dist/',
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      }
    ]
  },
}
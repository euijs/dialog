var path = require('path');
var webpack = require('webpack');
var config = require('./config');
var debug = config.debug;
var plugins = [
  new webpack.DefinePlugin({
    __DEV__: debug
  }),
  new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
  ),
  new webpack.BannerPlugin(' eui-dialog v1.0.0 \r\n 一个简单又优雅的弹出层组件 \r\n https://github.com/eeve/eui-dialog'),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.NoErrorsPlugin()
];

if(!debug){
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      test: /(\.js)$/,
      compress: {
        warnings: false
      }
    })
  );
}

var embedFileSize = 65536;

var config = {
  context: __dirname,
  entry: {
    index: './index.js'
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].js',
    library: '$dialog',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  plugins: plugins,
  devtool: '#source-map',
  module:{
    loaders:[
      { test: /\.png$/, loader: 'url?limit=' + embedFileSize + '&mimetype=image/png' }
      ,{ test: /\.jpg$/, loader: 'url?limit=' + embedFileSize + '&mimetype=image/jpeg' }
      ,{ test: /\.gif$/, loader: 'url?limit=' + embedFileSize + '&mimetype=image/gif' }
      ,{ test: /\.css$/, loader: 'style!css' }
      ,{ test: /\.tpl$/, loader: 'raw' }
      ,{ test: /\.less$/, loader: 'style!raw!less' }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.less', '.tpl'],
    modulesDirectories: ["node_modules", "bower_components"]
  }
};

module.exports = config;

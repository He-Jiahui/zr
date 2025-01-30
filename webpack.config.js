const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
module.exports = {
  entry: './src/index.ts', // 入口文件
  devtool: 'inline-source-map', // 开发模式下方便查错
  devServer: {
    contentBase: './dist', // 告诉服务器从哪个文件夹提供内容
  },
  target: 'node',
  externals: [nodeExternals()],
  output: {
    filename: 'bundle.js', // 输出文件名
    path: path.resolve(__dirname, 'dist'), // 输出路径
  },
  resolve: {
    extensions: ['.ts', '.js'], // 解析文件时自动补全的扩展名
  },
  optimization: {
    minimize: false, // 禁用代码压缩
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // 匹配所有以 .ts 结尾的文件
        
        loader: 'ts-loader', // 使用 ts-loader 来处理 .ts 文件
        
        exclude: /node_modules/, // 排除 node_modules 目录
        options: {
          transpileOnly: true, // 跳过类型检查
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(), // 每次构建前清除输出目录
  ],
};
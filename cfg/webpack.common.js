const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, '../src/index.ts'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'index.js',
    library: {
      type: 'commonjs-static',
    },
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, '../tsconfig.json'),
        mode: 'write-dts',
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../package.json')
        },
        {
          from: path.resolve(__dirname, '../README.md')
        },
        {
          from: path.resolve(__dirname, '../LICENCE')
        },
      ]
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", "..."],
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
  }
};

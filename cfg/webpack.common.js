import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: {
    index: path.resolve(__dirname, '../src/index.ts'),
    registry: path.resolve(__dirname, '../src/registry/index.ts'),
    emitter: path.resolve(__dirname, '../src/emitter/index.ts'),
    common: path.resolve(__dirname, '../src/common/index.ts'),
    slice: path.resolve(__dirname, '../src/slice/index.ts'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
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
          from: path.resolve(__dirname, '../package.json'),
        },
        {
          from: path.resolve(__dirname, '../README.md'),
        },
        {
          from: path.resolve(__dirname, '../LICENCE'),
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '...'],
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    registry: './registry.js',
    emitter: './emitter.js',
    common: './common.js',
    slice: './slice.js',
  },
};

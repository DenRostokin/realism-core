import { merge } from 'webpack-merge';
import webpackCommonConfig from './webpack.common.js';

export default merge(
  {
    mode: 'development',
    devtool: 'inline-source-map',
    watch: true,
    watchOptions: {
      ignored: /dist/,
    },
  },
  webpackCommonConfig
);

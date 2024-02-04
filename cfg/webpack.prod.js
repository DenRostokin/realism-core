import { merge } from 'webpack-merge';
import webpackCommonConfig from './webpack.common.js';

export default merge(
  {
    mode: 'production',
  },
  webpackCommonConfig
);

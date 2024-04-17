import { merge } from 'webpack-merge';
import webpackCommonConfig from './webpack.common.mjs';

export default merge(
  {
    mode: 'production',
  },
  webpackCommonConfig
);

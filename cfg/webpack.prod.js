const { merge } = require("webpack-merge");
const webpackCommonConfig = require("./webpack.common");

module.exports = merge(
  {
    mode: "production",
  },
  webpackCommonConfig
);

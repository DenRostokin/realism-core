const { merge } = require("webpack-merge");
const webpackCommonConfig = require("./webpack.common");

module.exports = merge(
  {
    mode: "development",
    devtool: "inline-source-map",
    watch: true,
    watchOptions: {
      ignored: /dist/,
    },
  },
  webpackCommonConfig
);

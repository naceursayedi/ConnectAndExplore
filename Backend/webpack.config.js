// webpack.config.js
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
module.exports = {
  entry: "./server.ts", // Match all .ts files inside the src folder
  mode: "production", // Set to 'production' for optimizations
  target: "node",
  externals: [nodeExternals()],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js", ".json", ".yaml", ".yml"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [/node_modules/, /tests/],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // Preserve comments
        terserOptions: {
          output: {
            comments: "all", // Preserve all comments
          },
        },
      }),
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "certificates", to: "certificates" },
        { from: "database", to: "database" },
        "./node_modules/swagger-ui-dist/swagger-ui.css",
        "./node_modules/swagger-ui-dist/swagger-ui-bundle.js",
        "./node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js",
        "./node_modules/swagger-ui-dist/favicon-16x16.png",
        "./node_modules/swagger-ui-dist/favicon-32x32.png",
      ],
    }),
  ],
};

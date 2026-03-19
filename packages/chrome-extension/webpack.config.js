const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";
  const target = env?.target || "chrome"; // "chrome" or "firefox"
  const outDir = target === "firefox" ? "dist-firefox" : "dist";
  const manifestFile =
    target === "firefox" ? "manifest.firefox.json" : "manifest.json";

  return {
    entry: {
      background: "./src/background.ts",
      content: "./src/content.ts",
      inject: "./src/inject.ts",
      popup: "./src/popup/popup.ts",
    },
    output: {
      path: path.resolve(__dirname, outDir),
      filename: "[name].js",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
      fallback: {
        crypto: false,
        stream: false,
        buffer: false,
      },
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: "[name].css" }),
      new HtmlWebpackPlugin({
        template: "./src/popup/popup.html",
        filename: "popup.html",
        chunks: ["popup"],
      }),
      new CopyPlugin({
        patterns: [
          { from: manifestFile, to: "manifest.json" },
          { from: "icons", to: "icons", noErrorOnMissing: true },
        ],
      }),
    ],
    devtool: isProd ? false : "cheap-module-source-map",
    optimization: {
      minimize: isProd,
    },
  };
};

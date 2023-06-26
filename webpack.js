const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  return {
    mode: argv.mode,
    devtool: argv.mode === "development" ? "inline-source-map" : "source-map",
    devServer: {
      hot: true,
      port: 9000,
    },
    entry: {
      popup: path.resolve("src/popup/index.tsx"),
      background: path.resolve("src/background/background.ts"),
      contentScript: path.resolve("src/contentScript/index.tsx"),
    },
    output: {
      publicPath: "/",
      filename: "[name].js",
      path: path.resolve(__dirname, "./dist"),
    },
    optimization: { concatenateModules: true },

    module: {
      rules: [
        {
          use: "ts-loader",
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
        },
        {
          test: /\.html$/,
          use: ["html-loader"],
        },
        {
          test: /\.(css|scss)$/i,
          exclude: /src\/contentScript\/styles/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(css|scss)$/i,
          include: /src\/contentScript\/styles/,
          use: [MiniCSSExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: /\.(png|jpg|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(ttf|otf|woff|woff2)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({
        React: "react",
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
      }),

      new MiniCSSExtractPlugin({
        filename: "styles/web3-hovercard.css",
      }),
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: true,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve("src/static"),
            to: path.resolve("dist"),
          },
        ],
      }),
      ...getHtmlPlugins(["popup", "contentScript"]),
    ],

    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        web3: require.resolve("web3"),
      },
      fallback: {
        buffer: require.resolve("buffer"),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        assert: require.resolve("assert"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify"),
        url: require.resolve("url"),
      },
    },
  };
};

function getHtmlPlugins(chunks) {
  return chunks.map(
    chunk =>
      new HtmlPlugin({
        title: "Web3 Hovercards",
        filename: `${chunk}.html`,
        chunks: [chunk],
        meta: {
          charset: "utf-8",
          viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
          "theme-color": "#ffffff",
        },
      })
  );
}

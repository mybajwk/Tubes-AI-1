// webpack.config.js

const path = require("path");

module.exports = {
  entry: "./src/script.js", // Entry point of your application
  output: {
    filename: "bundle.js", // Output bundle file
    path: path.resolve(__dirname, "dist"), // Output directory
    publicPath: "/dist/", // Public URL of the output directory when referenced in a browser
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Use Babel to transpile JavaScript files
          options: {
            presets: ["@babel/preset-env"], // Preset to transpile ES6+ code
          },
        },
      },
    ],
  },
  mode: "development", // Set the mode to development
  devtool: "source-map", // Generate source maps for debugging
};

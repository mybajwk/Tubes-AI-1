const express = require("express");
const path = require("path");

const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackConfig = require("./webpack.config.js");

const app = express();

const compiler = webpack(webpackConfig);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(express.static("public"));

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

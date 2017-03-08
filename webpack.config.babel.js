import path from "path";
import CleanWebpackPlugin from "clean-webpack-plugin";
import StringReplacePlugin from "string-replace-webpack-plugin";

export default {
  entry: "./src",
  output: {
    path: "./dist",
    filename: "pdfmake-browser.js",
    libraryTarget: "umd"
  },
  resolve: {
    alias: {
      fs: path.join(__dirname, "./src/fakeFs.js")
    }
  },
  node: {
    Buffer: false
  },
  externals: (context, request, done) => {
    if (!request.startsWith("./") &&
      !request.startsWith("../") &&
      !request.startsWith("pdfmake") &&
      !request.startsWith("pdfkit") &&
      !request.startsWith("linebreak") &&
      !request.startsWith("base64-js") &&
      !request.startsWith("png-js") &&
      request !== "fs"
    ) return done(null, request);

    done();
  },
  module: {
    loaders: [{
      test: /\.js$/,
      include: [path.resolve(__dirname, "src")],
      loader: "babel-loader"
    }, {
      test: /\.json$/,
      loader: "json-loader"
    }, {
      test: /pdfkit[\/\\]js[\/\\]mixins[\/\\]fonts.js$/,
      loader: StringReplacePlugin.replace({
        replacements: [{
          pattern: "return this.font('Helvetica');",
          replacement: () => ""
        }]
      })
    }]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new StringReplacePlugin()
  ]
};

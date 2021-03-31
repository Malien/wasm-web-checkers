import path from "path";
// import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

module.exports = {
    entry: "./src/main.ts",
    devtool: "inline-source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node-modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                  // Creates `style` nodes from JS strings
                  "style-loader",
                  // Translates CSS into CommonJS
                  "css-loader",
                  // Compiles Sass to CSS
                  "sass-loader",
                ],
            }
        ],
    },
    plugins: [
        // new HtmlWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "src/main.pl", to: "." },
                { from: "swipl-wasm/dist", to: "swipl-wasm" },
                { from: "src/index.html", to: "." }
            ],
        }),
    ],
}

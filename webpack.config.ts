import path from "path"
// import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin"
import autoprefixer from "autoprefixer"

module.exports = {
    entry: {
        main: "./src/main.ts",
        worker: "./src/worker.ts",
        sw: "./src/sw.ts",
        styles: "./src/styles.sass",
    },
    devtool: "inline-source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    output: {
        filename: "[name].js",
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
                    {
                        loader: "file-loader",
                        options: {
                            name: "styles.css",
                        },
                    },
                    "extract-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [autoprefixer()],
                            },
                        },
                    },
                    // Compiles Sass to CSS
                    {
                        loader: "sass-loader",
                        options: {
                            implementation: require('sass'),

                            webpackImporter: false,
                            sassOptions: {
                                includePaths: ["./node_modules"],
                            },
                        }
                    },
                ],
            },
        ],
    },
    plugins: [
        // new HtmlWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "public/index.html", to: "." },
                { from: "public/manifest.json", to: "." },
                { from: "src/main.pl", to: "." },
                { from: "swipl-wasm/dist", to: "swipl-wasm" },
            ],
        }),
    ],
}

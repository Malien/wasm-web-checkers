import path from "path"
// import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin"
import autoprefixer from "autoprefixer"
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

module.exports = {
    mode: "production",
    devtool: "source-map",
    entry: {
        main: "./src/main.ts",
        worker: "./src/worker.ts",
        sw: "./src/sw.ts",
        styles: "./src/styles.sass",
    },
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
                "public/index.html",
                "public/manifest.json",
                "public/icon@1x.png",
                "public/icon@1.5x.png",
                "public/icon@2x.png",
                "public/icon@3x.png",
                "public/icon@4x.png",
                "src/main.pl",
                // { from: "public/*", to: ".", flatten: true },
                // { from: "src/main.pl", to: "." },
                { from: "swipl-wasm/dist", to: "swipl-wasm" },
            ],
        }),
    ],
    optimization: {
        minimizer: [
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                map: {
                  inline: false,
                  annotation: true,
                },
              },
            }),
            new TerserPlugin({
                // Use multi-process parallel running to improve the build speed
                // Default number of concurrent runs: os.cpus().length - 1
                parallel: true,
                terserOptions: {
                    sourceMap: true
                },
              }),
        ]
    }
}

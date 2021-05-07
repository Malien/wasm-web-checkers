import path from "path"
import webpack from "webpack"
import CopyPlugin from "copy-webpack-plugin"

export default {
    devtool: "source-map",
    entry: {
        main: "./src/main.ts",
        "swipl-worker": "./src/swipl/worker.ts",
        "js-worker": "./src/js/worker.ts",
        "rs-worker": "./src/rs/worker.ts",
        sw: "./src/sw.ts",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    output: {
        filename: "[name].js",
        path: path.resolve(process.cwd(), "dist"),
    },
    module: {
        rules: [
            // For some reason sometimes including import.meta.url
            // in some packages triggers webpack to include it's 
            // "jsonp chunk loading" module to resolve import.meta.url.
            // This relies on document to be defined 
            // WHICH IS NOT THE CASE IN WORKERS! HOW WEBPACK?!
            // HOW THE FUCK YOU MANAGED TO SCREW THIS UP???
            //
            // So yeah, I'm just replacing import.meta.url before
            // webpack manages to do it's shitty thing.
            // If you rely on this behavior... Too bad.
            {
                test: /checkers-rs.js$/,
                loader: "string-replace-loader",
                options: {
                    search: "import.meta.url",
                    replace: "self.location.href"
                }
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node-modules/,
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
                "src/swipl/main.pl",
                { from: "src/rs/checkers/pkg/checkers-rs_bg.wasm", to: "checkers-rs.wasm" },
                { from: "swipl-wasm/dist", to: "swipl-wasm" },
            ],
        }),
    ],
}

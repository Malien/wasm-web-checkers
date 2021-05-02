import path from "path"
import CopyPlugin from "copy-webpack-plugin"

export default {
    devtool: "source-map",
    entry: {
        main: "./src/main.ts",
        "swipl-worker": "./src/swipl/worker.ts",
        "js-worker": "./src/js/worker.ts",
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
                { from: "swipl-wasm/dist", to: "swipl-wasm" },
            ],
        }),
    ],
}

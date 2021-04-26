import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"
import merge from "webpack-merge"
import baseConfig from "./webpack.config.base"

export default merge<any>(baseConfig, {
    mode: "production",
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
                    sourceMap: true,
                },
            }),
        ],
    },
})

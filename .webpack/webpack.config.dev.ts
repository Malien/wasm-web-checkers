import merge from "webpack-merge"
import baseConfig from "./webpack.config.base"

export default merge<any>(baseConfig, {
    mode: "development",
    devtool: "inline-source-map",
    optimization: {
        minimize: false
    }
})

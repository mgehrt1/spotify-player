import * as path from "path";
import * as webpack from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const extConfig: webpack.Configuration = {
    mode: "development",
    target: "node",
    entry: "./src/extension.ts",
    output: {
        filename: "extension.js",
        libraryTarget: "commonjs2",
        path: path.resolve(__dirname, "out"),
    },
    resolve: { extensions: [".ts", ".js"] },
    module: { rules: [{ test: /\.ts$/, loader: "ts-loader" }] },
    externals: { vscode: "vscode" },
    watch: true,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/,
    },
    devtool: "source-map",
};

const webviewConfig: webpack.Configuration = {
    mode: "development",
    target: "web",
    entry: "./src/webview/index.tsx",
    output: {
        filename: "[name].wv.js",
        path: path.resolve(__dirname, "out"),
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: ["babel-loader", "ts-loader"] },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].wv.css",
        }),
    ],
    watch: true,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/,
    },
    devtool: "source-map",
};

export default [webviewConfig, extConfig];

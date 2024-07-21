import * as path from "path";
import * as webpack from "webpack";

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
    watch: true, // Enable watch mode
    // Optional: Watch options can be configured here
    watchOptions: {
        aggregateTimeout: 300, // Delay in ms after the last change to rebuild
        poll: 1000, // Check for changes every second
        ignored: /node_modules/, // Ignore changes in node_modules
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
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    watch: true, // Enable watch mode
    // Optional: Watch options can be configured here
    watchOptions: {
        aggregateTimeout: 300, // Delay in ms after the last change to rebuild
        poll: 1000, // Check for changes every second
        ignored: /node_modules/, // Ignore changes in node_modules
    },
    devtool: "source-map",
};

export default [webviewConfig, extConfig];

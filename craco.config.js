const nodeExternals = require("webpack-node-externals");
module.exports = {
    webpack: {
        configure: {
            target: "electron-renderer",
            externals: [
                nodeExternals({
                    allowlist: [/webpack(\/.*)?/, "electron-devtools-installer"],
                }),
            ],
        },
    },
    module: {
        rules: [
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: require.resolve("url-loader"),
                options: {
                    limit: 10000,
                    name: "static/media/[name].[hash:8].[ext]",
                },
            },
            {
                test: [/\.eot$/, /\.ttf$/, /\.svg$/, /\.woff$/, /\.woff2$/],
                loader: require.resolve("file-loader"),
                options: {
                    name: "/static/media/[name].[hash:8].[ext]",
                },
            }
        ]
    }
};
const path = require("path"),
    fs = require("fs"),
    _ = require("lodash"),
    HtmlWebpackPlugin = require("html-webpack-plugin")

const dev = process.env.NODE_ENV !== "production"

const testCases = ((dir = "./test/case") => {
    let tc = []
    let entries = fs.readdirSync(dir)

    _.forEach(entries, item => {
        let p = path.resolve(dir, item)
        if (path.extname(p) === ".js") {
            tc.push({
                name: path.basename(p).replace(".js", ""),
                js: p,
                html: p.replace(".js", ".html")
            })
        }
    })
    return tc
})()

module.exports = function (env, argv) {
    return {
        entry: {
            index: "./src/geomtoy/index.ts",
            ...(() => {
                if (!dev) return {}
                let tc = {}
                _.forEach(testCases, o => {
                    tc[o.name] = o.js
                })
                return tc
            })()
        },
        output: {
            path: path.join(__dirname, "./dist"),
            filename: "[name].js"
        },
        devtool: dev ? "eval-cheap-module-source-map" : "source-map",
        devServer: {
            contentBase: path.join(__dirname, "public"),
            // compress: true,
            historyApiFallback: true,
            hot: true
        },
        resolve: {
            extensions: [".js", ".ts"]
        },
        // target: "web",

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                }
            ]
        },
        plugins: [
            ...(() => {
                if (!dev) return []
                let tc = []
                _.forEach(testCases, o => {
                    tc.push(
                        new HtmlWebpackPlugin({
                            template: o.html,
                            filename: path.basename(o.html),
                            chunks:[o.name] 
                        })
                    )
                })
                return tc
            })()
        ]
    }
}

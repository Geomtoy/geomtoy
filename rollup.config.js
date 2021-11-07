const babel = require("@rollup/plugin-babel").default
const nodeResolve = require("@rollup/plugin-node-resolve").default
const { terser } = require("rollup-plugin-terser")
const html = require("@rollup/plugin-html").default
const serve = require("rollup-plugin-serve")
const livereload = require("rollup-plugin-livereload")
const dts = require("rollup-plugin-dts").default
const pkg = require("./package.json")

const fs = require("fs")
const path = require("path")

const task = process.env.TASK
const extensions = [".js", ".ts"]
const exclude = "./node_modules/**"

let config = null

switch (task) {
    case "bundle-js": {
        config = {
            input: path.resolve(pkg.config.srcDir, pkg.config.srcIndex),
            output: [
                {
                    file: path.resolve(pkg.config.distDir, pkg.name + ".esm.js"),
                    format: "esm"
                },
                {
                    file: path.resolve(pkg.config.distDir, pkg.name + ".umd.js"),
                    name: pkg.config.umdName,
                    format: "umd",
                    amd: { id: pkg.config.umdName },
                    sourcemap: true
                },
                {
                    file: path.resolve(pkg.config.distDir, pkg.name + ".umd.min.js"),
                    format: "umd",
                    name: pkg.config.umdName,
                    amd: { id: pkg.config.umdName },
                    plugins: [terser()]
                }
            ],
            plugins: [nodeResolve({ extensions }), babel({ babelHelpers: "bundled", extensions, exclude })]
        }
        break
    }

    case "bundle-dts": {
        config = {
            input: path.resolve(pkg.config.declsGenDir, pkg.config.srcIndex.replace(/\.ts$/, ".d.ts")),
            output: {
                file: path.resolve(pkg.config.distDir, pkg.name + ".d.ts"),
                format: "esm"
            },
            plugins: [dts()]
        }
        break
    }

    default: {
        const exampleSrcPath = path.resolve(pkg.config.examplesDir, "src")
        const exampleDistPath = path.resolve(pkg.config.examplesDir, "dist")
        const exampleDefaultHtmlPath = path.resolve(pkg.config.examplesDir, "src", "default.html")
        const host = "localhost"
        const port = 1347
        const fileRecursive = (dir, callback, withoutDirName) => {
            const entries = fs.readdirSync(dir)
            entries.forEach(entry => {
                const entryPath = path.resolve(dir, entry)
                if (fs.statSync(entryPath).isDirectory() && entry !== withoutDirName) {
                    fileRecursive(entryPath, callback, withoutDirName)
                } else {
                    callback(entryPath)
                }
            })
        }
        const injectScript = (html, scriptSrc) => {
            return html.replace(/<body>([\s\S]+?)<\/body>/, (m0, m1) => `<body>${m1}\n\x20\x20\x20\x20<script src="${scriptSrc}" type="module"></script></body>`)
        }
        const examples = (() => {
            const ret = []
            fileRecursive(
                exampleSrcPath,
                filePath => {
                    if ([".js", ".ts"].includes(path.extname(filePath))) {
                        ret.push({
                            fileNameWithoutExt: filePath.replace(path.resolve(exampleSrcPath) + path.sep, "").replace(/\.(js|ts)$/, ""),
                            jsPath: filePath
                        })
                    }
                },
                "assets"
            )
            return ret
        })()

        config = [
            {
                input: {
                    ...examples.reduce((result, item) => {
                        result[item.fileNameWithoutExt] = item.jsPath
                        return result
                    }, {})
                },
                output: { dir: exampleDistPath, chunkFileNames: "assets/[name].js" },
                plugins: [
                    nodeResolve({ extensions }),
                    babel({ babelHelpers: "bundled", extensions, exclude }),
                    ...examples.map(item => {
                        const htmlPath = item.jsPath.replace(/\.(js|ts)$/, ".html")
                        return html({
                            fileName: item.fileNameWithoutExt + ".html",
                            template: () => {
                                const htmlContent = fs.readFileSync(fs.existsSync(htmlPath) ? htmlPath : exampleDefaultHtmlPath, "utf-8")
                                return injectScript(htmlContent, `./${path.basename(item.jsPath.replace(/\.(js|ts)$/, ".js"))}`)
                            }
                        })
                    }),
                    serve({
                        contentBase: exampleDistPath,
                        open: true,
                        host: host,
                        port: port
                    }),
                    livereload(exampleDistPath)
                ]
            }
        ]
    }
}

export default config

import babel from "@rollup/plugin-babel"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import html from "@rollup/plugin-html"
import serve from "rollup-plugin-serve"
import livereload from "rollup-plugin-livereload"
import fs from "fs"
import path from "path"

const dev = process.env.NODE_ENV !== "production"

const exampleSrcPath = "./examples/src",
    exampleDistPath = "./examples/dist",
    exampleDefaultHtmlPath = "./examples/src/default.html",
    fileRecursive = (dir, callback, withoutDirName) => {
        let entries = fs.readdirSync(dir)
        entries.forEach(entry => {
            let entryPath = path.resolve(dir, entry)
            if (fs.statSync(entryPath).isDirectory() && entry !== withoutDirName) {
                fileRecursive(entryPath, callback, withoutDirName)
            } else {
                callback(entryPath)
            }
        })
    },
    appendModuleScriptToBody = (html, scriptSrc) => {
        return html.replace(/<body>([\s\S]+?)<\/body>/, function ($0, $1) {
            return `<body>${$1}\n    <script src="${scriptSrc}" type="module"></script></body>`
        })
    },
    examples = (() => {
        let ret = []
        fileRecursive(
            exampleSrcPath,
            filePath => {
                if (path.extname(filePath) === ".js" || path.extname(filePath) === ".ts") {
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

const devConfig = [
    {
        input: {
            ...examples.reduce((result, item) => {
                result[item.fileNameWithoutExt] = item.jsPath
                return result
            }, {})
        },
        output: { dir: exampleDistPath, chunkFileNames: "[name].js" },
        plugins: [
            nodeResolve({
                extensions: [".js", ".ts"]
            }),
            babel({ babelHelpers: "bundled", extensions: [".js", ".ts"], exclude: "./node_modules/**" }),
            ...examples.reduce((result, item) => {
                let htmlPath = item.jsPath.replace(/\.(js|ts)$/, ".html")
                result.push(
                    html({
                        fileName: item.fileNameWithoutExt + ".html",
                        template: () => {
                            let htmlContent = fs.readFileSync(fs.existsSync(htmlPath) ? htmlPath : exampleDefaultHtmlPath, "utf-8")
                            return appendModuleScriptToBody(htmlContent, `./${path.basename(item.jsPath)}`)
                        }
                    })
                )
                return result
            }, []),
            serve(exampleDistPath),
            livereload(exampleDistPath)
        ]
    }
]

const prdConfig = {
    input: "./src/geomtoy/index.ts",
    output: [
        {
            file: "./dist/rollup/bundle.esm.js",
            format: "esm"
        },
        {
            file: "./dist/rollup/bundle.umd.js",
            name: "Geomtoy",
            format: "umd",
            sourcemap: true
        },
        {
            file: "./dist/rollup/bundle.umd.min.js",
            format: "umd",
            name: "Geomtoy",
            plugins: [terser()]
        }
    ],
    plugins: [
        nodeResolve({
            extensions: [".js", ".ts"]
        }),
        babel({ babelHelpers: "bundled", extensions: [".js", ".ts"], exclude: "./node_modules/**" })
    ]
}

export default dev ? devConfig : prdConfig

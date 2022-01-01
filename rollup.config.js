const babel = require("@rollup/plugin-babel").default;
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const { terser } = require("rollup-plugin-terser");
const html = require("@rollup/plugin-html").default;
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");
const dts = require("rollup-plugin-dts").default;

const fs = require("fs");
const path = require("path");

const task = process.env.TASK;
const extensions = [".js", ".ts"];
const exclude = "./node_modules/**";

const pkgConfig = {
    geomtoy: {
        src: "src/geomtoy/index.ts",
        capitalName: "Geomtoy",
        distName: "geomtoy"
    },
    geomtoyKit: {
        src: "src/geomtoy-kit/index.ts",
        capitalName: "GeomtoyKit",
        distName: "geomtoy-kit"
    },
    examplesDir: "examples",
    distDir: "dist",
    declsGenDir: "decls"
};

let config = null;

switch (task) {
    case "bundle-js": {
        config = [pkgConfig.geomtoy, pkgConfig.geomtoyKit].map(c => {
            return {
                input: c.src,
                output: [
                    {
                        file: path.resolve(pkgConfig.distDir, c.distName + ".esm.js"),
                        format: "esm"
                    },
                    {
                        file: path.resolve(pkgConfig.distDir, c.distName + ".umd.js"),
                        format: "umd",
                        name: c.capitalName,
                        amd: { id: c.distName },
                        sourcemap: true
                    },
                    {
                        file: path.resolve(pkgConfig.distDir, c.distName + ".umd.min.js"),
                        format: "umd",
                        name: c.capitalName,
                        amd: { id: c.distName },
                        plugins: [terser()]
                    }
                ],
                plugins: [nodeResolve({ extensions }), babel({ babelHelpers: "bundled", extensions, exclude })]
            };
        });
        break;
    }
    case "bundle-dts": {
        config = [pkgConfig.geomtoyKit, pkgConfig.geomtoy].map(c => {
            return {
                input: path.resolve(pkgConfig.declsGenDir, c.distName, "index.d.ts"),
                output: {
                    file: path.resolve(pkgConfig.distDir, c.distName + ".d.ts"),
                    format: "esm"
                },
                plugins: [dts()]
            };
        });
        break;
    }

    default: {
        const exampleSrcPath = path.resolve(pkgConfig.examplesDir, "src");
        const exampleDistPath = path.resolve(pkgConfig.examplesDir, "dist");
        const exampleDefaultHtmlPath = path.resolve(pkgConfig.examplesDir, "src", "default.html");
        const host = "0.0.0.0";
        const port = 1347;
        const fileRecursive = (dir, callback, withoutDirName) => {
            const entries = fs.readdirSync(dir);
            entries.forEach(entry => {
                const entryPath = path.resolve(dir, entry);
                if (fs.statSync(entryPath).isDirectory() && entry !== withoutDirName) {
                    fileRecursive(entryPath, callback, withoutDirName);
                } else {
                    callback(entryPath);
                }
            });
        };
        const injectScript = (html, scriptSrc) => {
            return html.replace(/<body>([\s\S]+?)<\/body>/, (m0, m1) => `<body>${m1}\n\x20\x20\x20\x20<script src="${scriptSrc}" type="module"></script></body>`);
        };
        const examples = (() => {
            const ret = [];
            fileRecursive(
                exampleSrcPath,
                filePath => {
                    if ([".js", ".ts"].includes(path.extname(filePath))) {
                        ret.push({
                            fileNameWithoutExt: filePath.replace(path.resolve(exampleSrcPath) + path.sep, "").replace(/\.(js|ts)$/, ""),
                            jsPath: filePath
                        });
                    }
                },
                "assets"
            );
            return ret;
        })();

        config = [
            {
                input: {
                    ...examples.reduce((result, item) => {
                        result[item.fileNameWithoutExt] = item.jsPath;
                        return result;
                    }, {})
                },
                output: { dir: exampleDistPath, chunkFileNames: "assets/[name].js" },
                plugins: [
                    nodeResolve({ extensions }),
                    babel({ babelHelpers: "bundled", extensions, exclude }),
                    ...examples.map(item => {
                        const htmlPath = item.jsPath.replace(/\.(js|ts)$/, ".html");
                        return html({
                            fileName: item.fileNameWithoutExt + ".html",
                            template: () => {
                                const htmlContent = fs.readFileSync(fs.existsSync(htmlPath) ? htmlPath : exampleDefaultHtmlPath, "utf-8");
                                return injectScript(htmlContent, `./${path.basename(item.jsPath.replace(/\.(js|ts)$/, ".js"))}`);
                            }
                        });
                    }),
                    serve({
                        contentBase: exampleDistPath,
                        // open: true,
                        host: host,
                        port: port
                    }),
                    livereload(exampleDistPath)
                ]
            }
        ];
    }
}

export default config;

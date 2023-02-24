const { babel } = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const html = require("@rollup/plugin-html");
const del = require("rollup-plugin-delete");
const copy = require("rollup-plugin-copy");
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");
const json = require("@rollup/plugin-json");
const pluginUtils = require("@rollup/pluginutils");
const ejs = require("ejs");
const { config } = require("../../package.json");

const fs = require("fs");
const path = require("path");

const extensions = [".js", ".ts"];

const exampleSrcPath = "./src";
const exampleDistPath = "./dist";
const host = "0.0.0.0";
const port = 1347;

const traverseDir = (dir, callback, excludes) => {
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
        const entryPath = path.resolve(dir, entry);
        if (fs.statSync(entryPath).isDirectory() && !excludes.includes(entry)) {
            traverseDir(entryPath, callback, excludes);
        } else {
            if (entry.startsWith("_")) return;
            callback(entryPath);
        }
    });
};

const examples = (() => {
    const ret = [];
    traverseDir(
        exampleSrcPath,
        filePath => {
            if (extensions.includes(path.extname(filePath))) {
                ret.push({
                    filePath,
                    fileSubDir: path.dirname(filePath.replace(path.resolve(exampleSrcPath) + path.sep, "")),
                    fileName: path.basename(filePath, path.extname(filePath))
                });
            }
        },
        ["assets"]
    );
    return ret;
})();

export default {
    input: {
        ...examples.reduce((result, item) => {
            result[path.join(item.fileSubDir, item.fileName)] = item.filePath;
            return result;
        }, {})
    },
    output: {
        dir: exampleDistPath,
        sourcemap: true,
        format: "esm",
        manualChunks: {
            geomtoy: [config.packages.core.scopedName, config.packages.util.scopedName, config.packages.view.scopedName]
        },
        chunkFileNames: "js/[name].js"
    },
    plugins: [
        nodeResolve({ extensions }),
        json({ namedExports: false, preferConst: true }),
        babel({ babelHelpers: "bundled", extensions }),
        ...examples.map(item =>
            html({
                fileName: path.join(item.fileSubDir, item.fileName) + ".html",
                template: () => {
                    return `
                    <!doctype html>
                    <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            ${process.env.GENERATE === "true" ? "<base href='/geomtoy-examples/' />" : "<base href='/' />"}
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>${"Geomtoy examples-" + item.fileSubDir.split(path.sep).join("/") + "/" + item.fileName}</title>
                        </head>
                        <body>
                            <script src="${item.fileSubDir.split(path.sep).join("/") + "/" + item.fileName + ".js"}" type="module"></script>
                        </body>
                    </html>`;
                }
            })
        ),
        del({
            targets: exampleDistPath + "/*",
            runOnce: true
        }),
        (function () {
            const filter = pluginUtils.createFilter(["**/*.ejs", "**/*.html"]);
            return {
                name: "ejs",
                transform: function (code, id) {
                    if (filter(id)) {
                        const tplString = ejs.render(code, {}, { filename: id });
                        return `const tpl = \`${tplString}\`; export default tpl;`;
                    }
                }
            };
        })(),
        (function () {
            let already = false;
            return {
                name: "sidebar tree json",
                buildStart: function () {
                    if (!already) {
                        already = true;
                        const treeData = examples.reduce(
                            (a, { fileSubDir, fileName }) => {
                                if (fileSubDir === ".") {
                                    a.children.push({ type: "file", name: fileName, url: `${path.posix.join(fileSubDir, fileName)}.html` });
                                } else {
                                    const parent = fileSubDir.split(path.sep).reduce((a, c) => {
                                        const index = a.children.findIndex(item => item.name === c);
                                        if (index !== -1) {
                                            return a.children[index];
                                        } else {
                                            const l = a.children.push({ type: "dir", name: c, children: [] });
                                            return a.children[l - 1];
                                        }
                                    }, a);
                                    parent.children.push({ type: "file", name: fileName, url: `${path.posix.join(fileSubDir, fileName)}.html` });
                                }
                                return a;
                            },
                            { children: [], type: "dir" }
                        );
                        const jsonPath = path.resolve(exampleSrcPath, "tree.json");
                        fs.writeFileSync(jsonPath, JSON.stringify(treeData));
                    }
                }
            };
        })(),
        copy({
            targets: [
                { src: "src/assets/styles/*", dest: "dist/css" },
                { src: "src/assets/images/*", dest: "dist/img" }
            ],
            copyOnce: true
        }),
        ...(process.env.GENERATE === "true"
            ? []
            : [
                  serve({
                      contentBase: exampleDistPath,
                      // open: true,
                      host: host,
                      port: port
                  }),
                  livereload(exampleDistPath)
              ])
    ]
};

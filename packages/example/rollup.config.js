const babel = require("@rollup/plugin-babel").default;
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const html = require("@rollup/plugin-html").default;
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");
const ejs = require("rollup-plugin-ejs");
const { config } = require("../../package.json");

const fs = require("fs");
const path = require("path");

const extensions = [".js", ".ts"];
const exclude = "./node_modules/!(@geomtoy/*)";

const exampleSrcPath = "./src";
const exampleDistPath = "./dist";
const host = "0.0.0.0";
const port = 1347;

const traverseDir = (dir, callback, withoutDirName) => {
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
        const entryPath = path.resolve(dir, entry);
        if (fs.statSync(entryPath).isDirectory() && entry !== withoutDirName) {
            traverseDir(entryPath, callback, withoutDirName);
        } else {
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
        "assets"
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
        format: "esm",
        manualChunks: {
            geomtoy: [config.packages.core.scopedName, config.packages.util.scopedName, config.packages.view.scopedName]
        },
        chunkFileNames: "assets/[name].js"
    },
    plugins: [
        nodeResolve({ extensions }),
        babel({ babelHelpers: "bundled", extensions, exclude }),
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
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>${"Geomtoy - " + item.fileName.split("-").join(" ")}</title>
                            <script src="${item.fileName + ".js"}" type="module"></script>
                        </head>
                        <body></body>
                    </html>`;
                }
            })
        ),
        ejs({
            include: ["**/*.ejs", "**/*.html"],
            exclude: ["**/index.html"]
        }),
        (function () {
            let already = false;
            return {
                name: "index",
                generateBundle: function () {
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
                        const srcIndexPath = path.resolve(exampleSrcPath, "index.html");
                        const distIndexPath = path.resolve(exampleDistPath, "index.html");
                        let indexHtmlContent = fs.readFileSync(srcIndexPath, "utf-8");
                        indexHtmlContent = indexHtmlContent.replace("__DATA__", JSON.stringify(treeData));
                        fs.writeFileSync(distIndexPath, indexHtmlContent);
                    }
                }
            };
        })(),
        serve({
            contentBase: exampleDistPath,
            // open: true,
            host: host,
            port: port
        }),
        livereload(exampleDistPath)
    ]
};

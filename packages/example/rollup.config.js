const babel = require("@rollup/plugin-babel").default;
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const html = require("@rollup/plugin-html").default;
const serve = require("rollup-plugin-serve");
const livereload = require("rollup-plugin-livereload");

const fs = require("fs");
const path = require("path");

const extensions = [".js", ".ts"];
const exclude = "./node_modules/!(@geomtoy/*)";

const exampleSrcPath = "./src";
const exampleDistPath = "./dist";
const exampleDefaultHtmlPath = "./src/default.html";
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

export default [
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

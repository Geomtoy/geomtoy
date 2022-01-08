const TypeDoc = require("typedoc");
const fs = require("fs/promises");
const path = require("path");

const pkgConfig = {
    src: {
        core: "../core",
        view: "../view"
    },
    docsGenDir: "./dist",
    docsIncludesDir: "./src/includes",
    docsMediaDir: "./src/media"
};

async function main() {
    const app = new TypeDoc.Application();

    app.options.addReader(new TypeDoc.TSConfigReader());

    app.bootstrap({
        // typedoc options here
        name: "Geomtoy",
        entryPointStrategy: "packages",
        entryPoints: [pkgConfig.src.core, pkgConfig.src.view],
        includeVersion: false,
        excludePrivate: true,
        excludeProtected: true,
        excludeInternal: true,
        disableSources: true,
        readme: "none",
        includes: pkgConfig.docsIncludesDir,
        media: pkgConfig.docsMediaDir,
        sort: ["static-first"],
        markedOptions: {
            mangle: false,
            walkTokens(token) {
                if (token.type === "escape" && token.text === "\\") {
                    // unescape "\\" for latex
                    token.text = "\\\\";
                }
                if (token.type === "em" && token.raw.match(/^_[^_]+_$/)) {
                    // unescape "_" for latex, so we should not use `_` to `italic` in markdown nor use `*` to `multiply` in latex
                    token.text = token.raw;
                    token.type = "text";
                    delete token.tokens;
                }
            }
        },
        categorizeByGroup: true,
        categoryOrder: ["Entry", "Base", "Adaptor", "*"]
    });

    const project = app.convert();
    if (project) {
        // Project may not have converted correctly
        const outputDir = pkgConfig.docsGenDir;
        // Rendered docs
        await app.generateDocs(project, outputDir);

        // Begin mod
        const docCssPath = outputDir + "/assets/style.css",
            docJsPath = outputDir + "/assets/main.js",
            docAssetDir = outputDir + "/assets/";

        const katexCssPath = "./node_modules/katex/dist/katex.min.css",
            katexJsPath = "./node_modules/katex/dist/katex.min.js",
            katexAutoRenderPath = "./node_modules/katex/dist/contrib/auto-render.min.js",
            katexFontDir = "./node_modules/katex/dist/fonts";

        let docCss = await fs.readFile(docCssPath, "utf-8"),
            docJs = await fs.readFile(docJsPath, "utf-8");
        // Modify the bad theme classes
        docCss = docCss.replace(/dl\.tsd-comment-tags dt {\s*(float: left;)([\s\S]+?)}/, function (m0, m1, m2) {
            return `dl.tsd-comment-tags dt {\n  display: inline-block;${m2}}`;
        });
        // Add Katex css and js
        let katexCss = await fs.readFile(katexCssPath, "utf-8"),
            katexJs = await fs.readFile(katexJsPath, "utf-8"),
            katexAutoRenderJs = await fs.readFile(katexAutoRenderPath, "utf-8");
        docCss += katexCss;
        docJs +=
            katexJs +
            katexAutoRenderJs +
            `;(function(){
            renderMathInElement(document.body, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                ]
            })
        })()`;
        await fs.writeFile(docCssPath, docCss);
        await fs.writeFile(docJsPath, docJs);
        // Copy Katex fonts
        // await fs.cp(katexFontDir,docAssetDir + "/fonts")
        await fs.mkdir(path.resolve(docAssetDir, "fonts"));
        const fonts = await fs.readdir(katexFontDir);
        fonts.forEach(async fontName => {
            await fs.copyFile(path.resolve(katexFontDir, fontName), path.resolve(docAssetDir, "fonts", fontName));
        });
    }
}

main().catch(console.error);

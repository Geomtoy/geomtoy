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
        // `TypeDoc` options here
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
                    // Unescape "\\" for latex
                    token.text = "\\\\";
                }
                if (token.type === "em" && token.raw.match(/^_[^_]+_$/)) {
                    // Unescape "_" for latex, so we should not use "_" to make italic in markdown nor use "*" to multiply in latex.
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
    // Project may not have converted correctly
    if (project) {
        // Render docs
        await app.generateDocs(project, pkgConfig.docsGenDir);

        // Do some css/js modify
        const docCssPath = path.resolve(pkgConfig.docsGenDir, "assets/style.css");
        const docJsPath = path.resolve(pkgConfig.docsGenDir, "assets/main.js");
        const docAssetDir = path.resolve(pkgConfig.docsGenDir, "assets/");

        const katexDistPath = path.dirname(require.resolve("katex"));
        const katexCssPath = path.resolve(katexDistPath, "katex.min.css");
        const katexJsPath = path.resolve(katexDistPath, "katex.min.js");
        const katexAutoRenderPath = path.resolve(katexDistPath, "contrib/auto-render.min.js");
        const katexFontDir = path.resolve(katexDistPath, "fonts");

        let docCss = await fs.readFile(docCssPath, "utf-8");
        let docJs = await fs.readFile(docJsPath, "utf-8");
        // Modify `comment` classes
        docCss += `
            dl.tsd-comment-tags dt {
                display: inline-block;
                float: none !important;
                margin: 0 0 10px 0 !important;
            }
        `;
        // Add `katex` css and js
        let katexCss = await fs.readFile(katexCssPath, "utf-8");
        let katexJs = await fs.readFile(katexJsPath, "utf-8");
        let katexAutoRenderJs = await fs.readFile(katexAutoRenderPath, "utf-8");
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
        // Copy `katex` fonts
        await fs.mkdir(path.resolve(docAssetDir, "fonts"));
        const fonts = await fs.readdir(katexFontDir);
        fonts.forEach(async fontName => {
            await fs.copyFile(path.resolve(katexFontDir, fontName), path.resolve(docAssetDir, "fonts", fontName));
        });
    }
}

main().catch(console.error);

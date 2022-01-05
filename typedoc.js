const TypeDoc = require("typedoc");
const { Converter, ReflectionKind, DeclarationReflection } = require("typedoc");
const ts = require("typescript");
const fs = require("fs/promises");
const path = require("path");

const pkgConfig = {
    geomtoy: {
        src: "src/geomtoy/index.ts"
    },
    geomtoyKit: {
        src: "src/geomtoy-kit/index.ts"
    },
    docsGenDir: "docs",
    docsIncludesDir: "includes",
    docsMediaDir: "media"
};

async function main() {
    const app = new TypeDoc.Application();

    app.options.addReader(new TypeDoc.TSConfigReader());

    app.bootstrap({
        name: "Geomtoy&GeomtoyKit",
        // typedoc options here
        // entryPoints: [pkgConfig.geomtoy.src, pkgConfig.geomtoyKit.src],
        entryPoints: [pkgConfig.geomtoy.src],
        includeVersion: true,
        excludePrivate: true,
        excludeProtected: true,
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
        plugin: "none",
        categorizeByGroup: true,
        categoryOrder: ["Entry", "Base", "Adaptor", "*"]
    });

    app.converter.on(Converter.EVENT_CREATE_DECLARATION, (_context, reflection, node) => {
        // `default` rename
        if (
            reflection.name === "default" &&
            node &&
            (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
            node.name
        ) {
            reflection.name = node.name.getText();
        }
        // // remove `owner` property
        // if (reflection.kindOf(ReflectionKind.Property) && reflection.name === "owner") {
        //     let pc = reflection.parent.children,
        //         index = pc.indexOf(reflection);
        //     pc.splice(index, 1);
        // }
    });

    app.converter.on(Converter.EVENT_CREATE_SIGNATURE, (_context, reflection, node) => {
        // // remove `owner` parameter
        // if (reflection.kindOf(ReflectionKind.ConstructorSignature) || reflection.kindOf(ReflectionKind.CallSignature)) {
        //     if (reflection.parameters) {
        //         let foundIndex = reflection.parameters.findIndex(paramRef => paramRef.name === "owner");
        //         if (~foundIndex) reflection.parameters.splice(foundIndex, 1);
        //     }
        // }
        // // remove `owner` getter/setter
        // if ((reflection.kindOf(ReflectionKind.SetSignature) || reflection.kindOf(ReflectionKind.GetSignature)) && reflection.name === "owner") {
        //     let accessorReflection = reflection.parent,
        //         classReflection = reflection.parent.parent,
        //         foundIndex = classReflection.children.indexOf(accessorReflection);
        //     if (~foundIndex) classReflection.children.splice(foundIndex, 1);
        // }
    });

    const project = app.convert();
    if (project) {
        // Project may not have converted correctly
        const outputDir = pkgConfig.docsGenDir;
        // Rendered docs
        await app.generateDocs(project, outputDir);

        // Begin mod
        const docCssPath = outputDir + "/assets/css/main.css",
            docJsPath = outputDir + "/assets/js/main.js",
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
        await fs.mkdir(path.resolve(docAssetDir, "css/fonts"));
        const fonts = await fs.readdir(katexFontDir);
        fonts.forEach(async fontName => {
            await fs.copyFile(path.resolve(katexFontDir, fontName), path.resolve(docAssetDir, "css/fonts", fontName));
        });
    }
}

main().catch(console.error);

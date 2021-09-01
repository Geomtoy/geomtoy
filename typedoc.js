const TypeDoc = require("typedoc"),
    { Converter, ReflectionKind, DeclarationReflection } = require("typedoc"),
    ts = require("typescript"),
    fs = require("fs/promises"),
    path = require("path")

async function main() {
    const app = new TypeDoc.Application()
 
    app.options.addReader(new TypeDoc.TSConfigReader())

    app.bootstrap({
        name: "Geomtoy",
        // typedoc options here
        entryPoints: [
            "./src/geomtoy/index.ts",
            "./src/geomtoy/base/GeomObject.ts",

            "./src/geomtoy/Point.ts",
            "./src/geomtoy/Line.ts",
            "./src/geomtoy/Segment.ts",
            "./src/geomtoy/Vector.ts",
            "./src/geomtoy/Triangle.ts",
            "./src/geomtoy/Circle.ts",
            "./src/geomtoy/Rectangle.ts",
            "./src/geomtoy/Polyline.ts",
            "./src/geomtoy/Polygon.ts",
            "./src/geomtoy/RegularPolygon.ts",
            "./src/geomtoy/Ellipse.ts",

            "./src/geomtoy/transformation/index.ts",
            "./src/geomtoy/inversion",

            "./src/geomtoy/adaptor/svg-dot-js.ts",
            "./src/geomtoy/adaptor/vanilla-canvas.ts",
            "./src/geomtoy/adaptor/vanilla-svg.ts",

            "./src/geomtoy/interfaces",
            "./src/geomtoy/types"
        ],
        includeVersion: true,
        excludePrivate: true,
        disableSources: true,
        readme: "none",
        includes: "./includes",
        media: "./media",
        sort: ["instance-first"],
        markedOptions: {
            mangle: false,
            walkTokens(token) {
                if (token.type === "escape" && token.text === "\\") {
                    // unescape "\\" for latex
                    token.text = "\\\\"
                }
                if (token.type === "em" && token.raw.match(/^_[^_]+_$/)) {
                    // unescape "_" for latex, so we should not use `_` to `italic` in markdown nor use `*` to `multiply` in latex
                    token.text = token.raw
                    token.type = "text"
                    delete token.tokens
                }
            }
        },
        plugin: "none",
        categoryOrder: ["Entry", "Base", "Adaptor", "*"]
    })

    app.converter.on(Converter.EVENT_CREATE_DECLARATION, (_context, reflection, node) => {
        // `default` rename
        if (
            reflection.name === "default" &&
            node &&
            (ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) &&
            node.name
        ) {
            reflection.name = node.name.getText()
        }
        // remove `owner` property
        if (reflection.kindOf(ReflectionKind.Property) && reflection.name === "owner") {
            let pc = reflection.parent.children,
                index = pc.indexOf(reflection)
            pc.splice(index, 1)
        }
    })

    app.converter.on(Converter.EVENT_CREATE_SIGNATURE, (_context, reflection, node) => {
        // remove `owner` parameter
        if (reflection.kindOf(ReflectionKind.ConstructorSignature) || reflection.kindOf(ReflectionKind.CallSignature)) {
            if (reflection.parameters) {
                let foundIndex = reflection.parameters.findIndex(paramRef => paramRef.name === "owner")
                if (~foundIndex) reflection.parameters.splice(foundIndex, 1)
            }
        }
        // remove `owner` getter/setter
        if ((reflection.kindOf(ReflectionKind.SetSignature) || reflection.kindOf(ReflectionKind.GetSignature)) && reflection.name === "owner") {
            let accessorReflection = reflection.parent,
                classReflection = reflection.parent.parent,
                foundIndex = classReflection.children.indexOf(accessorReflection)
            if (~foundIndex) classReflection.children.splice(foundIndex, 1)
        }
    })

    app.converter.on(Converter.EVENT_RESOLVE_BEGIN, function (_context, reflection, node) {
        const project = _context.project
        const modules = (project.children ?? []).filter(c => c.kindOf(ReflectionKind.Module))

        let classesModule = new DeclarationReflection("Classes", ReflectionKind.Namespace, project)
        let interfacesModule = new DeclarationReflection("Interfaces", ReflectionKind.Namespace, project)
        let enumsModule = new DeclarationReflection("Enumerations", ReflectionKind.Namespace, project)
        let typesModule = new DeclarationReflection("Type aliases", ReflectionKind.Namespace, project)

        classesModule.children = []
        classesModule.parent = project
        interfacesModule.children = []
        interfacesModule.parent = project
        enumsModule.children = []
        enumsModule.parent = project
        typesModule.children = []
        typesModule.parent = project

        project.registerReflection(classesModule)
        project.registerReflection(interfacesModule)
        project.registerReflection(enumsModule)
        project.registerReflection(typesModule)

        if (modules.length > 0) {
            project.children = []
            for (const module of modules) {
                const moduleChildren = module.children
                const reflections = moduleChildren ?? []
                for (const ref of reflections) {
                    // skip ReferenceReflection @see {@link https://typedoc.org/api/classes/ReferenceReflection.html}
                    if (ref.kindOf(ReflectionKind.Reference)) continue
                    if (ref.kindOf(ReflectionKind.Class)) {
                        ref.parent = classesModule
                        classesModule.children.push(ref)
                    }
                    if (ref.kindOf(ReflectionKind.Interface)) {
                        ref.parent = interfacesModule
                        interfacesModule.children.push(ref)
                    }
                    if (ref.kindOf(ReflectionKind.Enum)) {
                        ref.parent = enumsModule
                        enumsModule.children.push(ref)
                    }
                    if (ref.kindOf(ReflectionKind.TypeAlias) || ref.kindOf(ReflectionKind.TypeLiteral)) {
                        ref.parent = typesModule
                        typesModule.children.push(ref)
                    }
                }
                module.children = undefined
                project.removeReflection(module)
            }
            project.children.push(classesModule)
            project.children.push(interfacesModule)
            project.children.push(enumsModule)
            project.children.push(typesModule)
        }
    })

    const project = app.convert()
    if (project) {
        // Project may not have converted correctly
        const outputDir = "docs"
        // Rendered docs
        await app.generateDocs(project, outputDir)

        // Begin mod
        const docCssPath = outputDir + "/assets/css/main.css",
            docJsPath = outputDir + "/assets/js/main.js",
            docAssetDir = outputDir + "/assets/"

        const katexCssPath = "./node_modules/katex/dist/katex.min.css",
            katexJsPath = "./node_modules/katex/dist/katex.min.js",
            katexAutoRenderPath = "./node_modules/katex/dist/contrib/auto-render.min.js",
            katexFontDir = "./node_modules/katex/dist/fonts"

        let docCss = await fs.readFile(docCssPath, "utf-8"),
            docJs = await fs.readFile(docJsPath, "utf-8")
        // Modify the bad theme classes
        docCss = docCss.replace(/dl\.tsd-comment-tags dt {\s*(float: left;)([\s\S]+?)}/, function (m0, m1, m2) {
            return `dl.tsd-comment-tags dt {\n  display: inline-block;${m2}}`
        })
        // Add Katex css and js
        let katexCss = await fs.readFile(katexCssPath, "utf-8"),
            katexJs = await fs.readFile(katexJsPath, "utf-8"),
            katexAutoRenderJs = await fs.readFile(katexAutoRenderPath, "utf-8")
        docCss += katexCss
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
        })()`
        await fs.writeFile(docCssPath, docCss)
        await fs.writeFile(docJsPath, docJs)
        // Copy Katex fonts
        // await fs.cp(katexFontDir,docAssetDir + "/fonts")
        await fs.mkdir(path.resolve(docAssetDir, "css/fonts"))
        const fonts = await fs.readdir(katexFontDir)
        fonts.forEach(async fontName => {
            await fs.copyFile(path.resolve(katexFontDir, fontName), path.resolve(docAssetDir, "css/fonts", fontName))
        })
    }
}

main().catch(console.error)

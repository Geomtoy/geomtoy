const TypeDoc = require("typedoc")
const { Converter, ReflectionKind, DeclarationReflection, ReflectionFlag } = require("typedoc")
const ts = require("typescript")

async function main() {
    const app = new TypeDoc.Application()

    // If you want TypeDoc to load tsconfig.json / typedoc.json files
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
        includes: "./fragments",
        media: "./media",
        sort: ["instance-first"],
        plugin: "none",
        categoryOrder: ["Entry", "Base", "*"]
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
        // Alternatively generate JSON output
        // await app.generateJson(project, outputDir + "/documentation.json");
    }
}

main().catch(console.error)

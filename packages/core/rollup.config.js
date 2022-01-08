const babel = require("@rollup/plugin-babel").default;
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const { terser } = require("rollup-plugin-terser");

const path = require("path");
const extensions = [".js", ".ts"];
const exclude = "./node_modules/**";

const pkgConfig = {
    src: "./src/index.ts",
    kabobName: "geomtoy",
    pascalName: "Geomtoy",
    distDir: "./dist"
};

export default {
    input: pkgConfig.src,
    output: [
        {
            file: path.resolve(pkgConfig.distDir, "index.mjs"),
            sourcemap: true,
            format: "esm"
        },
        {
            file: path.resolve(pkgConfig.distDir, "index.cjs"),
            sourcemap: true,
            format: "cjs"
        },
        {
            file: path.resolve(pkgConfig.distDir, "index.js"),
            format: "umd",
            name: pkgConfig.pascalName,
            amd: { id: pkgConfig.kabobName },
            sourcemap: true
        },
        {
            file: path.resolve(pkgConfig.distDir, "index.min.js"),
            format: "umd",
            name: pkgConfig.pascalName,
            amd: { id: pkgConfig.kabobName },
            plugins: [terser()]
        }
    ],
    plugins: [nodeResolve({ extensions }), babel({ babelHelpers: "bundled", extensions, exclude })]
};
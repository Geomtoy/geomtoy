const { babel } = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const { config } = require("../../package.json");

const extensions = [".js", ".ts"];
const pkgUtil = config.packages.util;

export default {
    input: "./src/index.ts",
    output: [
        {
            file: "./dist/index.mjs",
            sourcemap: true,
            format: "esm"
        },
        {
            file: "./dist/index.cjs",
            sourcemap: true,
            format: "cjs"
        },
        {
            file: "./dist/index.js",
            format: "umd",
            name: pkgUtil.pascalName,
            amd: { id: pkgUtil.scopedName },
            sourcemap: true
        },
        {
            file: "./dist/index.min.js",
            format: "umd",
            name: pkgUtil.pascalName,
            amd: { id: pkgUtil.scopedName },
            plugins: [terser()]
        }
    ],
    plugins: [nodeResolve({ extensions }), babel({ babelHelpers: "bundled", extensions, rootMode: "upward" })]
};

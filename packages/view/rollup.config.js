const { babel } = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const { config } = require("../../package.json");

const extensions = [".js", ".ts"];
const exclude = "./node_modules/**";

const pkgCore = config.packages.core;
const pkgUtil = config.packages.util;
const pkgView = config.packages.view;

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
            name: pkgView.pascalName,
            amd: { id: pkgView.scopedName },
            globals: {
                [pkgCore.scopedName]: pkgCore.pascalName,
                [pkgUtil.scopedName]: pkgUtil.pascalName
            },
            sourcemap: true
        },
        {
            file: "./dist/index.min.js",
            format: "umd",
            name: pkgView.pascalName,
            amd: { id: pkgView.scopedName },
            globals: {
                [pkgCore.scopedName]: pkgCore.pascalName,
                [pkgUtil.scopedName]: pkgUtil.pascalName
            },
            plugins: [terser()]
        }
    ],
    external(id) {
        return id.indexOf(config.scope) >= 0;
    },
    plugins: [nodeResolve({ extensions }), babel({ babelHelpers: "bundled", extensions, exclude })]
};

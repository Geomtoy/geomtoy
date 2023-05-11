const babel = require("@rollup/plugin-babel").default;
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const { terser } = require("rollup-plugin-terser");

const extensions = [".js", ".ts"];

export default {
    input: "./index.ts",
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
            name: "Geomtoy",
            amd: { id: "geomtoy" },
            sourcemap: true
        },
        {
            file: "./dist/index.min.js",
            format: "umd",
            name: "Geomtoy",
            amd: { id: "geomtoy" },
            plugins: [terser()]
        }
    ],
    plugins: [nodeResolve({ extensions }), babel({ babelHelpers: "bundled", extensions, rootMode: "upward" })]
};

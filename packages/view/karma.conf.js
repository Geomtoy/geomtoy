const { babel } = require("@rollup/plugin-babel");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");

const extensions = [".js", ".ts"];
const exclude = "**/node_modules/**";

module.exports = function (config) {
    config.set({
        basePath: "",
        frameworks: ["mocha", "chai"],
        files: [
            { pattern: "./test/**/*.test.ts", watched: false },
            { pattern: "./test/visual/**", watched: false, included: false, nocache: false, served: true }
        ],
        exclude: [],
        preprocessors: {
            "**/*.ts": ["rollup"]
        },
        rollupPreprocessor: {
            plugins: [nodeResolve({ extensions }), commonjs({ extensions, include: exclude }), babel({ babelHelpers: "bundled", extensions, exclude, plugins: ["istanbul"] })],
            onwarn(warning, rollupWarn) {
                if (warning.code === "THIS_IS_UNDEFINED") return;
                if (warning.code === "CIRCULAR_DEPENDENCY") return;
                rollupWarn(warning);
            },
            output: {
                format: "iife",
                name: "view",
                sourcemap: "inline"
            }
        },

        reporters: ["progress", "coverage"],
        coverageReporter: {
            dir: "coverage",
            includeAllSources: true,
            reporters: [{ type: "text" }, { type: "html", subdir: "html" }, { type: "lcov", subdir: "./" }]
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ["Chrome"],
        autoWatch: true,
        singleRun: false,
        concurrency: Infinity
    });
};

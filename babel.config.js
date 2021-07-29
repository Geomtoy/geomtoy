module.exports = {
    presets: [["@babel/preset-env"], "@babel/preset-typescript"],
    plugins: [
        [
            "@babel/plugin-transform-runtime",
            {
                corejs: 3
            }
        ],
        [
            "@babel/plugin-proposal-decorators",
            {
                legacy: true
            }
        ]
    ]
}

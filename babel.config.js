module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                bugfixes: true
            }
        ],
        "@babel/preset-typescript"
    ],
    plugins: [
        [
            "@babel/plugin-proposal-decorators",
            {
                legacy: true
            }
        ]
    ]
}

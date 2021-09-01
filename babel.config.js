module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                bugfixes: true
            }
        ],
        [
            "@babel/preset-typescript",
            {
                optimizeConstEnums: true
            }
        ]
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

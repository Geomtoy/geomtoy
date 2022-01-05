module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                bugfixes: true,
                loose: true
            }
        ],
        [
            "@babel/preset-typescript",
            {
                optimizeConstEnums: true
            }
        ]
    ]
}

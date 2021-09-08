const o = {
    renderer: null
}

export default function (gui, rendererList, defaultType, callback) {
    o.renderer = defaultType
    showRenderer(defaultType)

    gui.add(o, "renderer", Object.keys(rendererList))
        .listen()
        .onChange(value => showRenderer(value))

    function showRenderer(type) {
        Object.keys(rendererList).forEach(t => {
            rendererList[t].container.style.display = "none"
        })
        rendererList[type].container.style.display = "block"
        callback(type, rendererList[type])
    }
}

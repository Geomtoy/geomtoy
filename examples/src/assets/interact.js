export default {
    dragAndDrop(touchables, el, renderer, callback) {
        const type = el instanceof HTMLCanvasElement ? "canvas" : el instanceof SVGSVGElement ? "svg" : undefined
        if (!type) return

        let currentTouch = null,
            dragging = false

        el.addEventListener("mousedown", function (e) {
            const coord = renderer.geomtoy.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])
            Object.keys(touchables).forEach(name => {
                if (renderer.isPointInFill(touchables[name].path, ...coord)) {
                    currentTouch = touchables[name]
                    currentTouch.offset = [currentTouch.object.x - coord[0], currentTouch.object.y - coord[1]]
                    dragging = true
                }
            })
        })
        el.addEventListener("mouseup", function (e) {
            currentTouch = null
            dragging = false
        })
        el.addEventListener("mousemove", function (e) {
            const coord = renderer.geomtoy.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])
            if (dragging) {
                currentTouch.object.x = coord[0] + currentTouch.offset[0]
                currentTouch.object.y = coord[1] + currentTouch.offset[1]
                callback(currentTouch)
            } else {
                document.documentElement.style.cursor = Object.keys(touchables).some(name => renderer.isPointInFill(touchables[name].path, ...coord)) ? "pointer" : "default"
            }
        })
    },

    responsive(el, callback) {
        let parentEl = el.parentElement
        const resizeObserver = new ResizeObserver(entries => {
            el.setAttribute("width", entries[0].contentRect.width)
            el.setAttribute("height", entries[0].contentRect.height)
            callback(entries[0].contentRect.width, entries[0].contentRect.height)
        })
        resizeObserver.observe(parentEl)
    }
}

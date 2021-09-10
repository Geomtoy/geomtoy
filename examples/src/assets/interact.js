const rendererMap = new Map()

function getSettings(map, renderer) {
    if (!map.has(renderer)) {
        const settings = {
            currentTouch: undefined,
            currentTouchOffset: [],
            panning: false,
            mouseDownCb(e) {
                const cbs = settings.mouseDownCbs
                cbs.dragAndDrop !== undefined && cbs.dragAndDrop(e)
                cbs.zoomAndPan !== undefined && cbs.zoomAndPan(e)
            },
            mouseDownCbs: {
                dragAndDrop: undefined,
                zoomAndPan: undefined
            },
            mouseUpCb(e) {
                const cbs = settings.mouseUpCbs
                cbs.dragAndDrop !== undefined && cbs.dragAndDrop(e)
                cbs.zoomAndPan !== undefined && cbs.zoomAndPan(e)
            },
            mouseUpCbs: {
                dragAndDrop: undefined,
                zoomAndPan: undefined
            },
            mouseMoveCb(e) {
                const cbs = settings.mouseMoveCbs
                cbs.dragAndDrop !== undefined && cbs.dragAndDrop(e)
                cbs.zoomAndPan !== undefined && cbs.zoomAndPan(e)
            },
            mouseMoveCbs: {
                dragAndDrop: undefined,
                zoomAndPan: undefined
            },
            wheelCb(e) {
                const cbs = settings.wheelCbs
                cbs.zoomAndPan !== undefined && cbs.zoomAndPan(e)
            },
            wheelCbs: {
                zoomAndPan: undefined
            },
            resizeObserver: undefined
        }
        map.set(renderer, settings)
    }
    return map.get(renderer)
}

const minScale = 0.1
const maxScale = 100
const scaleDeltaRate = 1 / 300

export default {
    startDragAndDrop(touchables, renderer, callback) {
        const settings = getSettings(rendererMap, renderer)

        renderer.container.addEventListener("mousedown", settings.mouseDownCb)
        settings.mouseDownCbs.dragAndDrop = e => {
            const coord = renderer.geomtoy.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])

            Object.keys(touchables).some(name => {
                if (renderer.isPointInFill(touchables[name].path, ...coord)) {
                    settings.currentTouch = touchables[name]
                    settings.currentTouchOffset = [settings.currentTouch.object.x - coord[0], settings.currentTouch.object.y - coord[1]]
                    return true
                }
            })
        }
        renderer.container.addEventListener("mouseup", settings.mouseUpCb)
        settings.mouseUpCbs.dragAndDrop = e => {
            settings.currentTouch = undefined
        }
        renderer.container.addEventListener("mousemove", settings.mouseMoveCb)
        settings.mouseMoveCbs.dragAndDrop = e => {
            const coord = renderer.geomtoy.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])

            if (settings.currentTouch !== undefined) {
                settings.currentTouch.object.x = coord[0] + settings.currentTouchOffset[0]
                settings.currentTouch.object.y = coord[1] + settings.currentTouchOffset[1]
                setTimeout(() => {
                    callback(renderer, settings.currentTouch)
                })
            } else {
                renderer.container.style.cursor = Object.keys(touchables).some(name => renderer.isPointInFill(touchables[name].path, ...coord)) ? "pointer" : "default"
            }
        }
    },
    stopDragAndDrop(renderer) {
        const settings = getSettings(rendererMap, renderer)
        settings.mouseDownCbs.dragAndDrop = undefined
        if (settings.mouseDownCbs.zoomAndPan === undefined) renderer.container.removeEventListener("mousedown", settings.mouseDownCb)
        settings.mouseUpCbs.dragAndDrop = undefined
        if (settings.mouseUpCbs.zoomAndPan === undefined) renderer.container.removeEventListener("mouseup", settings.mouseUpCb)
        settings.mouseMoveCbs.dragAndDrop = undefined
        if (settings.mouseMoveCbs.zoomAndPan === undefined) renderer.container.removeEventListener("mouseup", settings.mouseMoveCb)
    },

    startZoomAndPan(renderer, callback) {
        const settings = getSettings(rendererMap, renderer)
        renderer.container.addEventListener("mousedown", settings.mouseDownCb)
        settings.mouseDownCbs.zoomAndPan = e => {
            if (settings.currentTouch === undefined) {
                settings.panning = true
                renderer.container.style.cursor = "grab"
            }
        }
        renderer.container.addEventListener("mouseup", settings.mouseUpCb)
        settings.mouseUpCbs.zoomAndPan = e => {
            settings.panning = false
            renderer.container.style.cursor = "default"
        }
        renderer.container.addEventListener("mousemove", settings.mouseMoveCb)
        settings.mouseMoveCbs.zoomAndPan = e => {
            if (settings.panning) {
                renderer.container.style.cursor = "grabbing"
                renderer.geomtoy.offset = [renderer.geomtoy.offset[0] + e.movementX, renderer.geomtoy.offset[1] + e.movementY]
                setTimeout(() => {
                    callback(renderer)
                })
            }
        }
        renderer.container.addEventListener("wheel", settings.wheelCb)
        settings.wheelCbs.zoomAndPan = e => {
            let scale = renderer.geomtoy.scale
            scale += e.deltaY * scaleDeltaRate

            if (scale < minScale) {
                scale = minScale
            } else if (scale > maxScale) {
                scale = maxScale
            }

            const [innerOffsetX, innerOffsetY] = renderer.geomtoy.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])
            renderer.geomtoy.scale = scale
            const [scaledOffsetX, scaledOffsetY] = renderer.geomtoy.globalTransformation.transformCoordinate([innerOffsetX, innerOffsetY])
            const [zoomOffsetX, zoomOffsetY] = [e.offsetX - scaledOffsetX, e.offsetY - scaledOffsetY]
            renderer.geomtoy.offset = [renderer.geomtoy.offset[0] + zoomOffsetX, renderer.geomtoy.offset[1] + zoomOffsetY]
            
            setTimeout(() => {
                callback(renderer)
            })
        }
    },
    stopZoomAndPan(renderer) {
        const settings = getSettings(rendererMap, renderer)
        settings.mouseDownCbs.zoomAndPan = undefined
        if (settings.mouseDownCbs.dragAndDrop === undefined) renderer.container.removeEventListener("mousedown", settings.mouseDownCb)
        settings.mouseUpCbs.zoomAndPan = undefined
        if (settings.mouseUpCbs.dragAndDrop === undefined) renderer.container.removeEventListener("mouseup", settings.mouseUpCb)
        settings.mouseMoveCbs.zoomAndPan = undefined
        if (settings.mouseMoveCbs.dragAndDrop === undefined) renderer.container.removeEventListener("mouseup", settings.mouseMoveCb)
        settings.wheelCbs.zoomAndPan = undefined
        renderer.container.removeEventListener("wheel", settings.wheelCb)
    },

    startResponsive(renderer, callback) {
        const settings = getSettings(rendererMap, renderer)
        const parentEl = renderer.container.parentElement
        let immediatelyFirstCall = true
        if (settings.resizeObserver !== undefined) return
        const ob = new ResizeObserver(entries => {
            renderer.container.setAttribute("width", entries[0].contentRect.width)
            renderer.container.setAttribute("height", entries[0].contentRect.height)
            if (immediatelyFirstCall) {
                callback(renderer, entries[0].contentRect.width, entries[0].contentRect.height)
                immediatelyFirstCall = false
            } else {
                setTimeout(() => {
                    callback(renderer, entries[0].contentRect.width, entries[0].contentRect.height)
                })
            }
        })
        ob.observe(parentEl)
        settings.resizeObserver = ob
    },
    stopResponsive(renderer) {
        const settings = getSettings(rendererMap, renderer)
        if (settings.resizeObserver !== undefined) {
            settings.resizeObserver.disconnect()
            settings.resizeObserver = undefined
        }
    }
}

import { Renderer } from "../../../src/geomtoy/adaptor/adapter-types"
import { Touchable, Collection } from "./GeomObjectWrapper"
const map: Map<Renderer, Settings> = new Map()

interface Settings {
    currentTouch: Touchable | undefined
    currentTouchOffset: [number, number]
    panning: boolean
    mouseDownCb: (e: MouseEvent) => void
    mouseDownCbs: {
        dragAndDrop: ((e: MouseEvent) => any) | undefined
        zoomAndPan: ((e: MouseEvent) => any) | undefined
    }
    mouseUpCb: (e: MouseEvent) => void
    mouseUpCbs: {
        dragAndDrop: ((e: MouseEvent) => any) | undefined
        zoomAndPan: ((e: MouseEvent) => any) | undefined
    }
    mouseMoveCb: (e: MouseEvent) => void
    mouseMoveCbs: {
        dragAndDrop: ((e: MouseEvent) => any) | undefined
        zoomAndPan: ((e: MouseEvent) => any) | undefined
    }
    wheelCb: (e: WheelEvent) => void
    wheelCbs: {
        zoomAndPan: ((e: WheelEvent) => any) | undefined
    }
    resizeObserver: ResizeObserver | undefined
}

function getSettings(renderer: Renderer) {
    if (!map.has(renderer)) {
        const settings: Settings = {
            currentTouch: undefined,
            currentTouchOffset: [0, 0],
            panning: false,
            mouseDownCb(e: MouseEvent) {
                const cbs = settings.mouseDownCbs
                cbs.dragAndDrop !== undefined && cbs.dragAndDrop(e)
                cbs.zoomAndPan !== undefined && cbs.zoomAndPan(e)
            },
            mouseDownCbs: {
                dragAndDrop: undefined,
                zoomAndPan: undefined
            },
            mouseUpCb(e: MouseEvent) {
                const cbs = settings.mouseUpCbs
                cbs.dragAndDrop !== undefined && cbs.dragAndDrop(e)
                cbs.zoomAndPan !== undefined && cbs.zoomAndPan(e)
            },
            mouseUpCbs: {
                dragAndDrop: undefined,
                zoomAndPan: undefined
            },
            mouseMoveCb(e: MouseEvent) {
                const cbs = settings.mouseMoveCbs
                cbs.dragAndDrop !== undefined && cbs.dragAndDrop(e)
                cbs.zoomAndPan !== undefined && cbs.zoomAndPan(e)
            },
            mouseMoveCbs: {
                dragAndDrop: undefined,
                zoomAndPan: undefined
            },
            wheelCb(e: WheelEvent) {
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
    return map.get(renderer)!
}

class Interact {
    settings: Settings
    constructor(public renderer: Renderer, public collection: Collection, public minZoom = 0.1, public maxZoom = 100, public zoomDeltaRate = 1 / 300) {
        this.settings = getSettings(this.renderer)
    }

    startDragAndDrop() {
        const settings = this.settings
        const touchables = this.collection.touchables

        this.renderer.container.addEventListener("mousedown", settings.mouseDownCb)
        settings.mouseDownCbs.dragAndDrop = e => {
            const coord = this.renderer.geomtoy.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])
            Object.keys(touchables).some(name => {
                if (
                    this.renderer.isPointInFill(touchables[name].path!, ...coord) ||
                    this.renderer.isPointInStroke(touchables[name].path!, touchables[name].strokeWidth, ...coord)
                ) {
                    settings.currentTouch = touchables[name]
                    settings.currentTouchOffset = coord
                    return true
                }
            })
        }
        this.renderer.container.addEventListener("mouseup", settings.mouseUpCb)
        settings.mouseUpCbs.dragAndDrop = e => {
            settings.currentTouch = undefined
        }
        this.renderer.container.addEventListener("mousemove", settings.mouseMoveCb)
        settings.mouseMoveCbs.dragAndDrop = e => {
            const coord = this.renderer.geomtoy.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])
            if (settings.currentTouch !== undefined) {
                const [deltaX, deltaY] = [coord[0] - settings.currentTouchOffset[0], coord[1] - settings.currentTouchOffset[1]]
                settings.currentTouchOffset = coord
                settings.currentTouch.move(deltaX, deltaY)
                this.renderer.geomtoy.nextTick(() => {
                    this.collection.render(this.renderer)
                })
            } else {
                this.renderer.container.style.cursor = Object.keys(touchables).some(name => {
                    return (
                        this.renderer.isPointInFill(touchables[name].path!, ...coord) ||
                        this.renderer.isPointInStroke(touchables[name].path!, touchables[name].strokeWidth, ...coord)
                    )
                })
                    ? "pointer"
                    : "default"
            }
        }
    }
    stopDragAndDrop() {
        const settings = this.settings

        settings.mouseDownCbs.dragAndDrop = undefined
        if (settings.mouseDownCbs.zoomAndPan === undefined) this.renderer.container.removeEventListener("mousedown", settings.mouseDownCb)
        settings.mouseUpCbs.dragAndDrop = undefined
        if (settings.mouseUpCbs.zoomAndPan === undefined) this.renderer.container.removeEventListener("mouseup", settings.mouseUpCb)
        settings.mouseMoveCbs.dragAndDrop = undefined
        if (settings.mouseMoveCbs.zoomAndPan === undefined) this.renderer.container.removeEventListener("mouseup", settings.mouseMoveCb)
    }

    startZoomAndPan() {
        const settings = this.settings
        const renderer = this.renderer

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
                    this.collection.render(this.renderer)
                })
            }
        }
        renderer.container.addEventListener("wheel", settings.wheelCb)
        settings.wheelCbs.zoomAndPan = e => {
            let scale = renderer.geomtoy.scale
            scale += e.deltaY * this.zoomDeltaRate

            if (scale < this.minZoom) {
                scale = this.minZoom
            } else if (scale > this.maxZoom) {
                scale = this.maxZoom
            }

            const [innerOffsetX, innerOffsetY] = renderer.geomtoy.globalTransformation.antitransformCoordinate([e.offsetX, e.offsetY])
            renderer.geomtoy.scale = scale
            const [scaledOffsetX, scaledOffsetY] = renderer.geomtoy.globalTransformation.transformCoordinate([innerOffsetX, innerOffsetY])
            const [zoomOffsetX, zoomOffsetY] = [e.offsetX - scaledOffsetX, e.offsetY - scaledOffsetY]
            renderer.geomtoy.offset = [renderer.geomtoy.offset[0] + zoomOffsetX, renderer.geomtoy.offset[1] + zoomOffsetY]
            
            setTimeout(() => {
                this.collection.render(this.renderer)
            })
        }
    }
    stopZoomAndPan() {
        const settings = this.settings
        const renderer = this.renderer

        settings.mouseDownCbs.zoomAndPan = undefined
        if (settings.mouseDownCbs.dragAndDrop === undefined) renderer.container.removeEventListener("mousedown", settings.mouseDownCb)
        settings.mouseUpCbs.zoomAndPan = undefined
        if (settings.mouseUpCbs.dragAndDrop === undefined) renderer.container.removeEventListener("mouseup", settings.mouseUpCb)
        settings.mouseMoveCbs.zoomAndPan = undefined
        if (settings.mouseMoveCbs.dragAndDrop === undefined) renderer.container.removeEventListener("mouseup", settings.mouseMoveCb)
        settings.wheelCbs.zoomAndPan = undefined
        renderer.container.removeEventListener("wheel", settings.wheelCb)
    }

    startResponsive(callback: (...args: any[]) => any) {
        const settings = this.settings
        const renderer = this.renderer
        const parentEl = renderer.container.parentElement!

        //immediately call by `ResizeObserver` in microtask queue
        let immediatelyFirstCalled = false
        if (settings.resizeObserver !== undefined) return
        const ob = new ResizeObserver(entries => {
            renderer.container.setAttribute("width", entries[0].contentRect.width.toString())
            renderer.container.setAttribute("height", entries[0].contentRect.height.toString())
            if (!immediatelyFirstCalled) {
                immediatelyFirstCalled = true
                callback(entries[0].contentRect.width, entries[0].contentRect.height)
                this.collection.render(this.renderer)
            } else {
                setTimeout(() => {
                    callback(entries[0].contentRect.width, entries[0].contentRect.height)
                    this.collection.render(this.renderer)
                })
            }
        })
        ob.observe(parentEl)
        settings.resizeObserver = ob
    }
    stopResponsive() {
        const settings = this.settings

        if (settings.resizeObserver !== undefined) {
            settings.resizeObserver.disconnect()
            settings.resizeObserver = undefined
        }
    }
}

export default Interact

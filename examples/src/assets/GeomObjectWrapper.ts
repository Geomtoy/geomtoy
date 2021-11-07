import { PathLike, Renderer } from "../../../src/geomtoy/adaptor/adapter-types"
import GeomObject from "../../../src/geomtoy/base/GeomObject"
import { Visible } from "../../../src/geomtoy/interfaces"

class Drawable {
    constructor(
        public geomObject: GeomObject & Visible,
        public behind = false,
        public fill = "transparent",
        public stroke = "transparent",
        public strokeWidth = 1,
        public strokeDash: number[] = [],
        public strokeDashOffset: number = 0
    ) {}
}
class Touchable {
    constructor(
        public geomObject: GeomObject & Visible,
        public behind = false,
        public fill = "transparent",
        public stroke = "transparent",
        public strokeWidth = 1,
        public strokeDash: number[] = [],
        public strokeDashOffset: number = 0,
        public path?: PathLike
    ) {}
    move(deltaX: number, deltaY: number) {
        this.geomObject.moveSelf(deltaX, deltaY)
    }
}

class Collection {
    constructor(public drawables: { [key: string]: Drawable } = {}, public touchables: { [key: string]: Touchable } = {}) {}
    setDrawable(name: string, item: Drawable) {
        this.drawables[name] = item
        return this
    }
    setTouchable(name: string, item: Touchable) {
        this.touchables[name] = item
        return this
    }
    getDrawable(name: string) {
        return this.drawables[name]
    }
    getTouchable(name: string) {
        return this.touchables[name]
    }
    deleteDrawable(name: string) {
        delete this.drawables[name]
        return this
    }
    deleteTouchable(name: string) {
        delete this.touchables[name]
        return this
    }
    render(renderer: Renderer) {
        renderer.clear()
        Object.keys(this.drawables).forEach(key => {
            let item = this.drawables[key]
            renderer.fill(item.fill)
            renderer.stroke(item.stroke)
            renderer.strokeWidth(item.strokeWidth)
            renderer.strokeDash(item.strokeDash)
            renderer.strokeDashOffset(item.strokeDashOffset)
            renderer.draw(item.geomObject, item.behind)
        })
        Object.keys(this.touchables).forEach(key => {
            let item = this.touchables[key]
            renderer.fill(item.fill)
            renderer.stroke(item.stroke)
            renderer.strokeWidth(item.strokeWidth)
            renderer.strokeDash(item.strokeDash)
            renderer.strokeDashOffset(item.strokeDashOffset)
            item.path = renderer.draw(item.geomObject, item.behind)
        })
    }
}

export { Drawable, Touchable, Collection }

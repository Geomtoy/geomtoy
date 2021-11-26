import { PathLike, Renderer } from "../../../src/geomtoy/types"
import Shape from "../../../src/geomtoy/base/Shape"
import Group from "../../../src/geomtoy/group"

class Drawable {
    constructor(
        public object: Shape | Group,
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
        public object: Shape | Group,
        public behind = false,
        public fill = "transparent",
        public stroke = "transparent",
        public strokeWidth = 1,
        public strokeDash: number[] = [],
        public strokeDashOffset: number = 0,
        public path?: PathLike | PathLike[]
    ) {}
    move(deltaX: number, deltaY: number) {
        this.object.moveSelf(deltaX, deltaY)
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
            let d = this.drawables[key]
            renderer.fill(d.fill)
            renderer.stroke(d.stroke)
            renderer.strokeWidth(d.strokeWidth)
            renderer.strokeDash(d.strokeDash)
            renderer.strokeDashOffset(d.strokeDashOffset)
            if (d.object instanceof Shape) {
                renderer.draw(d.object, d.behind)
            }
            if (d.object instanceof Group) {
                renderer.drawBatch(d.object.items, d.behind)
            }
        })
        Object.keys(this.touchables).forEach(key => {
            let t = this.touchables[key]
            renderer.fill(t.fill)
            renderer.stroke(t.stroke)
            renderer.strokeWidth(t.strokeWidth)
            renderer.strokeDash(t.strokeDash)
            renderer.strokeDashOffset(t.strokeDashOffset)
            if (t.object instanceof Shape) {
                t.path = renderer.draw(t.object, t.behind)
            }
            if (t.object instanceof Group) {
                t.path = renderer.drawBatch(t.object.items, t.behind)
            }
        })
    }
}

export { Drawable, Touchable, Collection }

import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"

export default class VanillaCanvas {
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    geomtoy: Geomtoy
    constructor(context: any, geomtoy: Geomtoy) {
        if (context instanceof CanvasRenderingContext2D || context instanceof OffscreenCanvasRenderingContext2D) {
            this.context = context
            this.geomtoy = geomtoy
            return this
        }
        throw new Error(`[G]Unable to initialize.`)
    }
    setup() {
        let gt = this.geomtoy.globalTransformation
        this.context.setTransform(gt.a, gt.b, gt.c, gt.d, gt.e, gt.f)
    }

    draw(object: GeomObject & Visible) {
        this.context.save()
        this.setup()
        let ds = object.getGraphic("canvas"),
            path2D = new Path2D()

        ds.forEach(d => {
            if (d.type === "moveTo") {
                path2D.moveTo(d.x, d.y)
            }
            if (d.type === "lineTo") {
                path2D.lineTo(d.x, d.y)
            }
            if (d.type === "bezierCurveTo") {
                path2D.bezierCurveTo(d.cp1x, d.cp1y, d.cp2x, d.cp2y, d.x, d.y)
            }
            if (d.type === "quadraticCurveTo") {
                path2D.quadraticCurveTo(d.cpx, d.cpy, d.x, d.y)
            }
            if (d.type === "arc") {
                path2D.arc(d.x, d.y, d.r, d.startAngle, d.endAngle, d.anticlockwise)
            }
            if (d.type === "ellipse") {
                path2D.ellipse(d.x, d.y, d.rx, d.ry, d.xAxisRotation, d.startAngle, d.endAngle, d.anticlockwise)
            }
            if (d.type === "closePath") {
                path2D.closePath()
            }
        })
        this.context.fill(path2D)
        this.context.stroke(path2D)
        this.context.restore()
        return path2D
    }

    drawBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.draw(o))
    }
    clear() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    }
}

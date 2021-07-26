import _ from "lodash"
import Geomtoy from ".."
import GeomObject from "../base/GeomObject"

export default class {
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
        let gt = this.geomtoy.getGlobalTransformation()
        this.context.setTransform(gt.a, gt.b, gt.c, gt.d, gt.e, gt.f)
    }
    draw(object: GeomObject) {
        let ds = object.getGraphic("svg"),
            ct = this.context.getTransform()
        this.setup()
        this.context.beginPath()
        _.forEach(ds, d => {
            if (d.type === "moveTo") {
                this.context.moveTo(d.x, d.y)
            }
            if (d.type === "lineTo") {
                this.context.lineTo(d.x, d.y)
            }
            if (d.type === "bezierCurveTo") {
                this.context.bezierCurveTo(d.cp1x, d.cp1y, d.cp2x, d.cp2y, d.x, d.y)
            }
            if (d.type === "quadraticCurveTo") {
                this.context.quadraticCurveTo(d.cpx, d.cpy, d.x, d.y)
            }
            if (d.type === "arc") {
                this.context.arc(d.x, d.y, d.r, d.startAngle, d.endAngle, d.anticlockwise)
            }
            if (d.type === "ellipse") {
                this.context.ellipse(d.x, d.y, d.rx, d.ry, d.xAxisRotation, d.startAngle, d.endAngle, d.anticlockwise)
            }
            if (d.type === "closePath") {
                this.context.closePath()
            }
        })
        this.context.fill()
        this.context.stroke()
        this.context.setTransform(ct)
        return this.context
    }
    clear() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
        return this.context
    }
}

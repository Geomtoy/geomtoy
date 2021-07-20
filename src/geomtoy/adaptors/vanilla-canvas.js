import Graphic from "../graphic"
import { GraphicImplType } from "../types"
import _ from "lodash"
import GeomObject from "../base/GeomObject"

export default class {
    constructor(context) {
        if (context instanceof CanvasRenderingContext2D) {
            this.context = context
            return this
        }
        throw new Error(`[G]Unable to initialize because the parameter is not a \`CanvasRenderingContext2D\`.`)
    }
    draw(object) {
        let ds = object.getGraphic(GraphicImplType.Canvas)

        this.context.beginPath()
        _.forEach(ds, d => {
            if (d.type === Graphic.canvasDirectives.moveTo) {
                this.context.moveTo(d.x, d.y)
            }
            if (d.type === Graphic.canvasDirectives.lineTo) {
                this.context.lineTo(d.x, d.y)
            }
            if (d.type === Graphic.canvasDirectives.bezierCurveTo) {
                this.context.bezierCurveTo(d.cp1x, d.cp1y, d.cp2x, d.cp2y, d.x, d.y)
            }
            if (d.type === Graphic.canvasDirectives.quadraticCurveTo) {
                this.context.quadraticCurveTo(d.cpx, d.cpy, d.x, d.y)
            }
            if (d.type === Graphic.canvasDirectives.arc) {
                this.context.arc(d.x, d.y, d.r, d.startAngle, d.endAngle, d.anticlockwise)
            }
            if (d.type === Graphic.canvasDirectives.ellipse) {
                this.context.ellipse(d.x, d.y, d.rx, d.ry, d.xAxisRotation, d.startAngle, d.endAngle, d.anticlockwise)
            }
            if (d.type === Graphic.canvasDirectives.closePath) {
                this.context.closePath()
            }
        })
        this.context.fill()
        this.context.stroke()
    }
    clear() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    }
}

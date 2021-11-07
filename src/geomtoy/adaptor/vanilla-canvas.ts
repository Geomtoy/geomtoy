import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"
import { AdapterOptions, LineCapType, LineJoinType, Renderer } from "./adapter-types"
/**
 * @category Adapter
 */
export default class VanillaCanvas implements Renderer {
    container: HTMLCanvasElement
    geomtoy: Geomtoy

    public context: CanvasRenderingContext2D

    private _stroke: string = "transparent"
    private _strokeDash: number[] = []
    private _strokeDashOffset: number = 0
    private _strokeWidth: number = 1
    private _fill: string = "transparent"

    private _lineJoin: LineJoinType
    private _miterLimit: number
    private _lineCap: LineCapType

    constructor(container: HTMLCanvasElement, geomtoy: Geomtoy, options?: Partial<AdapterOptions>) {
        if (container instanceof HTMLCanvasElement) {
            this.container = container
            this.geomtoy = geomtoy

            this.context = this.container.getContext("2d")!

            this._lineJoin = options?.lineJoin ?? "miter"
            this._lineCap = options?.lineCap ?? "butt"
            this._miterLimit = options?.miterLimit ?? 10

            return this
        }
        throw new Error(`[G]Unable to initialize.`)
    }

    setup() {
        const gt = this.geomtoy.globalTransformation.get()
        this.context.setTransform(...gt)
        this.context.lineJoin = this._lineJoin
        this.context.miterLimit = this._miterLimit
        this.context.lineCap = this._lineCap
    }
    draw(object: GeomObject & Visible, behind = false) {
        this.context.save()
        this.setup()
        const cmds = object.getGraphics()
        const path2D = new Path2D()

        this._strokeDash.length > 0 && this.context.setLineDash(this._strokeDash)
        this._strokeDash.length > 0 && (this.context.lineDashOffset = this._strokeDashOffset)
        this.context.lineWidth = this._strokeWidth
        this.context.strokeStyle = this._stroke
        this.context.fillStyle = this._fill

        if (cmds.length === 1 && cmds[0].type === "text") {
            const cmd = cmds[0]
            // text baseline
            this.context.textBaseline = "alphabetic"
            // text font style
            let fontStyle = ""
            cmd.fontBold && (fontStyle += "bold ")
            cmd.fontItalic && (fontStyle += "italic ")
            fontStyle += `${cmd.fontSize}px `
            fontStyle += cmd.fontFamily
            this.context.font = fontStyle
            // handle text orientation
            this.context.save()
            this.context.transform(...this.geomtoy.globalTransformation.invert().get()) // resetTransform
            // text
            if (behind) {
                this.context.globalCompositeOperation = "destination-over"
            } else {
                this.context.globalCompositeOperation = "source-over"
            }
            this.context.fillText(cmd.text, ...this.geomtoy.globalTransformation.transformCoordinate([cmd.x, cmd.y]))
            this.context.restore()
            // draw transparent bounding box
            this.context.strokeStyle = "transparent"
            this.context.fillStyle = "transparent"
            const metrics = this.context.measureText(cmd.text)
            const width = metrics.width / this.geomtoy.scale
            const height = (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent) / this.geomtoy.scale
            const offsetY = this.geomtoy.yAxisPositiveOnBottom ? height : 0
            const offsetX = this.geomtoy.xAxisPositiveOnRight ? 0 : width
            const box = [cmd.x - offsetX, cmd.y - offsetY, width, height]
            // bounding box
            path2D.moveTo(box[0], box[1])
            path2D.lineTo(box[0] + box[2], box[1])
            path2D.lineTo(box[0] + box[2], box[1] + box[3])
            path2D.lineTo(box[0], box[1] + box[3])
            path2D.closePath()
        } else {
            cmds.forEach(cmd => {
                if (cmd.type === "moveTo") {
                    path2D.moveTo(cmd.x, cmd.y)
                }
                if (cmd.type === "lineTo") {
                    path2D.lineTo(cmd.x, cmd.y)
                }
                if (cmd.type === "bezierCurveTo") {
                    path2D.bezierCurveTo(cmd.controlPoint1X, cmd.controlPoint1Y, cmd.controlPoint2X, cmd.controlPoint2Y, cmd.x, cmd.y)
                }
                if (cmd.type === "quadraticBezierCurveTo") {
                    path2D.quadraticCurveTo(cmd.controlPointX, cmd.controlPointY, cmd.x, cmd.y)
                }
                if (cmd.type === "arcTo") {
                    path2D.ellipse(cmd.centerX, cmd.centerY, cmd.radiusX, cmd.radiusY, cmd.xAxisRotation, cmd.startAngle, cmd.endAngle, !cmd.positive)
                }
                if (cmd.type === "close") {
                    path2D.closePath()
                }
            })
        }
        if (behind) {
            this.context.globalCompositeOperation = "destination-over"
        } else {
            this.context.globalCompositeOperation = "source-over"
        }
        this.context.fill(path2D)
        this.context.stroke(path2D)
        this.context.restore()
        return path2D
    }

    stroke(stroke: string) {
        this._stroke = stroke
    }
    strokeWidth(strokeWidth: number) {
        this._strokeWidth = strokeWidth / this.geomtoy.scale
    }
    strokeDash(strokeDash: number[]) {
        this._strokeDash = strokeDash.map(n => n / this.geomtoy.scale)
    }
    strokeDashOffset(strokeDashOffset: number) {
        this._strokeDashOffset = strokeDashOffset / this.geomtoy.scale
    }
    fill(fill: string) {
        this._fill = fill
    }
    isPointInFill(path2D: Path2D, x: number, y: number) {
        return this.context.isPointInPath(path2D, x, y)
    }
    isPointInStroke(path2D: Path2D, strokeWidth: number, x: number, y: number) {
        this.context.save()
        this.context.lineWidth = strokeWidth / this.geomtoy.scale
        const d = this.context.isPointInStroke(path2D, x, y)
        this.context.restore()
        return d
    }

    drawBatch(objects: (GeomObject & Visible)[], behind = false) {
        return objects.map(o => this.draw(o, behind))
    }
    clear() {
        this.context.clearRect(0, 0, this.container.width, this.container.height)
    }
}

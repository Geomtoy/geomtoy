import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"
import { GraphicsTextCommand } from "../types"
/**
 * @category Adapter
 */
export default class VanillaCanvas {
    container: HTMLCanvasElement
    geomtoy: Geomtoy

    public context: CanvasRenderingContext2D

    private _stroke: string = "transparent"
    private _strokeDash: number[] = []
    private _strokeDashOffset: number = 0
    private _strokeWidth: number = 1
    private _fill: string = "transparent"

    private _lineJoin: "bevel" | "miter" | "round"
    private _miterLimit: number
    private _lineCap: "butt" | "round" | "square"

    constructor(container: HTMLCanvasElement, geomtoy: Geomtoy, options?: { lineJoin?: "bevel" | "miter" | "round"; miterLimit?: number; lineCap?: "butt" | "round" | "square" }) {
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
        const [a, b, c, d, e, f] = this.geomtoy.globalTransformation.get()
        this.context.setTransform(a, b, c, d, e, f)
        this.context.lineJoin = this._lineJoin
        this.context.miterLimit = this._miterLimit
        this.context.lineCap = this._lineCap
    }

    private _drawText(cmd: GraphicsTextCommand, path2D: Path2D) {
        // text
        this.context.textAlign = "start" //default of `Canvas`
        this.context.textBaseline = "alphabetic" //default of `Canvas`, `baseline`
        this.context.font = `${cmd.font.bold ? "bold" : ""} ${cmd.font.italic ? "italic" : ""} ${cmd.font.size}px ${cmd.font.family}`
        // handle text orientation
        this.context.save()
        this.context.transform(...this.geomtoy.globalTransformation.invert().get())
        this.context.fillText(cmd.text, ...this.geomtoy.globalTransformation.transformCoordinate([cmd.x, cmd.y]))
        this.context.restore()
        // draw transparent bounding box
        // this.context.strokeStyle = "transparent"
        // this.context.fillStyle = "transparent"
        this.context.strokeStyle = "transparent"
        this.context.fillStyle = "#FF000080"
        const metrics = this.context.measureText(cmd.text)
        const width = metrics.width / this.geomtoy.scale
        const ascent = metrics.fontBoundingBoxAscent / this.geomtoy.scale
        const descent = metrics.fontBoundingBoxDescent / this.geomtoy.scale
        const height = ascent + descent
        const offsetY = this.geomtoy.yAxisPositiveOnBottom ? ascent : descent
        const offsetX = this.geomtoy.xAxisPositiveOnRight ? 0 : width
        const box = [cmd.x - offsetX, cmd.y - offsetY, width, height]
        
        path2D.moveTo(box[0],box[1])
        path2D.lineTo(box[0]+box[2], box[1])
        path2D.lineTo(box[0]+box[2],box[1]+box[3])
        path2D.lineTo(box[0],box[1]+box[3])
        path2D.closePath()
    }
    private _draw(object: GeomObject & Visible) {
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
            this._drawText(cmd, path2D)
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
        this.context.fill(path2D)
        this.context.stroke(path2D)
        this.context.restore()
        return path2D
    }
    
    stroke(stroke:string){
        this._stroke = stroke
    }
    strokeWidth(strokeWidth:number){
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
        // console.log(path2D,x,y)
        return this.context.isPointInPath(path2D, x, y)
    }
    isPointInStroke(path2D: Path2D, x: number, y: number) {
        return this.context.isPointInStroke(path2D, x, y)
    }

    draw(object: GeomObject & Visible) {
        this.context.globalCompositeOperation = "source-over"
        return this._draw(object)
    }
    drawBehind(object: GeomObject & Visible) {
        this.context.globalCompositeOperation = "destination-over"
        return this._draw(object)
    }
    drawBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.draw(o))
    }
    drawBehindBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.drawBehind(o))
    }
    clear() {
        this.context.clearRect(0, 0, this.container.width, this.container.height)
    }
}

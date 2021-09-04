import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"
/**
 * @category Adapter
 */
export default class VanillaCanvas {
    canvas: HTMLCanvasElement
    geomtoy: Geomtoy

    private _context: CanvasRenderingContext2D

    private _stroke: string = "#000000FF"
    private _strokeDash: number[] = []
    private _strokeDashOffset: number = 0
    private _strokeWidth: number = 1
    private _fill: string = "#000000FF"

    private _lineJoin: "bevel" | "miter" | "round" = "miter"
    private _miterLimit: number = 10
    private _lineCap: "butt" | "round" | "square" = "butt"

    constructor(canvas: HTMLCanvasElement, geomtoy: Geomtoy, options?: { lineJoin: "bevel" | "miter" | "round"; miterLimit: number; lineCap: "butt" | "round" | "square" }) {
        if (canvas instanceof HTMLCanvasElement) {
            this.canvas = canvas
            this.geomtoy = geomtoy

            this._context = this.canvas.getContext("2d")!

            this._lineJoin = options?.lineJoin ?? this._lineJoin
            this._lineCap = options?.lineCap ?? this._lineCap
            this._miterLimit = options?.miterLimit ?? this._miterLimit
            return this
        }
        throw new Error(`[G]Unable to initialize.`)
    }
    zoom() {}
    pan() {}

    setup() {
        let [a, b, c, d, e, f] = this.geomtoy.globalTransformation.get()
        this._context.setTransform(a, b, c, d, e, f)
        this._context.lineJoin = this._lineJoin
        this._context.miterLimit = this._miterLimit
        this._context.lineCap = this._lineCap
    }

    private _draw(object: GeomObject & Visible) {
        this._context.save()
        this.setup()
        let cmds = object.getGraphics("canvas"),
            path2D = new Path2D()

        this._strokeDash.length > 0 && this._context.setLineDash(this._strokeDash)
        this._strokeDash.length > 0 && (this._context.lineDashOffset = this._strokeDashOffset)

        this._context.lineWidth = this._strokeWidth
        this._context.strokeStyle = this._stroke
        this._context.fillStyle = this._fill

        if(cmds.some(cmd=>cmd.type ==="text")){
            


        }


        cmds.forEach(cmd => {
            if (cmd.type === "moveTo") {
                path2D.moveTo(cmd.x, cmd.y)
            }
            if (cmd.type === "lineTo") {
                path2D.lineTo(cmd.x, cmd.y)
            }
            if (cmd.type === "bezierCurveTo") {
                path2D.bezierCurveTo(cmd.cp1x, cmd.cp1y, cmd.cp2x, cmd.cp2y, cmd.x, cmd.y)
            }
            if (cmd.type === "quadraticCurveTo") {
                path2D.quadraticCurveTo(cmd.cpx, cmd.cpy, cmd.x, cmd.y)
            }
            if (cmd.type === "arc") {
                path2D.arc(cmd.x, cmd.y, cmd.r, cmd.startAngle, cmd.endAngle, cmd.anticlockwise)
            }
            if (cmd.type === "ellipse") {
                path2D.ellipse(cmd.x, cmd.y, cmd.rx, cmd.ry, cmd.xAxisRotation, cmd.startAngle, cmd.endAngle, cmd.anticlockwise)
            }
            if (cmd.type === "closePath") {
                path2D.closePath()
            }
        })
        this._context.fill(path2D)
        this._context.stroke(path2D)
        this._context.restore()
        return path2D
    }
    stroke(color: string) {
        this._stroke = color
    }
    strokeWidth(strokeWidth: number) {
        this._strokeWidth = strokeWidth
    }
    strokeDash(strokeDash: number[]) {
        this._strokeDash = strokeDash
    }
    strokeDashOffset(strokeDashOffset: number) {
        this._strokeDashOffset = strokeDashOffset
    }
    fill(fill: string) {
        this._fill = fill
    }
    isPointInFill(path2D: Path2D, x: number, y: number) {
        return this._context.isPointInPath(path2D, x, y)
    }
    isPointInStroke(path2D: Path2D, x: number, y: number) {
        return this._context.isPointInStroke(path2D, x, y)
    }

    draw(object: GeomObject & Visible) {
        this._context.globalCompositeOperation = "source-over"
        return this._draw(object)
    }
    drawBehind(object: GeomObject & Visible) {
        this._context.globalCompositeOperation = "destination-over"
        return this._draw(object)
    }
    drawBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.draw(o))
    }
    drawBehindBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.drawBehind(o))
    }
    clear() {
        this._context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
}

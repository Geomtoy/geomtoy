import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"

/**
 * @category Adapter
 */
export default class VanillaSvg {
    container: SVGSVGElement
    geomtoy: Geomtoy

    private gEl: SVGGElement

    private _stroke: string = "#000000FF"
    private _strokeDash: number[] = []
    private _strokeDashOffset: number = 0
    private _strokeWidth: number = 1
    private _fill: string = "#000000FF"

    private _lineJoin: "bevel" | "miter" | "round"
    private _miterLimit: number
    private _lineCap: "butt" | "round" | "square"

    constructor(container: SVGSVGElement, geomtoy: Geomtoy, options?: { lineJoin?: "bevel" | "miter" | "round"; miterLimit?: number; lineCap?: "butt" | "round" | "square" }) {
        if (container instanceof SVGSVGElement) {
            this.container = container
            this.geomtoy = geomtoy

            this.gEl = document.createElementNS("http://www.w3.org/2000/svg", "g")
            this.gEl.setAttribute("id", "geomtoy")
            this.container.append(this.gEl)

            this._lineJoin = options?.lineJoin ?? "miter"
            this._lineCap = options?.lineCap ?? "butt"
            this._miterLimit = options?.miterLimit ?? 10

            return this
        }
        throw new Error(`[G]Unable to initialize.`)
    }

    setup() {
        let [a, b, c, d, e, f] = this.geomtoy.globalTransformation.get()
        this.gEl.setAttribute("transform", `matrix(${a} ${b} ${c} ${d} ${e} ${f})`)
        this.gEl.setAttribute("stroke-linejoin", this._lineJoin)
        this.gEl.setAttribute("stroke-miterlimit", this._miterLimit.toString())
        this.gEl.setAttribute("stroke-linecap", this._lineCap)
    }

    private _draw(object: GeomObject & Visible, func: Function) {
        this.setup()
        let ds = object.getGraphics(),
            pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path"),
            attrD = ""

        this._strokeDash.length > 0 && pathEl.setAttribute("stroke-dasharray", this._strokeDash.toString())
        this._strokeDash.length > 0 && pathEl.setAttribute("stroke-dashoffset", this._strokeDashOffset.toString())
        pathEl.setAttribute("stroke-width", this._strokeWidth.toString())
        pathEl.setAttribute("stroke", this._stroke)
        pathEl.setAttribute("fill", this._fill)

        ds.forEach(d => {
            if (d.type === "moveTo") {
                attrD += `M${d.x},${d.y}`
            }
            if (d.type === "lineTo") {
                attrD += `L${d.x},${d.y}`
            }
            if (d.type === "bezierCurveTo") {
                attrD += `C${d.controlPoint1X},${d.controlPoint1Y} ${d.controlPoint2X},${d.controlPoint2Y} ${d.x},${d.y}`
            }
            if (d.type === "quadraticBezierCurveTo") {
                attrD += `Q${d.controlPointX},${d.controlPointY} ${d.x},${d.y}`
            }
            if (d.type === "arcTo") {
                attrD += `A${d.radiusX} ${d.radiusY} ${d.xAxisRotation} ${d.largeArc ? 1 : 0} ${d.positive ? 1 : 0} ${d.x},${d.y}`
            }
            if (d.type === "close") {
                attrD += `Z`
            }
        })
        pathEl.setAttribute("d", attrD)
        func(pathEl)
        return pathEl
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
    isPointInFill(pathEl: SVGPathElement, x: number, y: number) {
        const point = this.container.createSVGPoint() || new DOMPoint()
        point.x = x
        point.y = y
        // typescript inheritance error here: `SVGPathElement` inherited from `SVGGraphicsElement`
        return (pathEl as any as SVGGeometryElement).isPointInFill(point)
    }
    isPointInStroke(pathEl: SVGPathElement, x: number, y: number) {
        const point = this.container.createSVGPoint() || new DOMPoint()
        point.x = x
        point.y = y
        // typescript inheritance error here: `SVGPathElement` inherited from `SVGGraphicsElement`
        return (pathEl as any as SVGGeometryElement).isPointInStroke(point)
    }
    draw(object: GeomObject & Visible) {
        return this._draw(object, (pathEl: SVGPathElement) => {
            this.gEl.append(pathEl)
        })
    }
    drawBehind(object: GeomObject & Visible) {
        return this._draw(object, (pathEl: SVGPathElement) => {
            this.gEl.prepend(pathEl)
        })
    }
    drawBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.draw(o))
    }
    drawBehindBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.drawBehind(o))
    }
    clear() {
        this.gEl.innerHTML = ""
    }
}

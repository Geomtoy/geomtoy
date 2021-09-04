import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"

/**
 * @category Adapter
 */
export default class VanillaSvg {
    svg: SVGSVGElement
    geomtoy: Geomtoy

    private _gEl: SVGGElement

    private _stroke: string = "#000000FF"
    private _strokeDash: number[] = []
    private _strokeDashOffset: number = 0
    private _strokeWidth: number = 1
    private _fill: string = "#000000FF"

    private _lineJoin: "bevel" | "miter" | "round" = "miter"
    private _miterLimit: number = 10
    private _lineCap: "butt" | "round" | "square" = "butt"

    constructor(svg: SVGSVGElement, geomtoy: Geomtoy, options?: { lineJoin: "bevel" | "miter" | "round"; miterLimit: number; lineCap: "butt" | "round" | "square" }) {
        if (svg instanceof SVGSVGElement) {
            this.svg = svg
            this.geomtoy = geomtoy

            this._gEl = document.createElementNS("http://www.w3.org/2000/svg", "g")
            this._gEl.setAttribute("id", "geomtoy")
            this.svg.append(this._gEl)

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
        this._gEl.setAttribute("transform", `matrix(${a} ${b} ${c} ${d} ${e} ${f})`)
        this._gEl.setAttribute("stroke-linejoin", this._lineJoin)
        this._gEl.setAttribute("stroke-miterlimit", this._miterLimit.toString())
        this._gEl.setAttribute("stroke-linecap", this._lineCap)
    }

    private _draw(object: GeomObject & Visible, func: Function) {
        this.setup()
        let ds = object.getGraphics("svg"),
            pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path"),
            attrD = ""

        this._strokeDash.length > 0 && pathEl.setAttribute("stroke-dasharray", this._strokeDash.toString())
        this._strokeDash.length > 0 && pathEl.setAttribute("stroke-dashoffset", this._strokeDashOffset.toString())
        pathEl.setAttribute("stroke-width", this._strokeWidth.toString())
        pathEl.setAttribute("stroke", this._stroke)
        pathEl.setAttribute("fill", this._fill)

        ds.forEach(d => {
            if (d.type === "M") {
                attrD += `M${d.x},${d.y}`
            }
            if (d.type === "L") {
                attrD += `L${d.x},${d.y}`
            }
            if (d.type === "C") {
                attrD += `C${d.cp1x},${d.cp1y} ${d.cp2x},${d.cp2y} ${d.x},${d.y}`
            }
            if (d.type === "Q") {
                attrD += `C${d.cpx},${d.cpy} ${d.x},${d.y}`
            }
            if (d.type === "A") {
                attrD += `A${d.rx} ${d.ry} ${d.xAxisRotation} ${d.largeArcFlag ? 1 : 0} ${d.sweepFlag ? 1 : 0} ${d.x},${d.y}`
            }
            if (d.type === "Z") {
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
        const point = this.svg.createSVGPoint() || new DOMPoint()
        point.x = x
        point.y = y
        // typescript inheritance error here: `SVGPathElement` inherited from `SVGGraphicsElement`
        return (pathEl as any as SVGGeometryElement).isPointInFill(point)
    }
    isPointInStroke(pathEl: SVGPathElement, x: number, y: number) {
        const point = this.svg.createSVGPoint() || new DOMPoint()
        point.x = x
        point.y = y
        // typescript inheritance error here: `SVGPathElement` inherited from `SVGGraphicsElement`
        return (pathEl as any as SVGGeometryElement).isPointInStroke(point)
    }
    draw(object: GeomObject & Visible) {
        return this._draw(object, (pathEl: SVGPathElement) => {
            this._gEl.append(pathEl)
        })
    }
    drawBehind(object: GeomObject & Visible) {
        return this._draw(object, (pathEl: SVGPathElement) => {
            this._gEl.prepend(pathEl)
        })
    }
    drawBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.draw(o))
    }
    drawBehindBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.drawBehind(o))
    }
    clear() {
        this._gEl.innerHTML = ""
    }
}

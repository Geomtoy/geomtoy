import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"
import { AdapterOptions, LineCapType, LineJoinType } from "./adapter-types"
/**
 * @category Adapter
 */
export default class VanillaSvg {
    container: SVGSVGElement
    geomtoy: Geomtoy

    private gEl: SVGGElement

    private _stroke: string = "transparent"
    private _strokeDash: number[] = []
    private _strokeDashOffset: number = 0
    private _strokeWidth: number = 1
    private _fill: string = "transparent"

    private _lineJoin: LineJoinType
    private _miterLimit: number
    private _lineCap: LineCapType

    constructor(container: SVGSVGElement, geomtoy: Geomtoy, options?: Partial<AdapterOptions>) {
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
        const gt = this.geomtoy.globalTransformation.get()
        this.gEl.setAttribute("transform", `matrix(${gt.join(" ")})`)
        this.gEl.setAttribute("stroke-linejoin", this._lineJoin)
        this.gEl.setAttribute("stroke-miterlimit", this._miterLimit.toString())
        this.gEl.setAttribute("stroke-linecap", this._lineCap)
    }
    draw(object: GeomObject & Visible, behind = false) {
        this.setup()
        const cmds = object.getGraphics()
        const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path")

        this._strokeDash.length > 0 && pathEl.setAttribute("stroke-dasharray", this._strokeDash.toString())
        this._strokeDash.length > 0 && pathEl.setAttribute("stroke-dashoffset", this._strokeDashOffset.toString())
        pathEl.setAttribute("stroke-width", this._strokeWidth.toString())
        pathEl.setAttribute("stroke", this._stroke)
        pathEl.setAttribute("fill", this._fill)

        if (cmds.length === 1 && cmds[0].type === "text") {
            const cmd = cmds[0]
            const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text")

            // text baseline
            textEl.setAttribute("dominant-baseline", "alphabetic")
            // text font style
            cmd.font.bold && textEl.setAttribute("font-weight", "bold")
            cmd.font.italic && textEl.setAttribute("font-style", "italic")
            textEl.setAttribute("font-family", cmd.font.family)
            textEl.setAttribute("font-size", cmd.font.size.toString())
            // handle text orientation
            textEl.setAttribute("transform", `matrix(${this.geomtoy.globalTransformation.invert().get().join(" ")})`)
            // text
            if (behind) {
                this.gEl.prepend(textEl)
            } else {
                this.gEl.append(textEl)
            }
            textEl.innerHTML = cmd.text
            textEl.setAttribute("fill", this._fill)
            textEl.setAttribute("style", "user-select: none; pointer-events: none;")
            const [tx, ty] = this.geomtoy.globalTransformation.transformCoordinate([cmd.x, cmd.y])
            textEl.setAttribute("x", tx.toString())
            textEl.setAttribute("y", ty.toString())
            // draw transparent bounding box
            pathEl.setAttribute("stroke", "transparent")
            pathEl.setAttribute("fill", "transparent")
            const bbox = textEl.getBBox()
            const width = bbox.width / this.geomtoy.scale
            const height = bbox.height / this.geomtoy.scale
            const offsetY = this.geomtoy.yAxisPositiveOnBottom ? height : 0
            const offsetX = this.geomtoy.xAxisPositiveOnRight ? 0 : width
            const box = [cmd.x - offsetX, cmd.y - offsetY, width, height]
            // bounding box
            let attrD = ""
            attrD += `M${[box[0], box[1]].join(",")}`
            attrD += `L${[box[0] + box[2], box[1]].join(",")}`
            attrD += `L${[box[0] + box[2], box[1] + box[3]].join(",")}`
            attrD += `L${[box[0], box[1] + box[3]].join(",")}`
            attrD += `Z`
            pathEl.setAttribute("d", attrD)
        } else {
            let attrD = ""
            cmds.forEach(cmd => {
                if (cmd.type === "moveTo") {
                    attrD += `M${cmd.x},${cmd.y}`
                }
                if (cmd.type === "lineTo") {
                    attrD += `L${cmd.x},${cmd.y}`
                }
                if (cmd.type === "bezierCurveTo") {
                    attrD += `C${cmd.controlPoint1X},${cmd.controlPoint1Y} ${cmd.controlPoint2X},${cmd.controlPoint2Y} ${cmd.x},${cmd.y}`
                }
                if (cmd.type === "quadraticBezierCurveTo") {
                    attrD += `Q${cmd.controlPointX},${cmd.controlPointY} ${cmd.x},${cmd.y}`
                }
                if (cmd.type === "arcTo") {
                    attrD += `A${cmd.radiusX} ${cmd.radiusY} ${cmd.xAxisRotation} ${cmd.largeArc ? 1 : 0} ${cmd.positive ? 1 : 0} ${cmd.x},${cmd.y}`
                }
                if (cmd.type === "close") {
                    attrD += `Z`
                }
            })
            pathEl.setAttribute("d", attrD)
        }
        if (behind) {
            this.gEl.prepend(pathEl)
        } else {
            this.gEl.append(pathEl)
        }
        return pathEl
    }
    drawBatch(objects: (GeomObject & Visible)[], behind = false) {
        return objects.map(o => this.draw(o, behind))
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

    clear() {
        this.gEl.innerHTML = ""
    }
}

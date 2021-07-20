import Graphic from "../graphic"
import { GraphicImplType } from "../types"
import GeomObject from "../base/GeomObject"
import _ from "lodash"

export default class {
    constructor(svgContainer) {
        if (svgContainer instanceof SVGGElement || svgContainer instanceof SVGSVGElement) {
            this.svgContainer = svgContainer
            return this
        }
        throw new Error(`[G]Unable to initialize because the parameter is not a \`SVGGElement\` or \`SVGSVGElement\`.`)
    }
    draw(object) {
        let ds = object.getGraphic(GraphicImplType.Svg),
            path = document.createElementNS("http://www.w3.org/2000/svg", "path"),
            attrD = ""

        _.forEach(ds, d => {
            if (d.type === Graphic.svgDirectives.M) {
                attrD += `M${d.x},${d.y}`
            }
            if (d.type === Graphic.svgDirectives.L) {
                attrD += `L${d.x},${d.y}`
            }
            if (d.type === Graphic.svgDirectives.C) {
                attrD += `C${d.cp1x},${d.cp1y} ${d.cp2x},${d.cp2y} ${d.x},${d.y}`
            }
            if (d.type === Graphic.svgDirectives.Q) {
                attrD += `C${d.cpx},${d.cpy} ${d.x},${d.y}`
            }
            if (d.type === Graphic.svgDirectives.A) {
                attrD += `A${d.rx} ${d.ry} ${d.xAxisRotation} ${d.largeArcFlag ? 1 : 0} ${d.sweepFlag ? 1 : 0} ${d.x},${d.y}`
            }
            if (d.type === Graphic.svgDirectives.Z) {
                attrD += `Z`
            }
        })
        path.setAttribute("d", attrD)
        this.svgContainer.appendChild(path)
    }
    clear() {
        this.svgContainer.innerHTML = ""
    }
}

import _ from "lodash"
import Geomtoy from ".."
import GeomObject from "../base/GeomObject"

export default class {
    svgContainer: SVGGElement | SVGSVGElement
    geomtoy:Geomtoy

    constructor(svgContainer: any, geomtoy: Geomtoy) {
        if (svgContainer instanceof SVGGElement || svgContainer instanceof SVGSVGElement) {
            this.svgContainer = svgContainer
            this.geomtoy = geomtoy
            return this
        }
        throw new Error(`[G]Unable to initialize.`)
    }
    setup(){
        let gt = this.geomtoy.getGlobalTransformation()
        this.svgContainer.setAttribute("transform", `matrix(${gt.a} ${gt.b} ${gt.c} ${gt.d} ${gt.e} ${gt.f})`)
    }
    draw(object: GeomObject) {
        let ds = object.getGraphic("svg"),
            elemPath =   document.createElementNS("http://www.w3.org/2000/svg", "path"),
            attrD = ""
        this.setup()

        _.forEach(ds, d => {
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
        elemPath.setAttribute("d", attrD)
        this.svgContainer.appendChild(elemPath)
        return this.svgContainer
    }
    clear() {
        this.svgContainer.innerHTML = ""
        return this.svgContainer
    }
}

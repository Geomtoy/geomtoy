import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"
/**
 * @category Adapter
 */
export default class VanillaSvg {
    svgContainer: SVGGElement | SVGSVGElement
    geomtoy: Geomtoy

    constructor(svgContainer: SVGGElement | SVGSVGElement, geomtoy: Geomtoy) {
        if (svgContainer instanceof SVGGElement || svgContainer instanceof SVGSVGElement) {
            this.svgContainer = svgContainer
            this.geomtoy = geomtoy
            return this
        }
        throw new Error(`[G]Unable to initialize.`)
    }
    setup() {
        let [a,b,c,d,e,f] = this.geomtoy.globalTransformation.get()
        this.svgContainer.setAttribute("transform", `matrix(${a} ${b} ${c} ${d} ${e} ${f})`)
    }
    draw(object: GeomObject & Visible) {
        this.setup()

        let ds = object.getGraphics("svg"),
            pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path"),
            attrD = ""

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
        this.svgContainer.appendChild(pathEl)
        return pathEl
    }
    drawBatch(...objects: Array<GeomObject & Visible>) {
        return objects.map(o => this.draw(o))
    }

    clear() {
        this.svgContainer.innerHTML = ""
    }
}

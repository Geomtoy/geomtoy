import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"

export default class SvgDotJs {
    svgDotJsContainer: any
    geomtoy: Geomtoy

    constructor(svgDotJsContainer: any, geomtoy: Geomtoy) {
        this.svgDotJsContainer = svgDotJsContainer
        this.geomtoy = geomtoy
    }
    setup() {
        let gt = this.geomtoy.globalTransformation
        this.svgDotJsContainer.attr("transform", `matrix(${gt.a} ${gt.b} ${gt.c} ${gt.d} ${gt.e} ${gt.f})`)
    }
    draw(object: GeomObject & Visible) {
        let ds = object.getGraphic("svg"),
            path = this.svgDotJsContainer.path(),
            attrD = ""

        this.setup()

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
        path.plot(attrD)
        return path
    }
    clear() {
        this.svgDotJsContainer.clear()
        return this.svgDotJsContainer
    }
}

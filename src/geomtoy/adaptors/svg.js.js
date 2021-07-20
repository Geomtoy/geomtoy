import { GraphicImplType } from "../types"

export default class {
    constructor(svgDotJsContainer) {
        this.svgDotJsContainer = svgDotJsContainer
    }
    draw(object) {
        let ds = object.getGraphic(GraphicImplType.Svg),
            path = this.svgDotJsContainer.path(),
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
        path.plot(attrD)
    }
    clear() {
        this.svgDotJsContainer.clear()
    }
}

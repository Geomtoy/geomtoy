import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import Shape from "../base/Shape"
import Line from "../Line"
import Point from "../Point"
import Ray from "../Ray"
import { OwnerCarrier } from "../types"
import util from "../utility"

class Cross {
    static verb = "Crosses"
    static lineCrossesLine(this: OwnerCarrier, line: Line, otherLine: Line, quick = false) {
        if (!line.isParallelToLine(otherLine)) return false
        if (quick) return true
        const [a1, b1, c1] = line.getGeneralEquationParameters()
        const [a2, b2, c2] = otherLine.getGeneralEquationParameters()
        //`m` will not be equal to 0, we call `isParallelToLine` already
        const m = a1 * b2 - a2 * b1
        const x = (c2 * b1 - c1 * b2) / m
        const y = (c1 * a2 - c2 * a1) / m
        return new Point(this.owner, x, y)
    }
    static lineCrossesRay(this: OwnerCarrier, line: Line, ray: Ray) {
        
    }
}

export default Cross

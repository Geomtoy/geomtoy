import _ from "lodash"
import utility from "../utility"
import Point from "../Point"
import Circle from "../Circle"
import Vector from "../Vector"
import Line from "../Line"
import { Coordinate } from "../types"

class Inversion {
    ix!: number
    iy!: number
    invertPower!: number //反演幂

    constructor(invertPower: number, point: Point)
    constructor(invertPower: number, coordinate: Coordinate)
    constructor(invertPower: number = 10000, ix?: any, iy?: any) {
        this.invertPower = invertPower
        if (utility.apxEqualsTo(this.invertPower, 0)) throw new Error(`[G]The \`invertPower\` of \`Inversion\` can NOT be 0.`)

        if (utility.type.isCoordinate(ix)) {
            Object.assign(this, { ix: ix[0], iy: ix[1] })
            return this
        }

        if (ix instanceof Point) {
            Object.assign(this, { ix: ix.x, iy: ix.y })
            return this
        }

        Object.assign(this, { ix, iy })
    }

    //反演中心
    get centerPoint() {
        return new Point(this.ix, this.iy)
    }

    /**
     * 求`点point`的反形
     * @param {Point} point
     * @returns {Point}
     */
    invertPoint(point: Point): Point {
        //设反形点为Q，传入的点为P，反演中心为O
        let pO = this.centerPoint,
            pP = point,
            dist = pP.getDistanceFromPoint(pO),
            inversionDist = Math.abs(this.invertPower / dist),
            vOP = new Vector(pO, pP),
            angle
        //OP和OQ方向相反
        if (this.invertPower < 0) {
            angle = vOP.reverse().angle
        }
        //OP和OQ方向相同
        else {
            angle = vOP.angle
        }
        let vOQ = Vector.fromAngleAndLength(angle, inversionDist),
            vO = new Vector(pO),
            vQ = vO.add(vOQ)
        return Point.fromVector(vQ)
    }

    /**
     * 求`直线line`的反形，若直线过反演中心，则返回本身，若直线不过反演中心，则返回反形圆
     * @param {Line} line
     * @returns {Line | Circle}
     */
    invertLine(line: Line): Line | Circle {
        if (this.centerPoint.isOnLine(line)) return line.clone()
        //设反演中心为O，O对line做垂线，垂足为P，而垂线过反形圆的圆心M，并交反形圆于两个交点（其中一个是O），另一个为Q
        let pO = this.centerPoint,
            pP = <Point>line.getPerpendicularPointWithPointNotOn(pO),
            dist = pP.getDistanceFromPoint(pO),
            inversionDist = Math.abs(this.invertPower / dist),
            radius = inversionDist / 2,
            vOP = new Vector(pO, pP),
            angle

        //OP和OQ，OM方向相反
        if (this.invertPower < 0) {
            angle = vOP.reverse().angle
        }
        //OP和OQ，OM方向相同
        else {
            angle = vOP.angle
        }
        let vOM = Vector.fromAngleAndLength(angle, radius),
            vO = new Vector(pO),
            vM = vO.add(vOM)

        return new Circle(radius, Point.fromVector(vM))
    }
    /**
     * 求`圆circle`的反形，若圆过反演中心，则返回反形直线，若圆不过反演中心，则返回反形圆
     * @param {Circle} circle
     * @returns {Line | Circle}
     */

    invertCircle(circle: Circle): Line | Circle {
        if (this.centerPoint.isOnCircle(circle)) {
            //设反演中心为O，连接O和circle的圆心P成直线L，L与反形线相交于点Q，则经过点Q，且垂直于L的直线即反形线
            let pO = this.centerPoint,
                pP = circle.centerPoint,
                inversionDist = Math.abs((this.invertPower / 2) * circle.radius),
                lL = Line.fromPoints(pO, pP),
                vOP = new Vector(pO, pP),
                angle
            //OP和OQ方向相反
            if (this.invertPower < 0) {
                angle = vOP.reverse().angle
            }
            //OP和OQ方向相同
            else {
                angle = vOP.angle
            }
            let vOQ = Vector.fromAngleAndLength(angle, inversionDist),
                vO = new Vector(pO),
                vQ = vO.add(vOQ)
            return lL.getPerpendicularLineWithPointOn(Point.fromVector(vQ))
        }
        //设反演中心为O，连接O和circle（半径R）的圆心P成直线L，直线L交circle于点A，B，直线L交反形圆（半径r,圆心Q）于点C，D，
        //A和C、D其中之一互为反形，B和C、D其中之一互为反形，反之亦然，假设A和C，B和D
        //则 OA*OC = k  OB*OD = k
        //如果选择 OA = OP + R, OB = OP - R
        //则 OC = OQ - r, OD = OQ + r
        //(OP+R)(OQ-r) = k = (OP-R)(OQ+r)
        //则 2r = k/(OP-R)-k/(OP+R)
        //  2OQ = k/(OP-R)+k/(OP+R)
        //而OP= dist
        // 2r = k/(d-R)-k/(d+R) = k(1/(d-R)-1/(d+R))
        // 2OQ = k(1/(d-R)+1/(d+R))
        let pO = this.centerPoint,
            pP = circle.centerPoint,
            dist = pO.getDistanceFromPoint(pP),
            i = 1 / Math.abs(dist - circle.radius),
            j = 1 / Math.abs(dist + circle.radius),
            r = ((i - j) * Math.abs(this.invertPower)) / 2,
            s = ((i + j) * Math.abs(this.invertPower)) / 2,
            angle,
            vOP = new Vector(pO, pP)
        //OP和OQ的方向判定，
        if (this.invertPower < 0 !== this.centerPoint.isInsideCircle(circle)) {
            angle = vOP.reverse().angle
        } else {
            angle = vOP.angle
        }

        let vOQ = Vector.fromAngleAndLength(angle, s),
            vO = new Vector(pO),
            vQ = vO.add(vOQ)

        return new Circle(r, Point.fromVector(vQ))
    }
}

export default Inversion

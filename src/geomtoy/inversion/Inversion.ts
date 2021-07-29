import math from "../utility/math"
import type from "../utility/type"

import Point from "../Point"
import Circle from "../Circle"
import Vector from "../Vector"
import Line from "../Line"
import { Coordinate, RsPointToCircle, RsPointToLine } from "../types"
import { is, sealed } from "../decorator"

@sealed
class Inversion {
    #centerPoint: Point | undefined //Inversion center
    #power: number | undefined //Inversion power

    constructor(power: number, centerX: number, centerY: number)
    constructor(power: number, centerPosition: Coordinate | Point)
    constructor(a1: number, a2: any, a3?: any) {
        if (type.isNumber(a2) && type.isNumber(a3)) {
            let p = new Point(a2, a3)
            return Object.seal(Object.assign(this, { power: a1, centerPoint: p }))
        }
        if (type.isCoordinate(a2) || a2 instanceof Point) {
            let p = new Point(a2)
            return Object.seal(Object.assign(this, { power: a1, centerPoint: p }))
        }

        throw new Error(`[G]Arguments can NOT construct an inversion.`)
    }

    @is("nonZeroNumber")
    get power() {
        return this.#power!
    }
    set power(value) {
        this.#power = value
    }
    @is("point")
    get centerPoint() {
        return this.#centerPoint!
    }
    set centerPoint(value) {
        this.#centerPoint = value
    }
    @is("realNumber")
    get ix() {
        return this.#centerPoint!.x
    }
    set ix(value) {
        this.#centerPoint!.x = value
    }
    @is("realNumber")
    get iy() {
        return this.#centerPoint!.y
    }
    set iy(value) {
        this.#centerPoint!.y = value
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
            dist = pP.getDistanceBetweenPoint(pO),
            inversionDist = Math.abs(this.power / dist),
            vOP = new Vector(pO, pP),
            angle
        //OP和OQ方向相反
        if (this.power < 0) {
            angle = vOP.negative().angle
        }
        //OP和OQ方向相同
        else {
            angle = vOP.angle
        }
        let vOQ = Vector.fromAngleAndMagnitude(angle, inversionDist),
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
        if(this.centerPoint.isOnLine(line))return line.clone()

 
        //设反演中心为O，O对line做垂线，垂足为P，而垂线过反形圆的圆心M，并交反形圆于两个交点（其中一个是O），另一个为Q
        let pO = this.centerPoint,
            pP = <Point>line.getPerpendicularPointWithPointNotOn(pO),
            dist = pP.getDistanceBetweenPoint(pO),
            inversionDist = Math.abs(this.power / dist),
            radius = inversionDist / 2,
            vOP = new Vector(pO, pP),
            angle

        //OP和OQ，OM方向相反
        if (this.power < 0) {
            angle = vOP.negative().angle
        }
        //OP和OQ，OM方向相同
        else {
            angle = vOP.angle
        }
        let vOM = Vector.fromAngleAndMagnitude(angle, radius),
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
                inversionDist = Math.abs((this.power / 2) * circle.radius),
                lL = Line.fromPoints(pO, pP),
                vOP = new Vector(pO, pP),
                angle
            //OP和OQ方向相反
            if (this.power < 0) {
                angle = vOP.negative().angle
            }
            //OP和OQ方向相同
            else {
                angle = vOP.angle
            }
            let vOQ = Vector.fromAngleAndMagnitude(angle, inversionDist),
                vO = new Vector(pO),
                vQ = vO.add(vOQ)
            return lL.getPerpendicularLineWithPointOn(Point.fromVector(vQ))!
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
            dist = pO.getDistanceBetweenPoint(pP),
            i = 1 / Math.abs(dist - circle.radius),
            j = 1 / Math.abs(dist + circle.radius),
            r = ((i - j) * Math.abs(this.power)) / 2,
            s = ((i + j) * Math.abs(this.power)) / 2,
            angle,
            vOP = new Vector(pO, pP)
        //OP和OQ的方向判定，

        if (this.power < 0 !== this.centerPoint.isInsideCircle(circle)) {
            angle = vOP.negative().angle
        } else {
            angle = vOP.angle
        }

        let vOQ = Vector.fromAngleAndMagnitude(angle, s),
            vO = new Vector(pO),
            vQ = vO.add(vOQ)

        return new Circle(r, Point.fromVector(vQ))
    }
}

export default Inversion

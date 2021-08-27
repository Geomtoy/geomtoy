import util from "../utility"
import vec2 from "../utility/vec2"
import math from "../utility/math"
import { is, sealed, validAndWithSameOwner } from "../decorator"

import Point from "../Point"
import Circle from "../Circle"
import Vector from "../Vector"
import Line from "../Line"
import GeomObject from "../base/GeomObject"
import Geomtoy from ".."
import coord from "../utility/coordinate"

@sealed
@validAndWithSameOwner
class Inversion extends GeomObject {
 
    #power: number = NaN
    #centerCoordinate: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, power: number, centerX: number, centerY: number)
    constructor(owner: Geomtoy, power: number, centerCoordinate: [number, number])
    constructor(owner: Geomtoy, power: number, centerPoint: Point)
    constructor(o: Geomtoy, a1: number, a2: any, a3?: any) {
        super(o)
        if (util.isNumber(a2) && util.isNumber(a3)) {
            return Object.seal(Object.assign(this, { power: a1, centerX: a2, centerY: a3 }))
        }
        if (util.isArray(a2)) {
            return Object.seal(Object.assign(this, { power: a1, centerCoordinate: a2 }))
        }
        if (a2 instanceof Point) {
            return Object.seal(Object.assign(this, { power: a1, centerPoint: a2 }))
        }
        throw new Error("[G]Arguments can NOT construct an `Inversion`.")
    }

    @is("nonZeroNumber")
    get power() {
        return this.#power
    }
    set power(value) {
        this.#power = value
    }
    @is("realNumber")
    get centerX() {
        return coord.x(this.#centerCoordinate)
    }
    set centerX(value) {
        coord.x(this.#centerCoordinate, value)
    }
    @is("realNumber")
    get centerY() {
        return coord.y(this.#centerCoordinate)
    }
    set centerY(value) {
        coord.y(this.#centerCoordinate, value)
    }
    @is("coordinate")
    get centerCoordinate() {
        return coord.copy(this.#centerCoordinate)
    }
    set centerCoordinate(value) {
        coord.assign(this.#centerCoordinate, value)
    }
    @is("point")
    get centerPoint() {
        return new Point(this.owner, this.#centerCoordinate)
    }
    set centerPoint(value) {
        coord.assign(this.#centerCoordinate, value.coordinate)
    }

    isValid(): boolean {
        throw new Error("Method not implemented.")
    }
    /**
     * Find the inversion of point `point`
     * @param {Point} point
     * @returns {Point}
     */
    invertPoint(point: Point): Point {
        let p0 = this.centerPoint,
            p1 = point,
            dist = p1.getDistanceBetweenPoint(p0),
            inversionDist = math.abs(this.power / dist),
            v01 = vec2.from(p0.coordinate, p1.coordinate),
            a

        if (this.power > 0) {
            // v01 and v02 are in the same direction
            a = vec2.angle(v01)
        } else {
            // v01 and v02 are in the opposite direction
            a = vec2.angle(vec2.negative(v01))
        }

        let v02 = vec2.from2(a, inversionDist),
            v0 = p0.coordinate,
            v2 = vec2.add(v0, v02)
        return new Point(this.owner, v2)
    }

    /**
     * Find the inversion of line `line`.
     * @description
     * If line `line` passes through the inversion center, return itself(cloned).
     * If line `line` does not pass through the inversion center, return the inverted circle.
     * @param {Line} line
     * @returns {Line | Circle}
     */
    invertLine(line: Line): Line | Circle {
        if (this.centerPoint.isOnLine(line)) return line.clone()

        //设反演中心为O，O对line做垂线，垂足为P，而垂线过反形圆的圆心M，并交反形圆于两个交点（其中一个是O），另一个为Q
        let pO = this.centerPoint,
            pP = line.getPerpendicularPointFromPoint(pO),
            dist = pP.getDistanceBetweenPoint(pO),
            inversionDist = Math.abs(this.power / dist),
            radius = inversionDist / 2,
            vOP = new Vector(this.owner,pO, pP),
            angle

        //OP和OQ，OM方向相反
        if (this.power < 0) {
            angle = vOP.negative().angle
        }
        //OP和OQ，OM方向相同
        else {
            angle = vOP.angle
        }
        let vOM = Vector.fromAngleAndMagnitude(this.owner, angle, radius),
            vO = new Vector(this.owner, pO),
            vM = vO.add(vOM)

        return new Circle(this.owner, radius, Point.fromVector(this.owner, vM))
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
                lL = Line.fromTwoPoints(this.owner, pO, pP),
                vOP = new Vector(this.owner, pO, pP),
                angle
            //OP和OQ方向相反
            if (this.power < 0) {
                angle = vOP.negative().angle
            }
            //OP和OQ方向相同
            else {
                angle = vOP.angle
            }
            let vOQ = Vector.fromAngleAndMagnitude(this.owner, angle, inversionDist),
                vO = new Vector(this.owner, pO),
                vQ = vO.add(vOQ)
            return lL.getPerpendicularLineFromPoint(Point.fromVector(this.owner, vQ))!
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
            vOP = new Vector(this.owner, pO, pP)
        //OP和OQ的方向判定，

        if (this.power < 0 !== this.centerPoint.isInsideCircle(circle)) {
            angle = vOP.negative().angle
        } else {
            angle = vOP.angle
        }

        let vOQ = Vector.fromAngleAndMagnitude(this.owner, angle, s),
            vO = new Vector(this.owner, pO),
            vQ = vO.add(vOQ)

        return new Circle(this.owner, r, Point.fromVector(this.owner, vQ))
    }

    clone() {
        return new Inversion(this.owner, this.power, this.centerX, this.centerY)
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tpower: ${this.power}`, 
            `\tcenterX: ${this.centerX}`, 
            `\tcenterY: ${this.centerY}`, 
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toObject(): object {
        return { power: this.power, centerX: this.centerX, centerY: this.centerY }
    }
    toArray(): any[] {
        throw [this.power, this.centerX, this.centerY]
    }
}

export default Inversion

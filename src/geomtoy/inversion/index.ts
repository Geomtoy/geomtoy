import util from "../utility"
import vec2 from "../utility/vec2"
import math from "../utility/math"
import coord from "../utility/coordinate"
import { validAndWithSameOwner } from "../decorator"
import assert from "../utility/assertion"
import BaseObject from "../base/BaseObject"
import Point from "../Point"
import Circle from "../Circle"
import Vector from "../Vector"
import Line from "../Line"
import Geomtoy from ".."

const defaultInversionPower = 10000
class Inversion extends BaseObject {
    private _power: number = defaultInversionPower
    private _centerCoordinate: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, centerX: number, centerY: number, power?: number)
    constructor(owner: Geomtoy, centerCoordinate: [number, number], power?: number)
    constructor(owner: Geomtoy, centerPoint: Point, power?: number)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { centerX: a1, centerY: a2, power: a3 ?? defaultInversionPower })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { centerCoordinate: a1, power: a2 ?? defaultInversionPower })
        }
        if (a1 instanceof Point) {
            Object.assign(this, { centerPoint: a1, power: a2 ?? defaultInversionPower })
        }
        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        centerXChanged: "centerXChanged",
        centerYChanged: "centerYChanged",
        powerChanged: "powerChanged"
    })

    private _setCenterX(value: number) {
        this.willTrigger_(coord.x(this._centerCoordinate), value, [Inversion.events.centerXChanged])
        coord.x(this._centerCoordinate, value)
    }
    private _setCenterY(value: number) {
        this.willTrigger_(coord.y(this._centerCoordinate), value, [Inversion.events.centerYChanged])
        coord.y(this._centerCoordinate, value)
    }
    private _setPower(value: number) {
        this.willTrigger_(this._power, value, [Inversion.events.powerChanged])
        this._power = value
    }

    get centerX() {
        return coord.x(this._centerCoordinate)
    }
    set centerX(value) {
        assert.isRealNumber(value, "centerX")
        this._setCenterX(value)
    }
    get centerY() {
        return coord.y(this._centerCoordinate)
    }
    set centerY(value) {
        assert.isRealNumber(value, "centerY")
        this._setCenterY(value)
    }
    get centerCoordinate() {
        return coord.clone(this._centerCoordinate)
    }
    set centerCoordinate(value) {
        assert.isCoordinate(value, "centerCoordinate")
        this._setCenterX(coord.x(value))
        this._setCenterY(coord.y(value))
    }
    get centerPoint() {
        return new Point(this.owner, this._centerCoordinate)
    }
    set centerPoint(value) {
        assert.isPoint(value, "centerPoint")
        this._setCenterX(value.x)
        this._setCenterY(value.y)
    }
    get power() {
        return this._power
    }
    set power(value) {
        assert.isNonZeroNumber(value, "power")
        this._setPower(value)
    }

    isValid() {
        const [cc, power] = [this._centerCoordinate, this._power]
        if (!coord.isValid(cc)) return false
        if (!util.isNonZeroNumber(power)) return false
        return true
    }

    /**
     *  Find the inversion of `point`
     * @param point
     * @returns
     */
    invertPoint(point: [number, number] | Point): Point {
        assert.isCoordinateOrPoint(point, "point")
        const c0 = this.centerCoordinate
        const c1 = point instanceof Point ? point.coordinate : point
        const power = this.power
        const v01 = vec2.from(c0, c1)
        const d = vec2.magnitude(v01)
        const id = math.abs(power / d)

        // When power > 0, v01 and v02 are in the same direction.
        // When power < 0, v01 and v02 are in the opposite direction
        const a = power > 0 ? vec2.angle(v01) : vec2.angle(vec2.negative(v01))

        const v02 = vec2.from2(a, id)
        const c2 = vec2.add(c0, v02)
        return new Point(this.owner, c2)
    }

    /**
     * Find the inversion of `line`.
     * @description
     * If `line` passes through the inversion center, return itself(cloned).
     * If `line` does not pass through the inversion center, return the inverted circle.
     * @param line
     * @returns
     */
    invertLine(line: Line): Line | Circle {
        if (this.centerPoint.isOnLine(line)) return line.clone()

        //设反演中心为O，O对line做垂线，垂足为P，而垂线过反形圆的圆心M，并交反形圆于两个交点（其中一个是O），另一个为Q
        let pO = this.centerPoint,
            pP = line.getPerpendicularPointFromPoint(pO),
            dist = pP.getDistanceBetweenPoint(pO),
            inversionDist = math.abs(this.power / dist),
            radius = inversionDist / 2,
            vOP = new Vector(this.owner, pO, pP),
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
                lL = Line.fromTwoPoints.bind(this)(this.owner, pO, pP),
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
        return new Inversion(this.owner, this.centerCoordinate, this.power)
    }
    copyFrom(inversion: Inversion | null) {
        if (inversion === null) {
            coord.assign(this._centerCoordinate, [NaN, NaN])
            this._power = defaultInversionPower
        } else {
            coord.assign(this._centerCoordinate, inversion._centerCoordinate)
            this._power = inversion._power
        }
        this.trigger(this.eventNames.join(" "))
        return this
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tcenterCoordinate: ${this.centerCoordinate.join(", ")}`,
            `\tpower: ${this.power}`, 
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray(): any[] {
        throw [this.centerCoordinate, this.power]
    }
    toObject(): object {
        return { centerCoordinate: this.centerCoordinate, power: this.power }
    }
}
validAndWithSameOwner(Inversion)

export default Inversion

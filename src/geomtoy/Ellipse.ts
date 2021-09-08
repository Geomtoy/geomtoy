import Graphics from "./graphics"
import Point from "./Point"
import Vector from "./Vector"
import util from "./utility"
import { Direction } from "./types"
import { assertIsCoordinate, assertIsPoint, assertIsPositiveNumber, assertIsRealNumber, sealed, validAndWithSameOwner } from "./decorator"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import Geomtoy from "."
import { AreaMeasurable } from "./interfaces"
import coord from "./utility/coordinate"

@sealed
@validAndWithSameOwner
class Ellipse extends GeomObject implements AreaMeasurable {
    #centerCoordinate: [number, number] = [NaN, NaN]
    #radiusX: number = NaN
    #radiusY: number = NaN
    #rotation: number = NaN
    #windingDirection: Direction = "positive"

    constructor(owner: Geomtoy, centerX: number, centerY: number, radiusX: number, radiusY: number, rotation?: number)
    constructor(owner: Geomtoy, centerCoordinate: [number, number], radiusX: number, radiusY: number, rotation?: number)
    constructor(owner: Geomtoy, centerPoint: Point, radiusX: number, radiusY: number, rotation?: number)
    constructor(o: Geomtoy, a1: any, a2: any, a3: any, a4?: any, a5?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { centerX: a1, centerY: a2, radiusX: a3, radiusY: a4, rotation: a5 ?? 0 })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { centerCoordinate: a1, radiusX: a2, radiusY: a3, rotation: a4 ?? 0 })
        }
        if (a1 instanceof Point) {
            Object.assign(this, { centerPoint: a1, radiusX: a2, radiusY: a3, rotation: a4 ?? 0 })
        }
        return Object.seal(this)
    }

    get centerX() {
        return coord.x(this.#centerCoordinate)
    }
    set centerX(value) {
        assertIsRealNumber(value, "centerX")
        coord.x(this.#centerCoordinate, value)
    }
    get centerY() {
        return coord.y(this.#centerCoordinate)
    }
    set centerY(value) {
        assertIsRealNumber(value, "centerY")
        coord.y(this.#centerCoordinate, value)
    }
    get centerCoordinate() {
        return coord.copy(this.#centerCoordinate)
    }
    set centerCoordinate(value) {
        assertIsCoordinate(value, "centerCoordinate")
        coord.assign(this.#centerCoordinate, value)
    }
    get centerPoint() {
        return new Point(this.owner, this.#centerCoordinate)
    }
    set centerPoint(value) {
        assertIsPoint(value, "centerPoint")
        coord.assign(this.#centerCoordinate, value.coordinate)
    }
    get radiusX() {
        return this.#radiusX
    }
    set radiusX(value) {
        assertIsPositiveNumber(value, "radiusX")
        this.#radiusX = value
    }
    get radiusY() {
        return this.#radiusY
    }
    set radiusY(value) {
        assertIsPositiveNumber(value, "radiusY")
        this.#radiusY = value
    }
    get rotation() {
        return this.#rotation
    }
    set rotation(value) {
        assertIsRealNumber(value, "rotation")
        this.#rotation = value
    }

    isValid() {
        let valid = true
        valid &&= coord.isValid(this.centerCoordinate)
        valid &&= util.isRealNumber(this.radiusX) && this.radiusX > 0
        valid &&= util.isRealNumber(this.radiusY) && this.radiusY > 0
        return valid
    }
    getWindingDirection() {
        return this.#windingDirection
    }
    setWindingDirection(direction: Direction) {
        this.#windingDirection = direction
    }

    getEccentricity() {}

    clone(): GeomObject {
        throw new Error("Method not implemented.")
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
    toObject(): object {
        throw new Error("Method not implemented.")
    }
    toArray(): any[] {
        throw new Error("Method not implemented.")
    }

    getGraphics() {
        const { centerX, centerY, radiusX, radiusY, rotation } = this
        const g = new Graphics()
        g.centerArcTo(centerX, centerY, radiusX, radiusY, rotation, 0, 2 * Math.PI)
        return g.commands
    }

    //https://www.coder.work/article/1220553
    static findTangentLineOfTwoEllipse(ellipse1: Ellipse, ellipse2: Ellipse) {}

    //https://zhuanlan.zhihu.com/p/64550850
    static findTangentLineOfEllipseAndParabola() {}

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    getPerimeter(): number {
        throw new Error("Method not implemented.")
    }
    getArea(): number {
        throw new Error("Method not implemented.")
    }

    getGraphicsAlt() {
        /**
         * @see https://www.tinaja.com/glib/ellipse4.pdf
         */
        const kappa = 0.551784 //or 0.5522848
        const { centerX: cx, centerY: cy, radiusX: rx, radiusY: ry, rotation } = this
        const ox = rx * kappa // x axis control point offset
        const oy = ry * kappa // y axis control point offset

        let g = new Graphics()
        g.moveTo(cx - rx, cy)
            .bezierCurveTo(cx - rx, cy - oy, cx - ox, cy - ry, cx, cy - ry)
            .bezierCurveTo(cx + ox, cy - ry, cx + rx, cy - oy, cx + rx, cy)
            .bezierCurveTo(cx + rx, cy + oy, cx + ox, cy + ry, cx, cy + ry)
            .bezierCurveTo(cx - ox, cy + ry, cx - rx, cy + oy, cx - rx, cy)

        return g.commands
    }
}

/**
 *
 * @category GeomObject
 */
export default Ellipse

import Point from "./Point"
import { assertIsBoolean, assertIsPositiveNumber, assertIsRealNumber, sealed, validAndWithSameOwner } from "./decorator"
import util from "./utility"
import math from "./utility/math"
import angle from "./utility/angle"
import coord from "./utility/coordinate"

import { arcEndpointToCenterParameterization } from "./graphics/helper"
import Geomtoy from "."
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import Graphics from "./graphics"
import { Visible } from "./interfaces"

@sealed
@validAndWithSameOwner
class Arc extends GeomObject implements Visible {
    #centerCoordinate: [number, number] = [NaN, NaN]
    #radiusX: number = NaN
    #radiusY: number = NaN
    #startAngle: number = NaN
    #endAngle: number = NaN
    #positive: boolean = false
    #rotation: number = 0

    constructor(owner: Geomtoy, centerX: number, centerY: number, radiusX: number, radiusY: number, startAngle: number, endAngle: number, positive: boolean, rotation?: number)
    constructor(owner: Geomtoy, centerCoordinate: [number, number], radiusX: number, radiusY: number, startAngle: number, endAngle: number, positive: boolean, rotation?: number)
    constructor(owner: Geomtoy, centerPoint: Point, radiusX: number, radiusY: number, startAngle: number, endAngle: number, positive: boolean, rotation?: number)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any, a8?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { centerX: a1, centerY: a2, radiusX: a3, radiusY: a4, startAngle: a5, endAngle: a6, positive: a7, rotation: a8 ?? 0 })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { centerCoordinate: a1, radiusX: a2, radiusY: a3, startAngle: a4, endAngle: a5, positive: a6, rotation: a7 ?? 0 })
        }
        if (a1 instanceof Point) {
            Object.assign(this, { centerPoint: a1, radiusX: a2, radiusY: a3, startAngle: a4, endAngle: a5, positive: a6, rotation: a7 ?? 0 })
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
        assertIsRealNumber(value, "centerCoordinate")
        coord.assign(this.#centerCoordinate, value)
    }
    get centerPoint() {
        return new Point(this.owner, this.#centerCoordinate)
    }
    set centerPoint(value) {
        assertIsRealNumber(value, "centerPoint")
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
    get startAngle() {
        return this.#startAngle
    }
    set startAngle(value) {
        assertIsRealNumber(value, "startAngle")
        this.#startAngle = angle.simplify(value)
    }
    get endAngle() {
        return this.#endAngle
    }
    set endAngle(value) {
        assertIsRealNumber(value, "endAngle")
        this.#endAngle = angle.simplify(value)
    }
    get positive() {
        return this.#positive
    }
    set positive(value) {
        assertIsBoolean(value, "positive")
        this.#positive = value
    }
    get rotation() {
        return this.#rotation
    }
    set rotation(value) {
        assertIsRealNumber(value, "rotation")
        this.#rotation = value
    }

    static formingCondition = "[G]The `startAngle` and `endAngle` of an `Arc` should not be coincide, to keep an `Arc` not full `Ellipse` nor empty `Ellipse`."

    isValid() {
        let epsilon = this.owner.getOptions().epsilon,
            valid = true
        valid &&= coord.isValid(this.centerCoordinate)
        valid &&= !math.equalTo(this.startAngle, this.endAngle, epsilon)
        return valid
    }

    static fromTwoPointsEtc(owner: Geomtoy, point1: Point, point2: Point, radiusX: number, radiusY: number, largeArc: boolean, positive: boolean, rotation: number) {
        let [x1, y1] = point1.coordinate,
            [x2, y2] = point2.coordinate,
            {
                centerX: cx,
                centerY: cy,
                radiusX: rx,
                radiusY: ry,
                startAngle,
                endAngle
            } = arcEndpointToCenterParameterization({
                point1X: x1,
                point1Y: y1,
                point2X: x2,
                point2Y: y2,
                radiusX,
                radiusY,
                largeArcFlag: largeArc,
                sweepFlag: positive,
                xAxisRotation: rotation
            })
        return new Arc(owner, cx, cy, rx, ry, startAngle, endAngle, positive, rotation)
    }
    getLength() {}
    getGraphics() {
        let c = this.centerCoordinate,
            g = new Graphics()
        g.centerArcTo(...c, this.radiusX, this.radiusY, this.rotation, this.startAngle, this.endAngle, this.positive)
        return g.commands
    }
    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
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
}

export default Arc

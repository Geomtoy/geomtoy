import Point from "./Point"
import { is, sealed, validAndWithSameOwner } from "./decorator"
import { CanvasDirective, GraphicDirectiveType, GraphicImplType, SvgDirective } from "./types"
import util from "./utility"
import math from "./utility/math"
import angle from "./utility/angle"
import { arcCenterToEndpointParameterization, arcEndpointToCenterParameterization } from "./graphic/helper"
import Geomtoy from "."
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import Graphic from "./graphic"
import coord from "./helper/coordinate"
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

    constructor(owner: Geomtoy, centerX: number, centerY: number, radiusX: number, radiusY: number, startAngle: number, endAngle: number, positive: boolean, rotation: number)
    constructor(owner: Geomtoy, centerCoordinate: [number, number], radiusX: number, radiusY: number, startAngle: number, endAngle: number, positive: boolean, rotation: number)
    constructor(owner: Geomtoy, centerPoint: Point, radiusX: number, radiusY: number, startAngle: number, endAngle: number, positive: boolean, rotation: number)
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
    @is("positiveNumber")
    get radiusX() {
        return this.#radiusX
    }
    set radiusX(value) {
        this.#radiusX = value
    }
    @is("positiveNumber")
    get radiusY() {
        return this.#radiusY
    }
    set radiusY(value) {
        this.#radiusY = value
    }
    @is("realNumber")
    get startAngle() {
        return this.#startAngle
    }
    set startAngle(value) {
        this.#startAngle = angle.simplify(value)
    }
    @is("realNumber")
    get endAngle() {
        return this.#endAngle
    }
    set endAngle(value) {
        this.#endAngle = angle.simplify(value)
    }
    @is("boolean")
    get positive() {
        return this.#positive
    }
    set positive(value) {
        this.#positive = value
    }
    @is("realNumber")
    get rotation() {
        return this.#rotation
    }
    set rotation(value) {
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

    static fromTwoPointsEtc(owner: Geomtoy, point1: Point, point2: Point, radiusX: number, radiusY: number, largeArcFlag: boolean, sweepFlag: boolean, rotation: number) {
        let [x1, y1] = point1.coordinate,
            [x2, y2] = point2.coordinate,
            {
                cx,
                cy,
                rx,
                ry,
                startAngle,
                endAngle,
                anticlockwise: positive
            } = arcEndpointToCenterParameterization({ x1, y1, x2, y2, rx: radiusX, ry: radiusY, largeArcFlag, sweepFlag, xAxisRotation: rotation })
        return new Arc(owner, cx, cy, rx, ry, startAngle, endAngle, positive, rotation)
    }
    getLength() {}
    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[] {
        let c = this.centerCoordinate,
            g = new Graphic()
        g.moveTo(...c)
        g.centerArcTo(...c, this.radiusX, this.radiusY, this.startAngle, this.endAngle, this.rotation, this.positive)
        return g.valueOf(type)
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

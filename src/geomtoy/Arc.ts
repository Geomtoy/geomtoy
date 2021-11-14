import Point from "./Point"
import { validAndWithSameOwner } from "./decorator"
import assert from "./utility/assertion"
import util from "./utility"
import math from "./utility/math"
import angle from "./utility/angle"
import coord from "./utility/coordinate"

import { arcEndpointToCenterParameterization } from "./graphics/helper"
import Geomtoy from "."
import Transformation from "./transformation"
import Graphics from "./graphics"
import { optionerOf } from "./helper/Optioner"
import { OwnerCarrier } from "./types"
import Shape from "./base/Shape"
import { FiniteOpenShape } from "./interfaces"

class Arc extends Shape implements FiniteOpenShape {
    private _centerCoordinate: [number, number] = [NaN, NaN]
    private _radiusX: number = NaN
    private _radiusY: number = NaN
    private _startAngle: number = NaN
    private _endAngle: number = NaN
    private _positive: boolean = false
    private _rotation: number = 0

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

    static readonly events = Object.freeze({
        centerXChanged: "centerXChanged",
        centerYChanged: "centerYChanged",
        radiusXChanged: "radiusXChanged",
        radiusYChanged: "radiusYChanged",
        startAngleChanged: "startAngleChanged",
        endAngleChanged: "endAngleChanged",
        positiveChanged: "positiveChanged",
        rotationChanged: "rotationChanged"
    })

    private _setCenterX(value: number) {
        this.willTrigger_(coord.x(this._centerCoordinate), value, [Arc.events.centerXChanged])
        coord.x(this._centerCoordinate, value)
    }
    private _setCenterY(value: number) {
        this.willTrigger_(coord.y(this._centerCoordinate), value, [Arc.events.centerYChanged])
        coord.y(this._centerCoordinate, value)
    }
    private _setRadiusX(value: number) {
        this.willTrigger_(this._radiusX, value, [Arc.events.radiusXChanged])
        this._radiusX = value
    }
    private _setRadiusY(value: number) {
        this.willTrigger_(this._radiusY, value, [Arc.events.radiusYChanged])
        this._radiusY = value
    }
    private _setStartAngle(value: number) {
        this.willTrigger_(this._startAngle, value, [Arc.events.startAngleChanged])
        this._startAngle = value
    }
    private _setEndAngle(value: number) {
        this.willTrigger_(this._endAngle, value, [Arc.events.endAngleChanged])
        this._endAngle = value
    }
    private _setPositive(value: boolean) {
        this.willTrigger_(this._positive, value, [Arc.events.positiveChanged])
        this._positive = value
    }
    private _setRotation(value: number) {
        this.willTrigger_(this._rotation, value, [Arc.events.rotationChanged])
        this._rotation = value
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
        assert.isRealNumber(value, "centerCoordinate")
        this._setCenterX(coord.x(value))
        this._setCenterY(coord.y(value))
    }
    get centerPoint() {
        return new Point(this.owner, this._centerCoordinate)
    }
    set centerPoint(value) {
        assert.isRealNumber(value, "centerPoint")
        this._setCenterX(value.x)
        this._setCenterY(value.y)
    }
    get radiusX() {
        return this._radiusX
    }
    set radiusX(value) {
        assert.isPositiveNumber(value, "radiusX")
        this._setRadiusX(value)
    }
    get radiusY() {
        return this._radiusY
    }
    set radiusY(value) {
        assert.isPositiveNumber(value, "radiusY")
        this._setRadiusY(value)
    }
    get startAngle() {
        return this._startAngle
    }
    set startAngle(value) {
        assert.isRealNumber(value, "startAngle")
        this._setStartAngle(value)
    }
    get endAngle() {
        return this._endAngle
    }
    set endAngle(value) {
        assert.isRealNumber(value, "endAngle")
        this._setEndAngle(value)
    }
    get positive() {
        return this._positive
    }
    set positive(value) {
        assert.isBoolean(value, "positive")
        this._setPositive(value)
    }
    get rotation() {
        return this._rotation
    }
    set rotation(value) {
        assert.isRealNumber(value, "rotation")
        this._setRotation(value)
    }

    static formingCondition = "[G]The `startAngle` and `endAngle` of an `Arc` should not be coincide, to keep an `Arc` not full `Ellipse` nor empty `Ellipse`."

    isValid() {
        const [cc, sa, ea] = [this._centerCoordinate, this._startAngle, this._endAngle]
        const epsilon = this.options_.epsilon
        if (!coord.isValid(cc)) return false
        if (!util.isRealNumber(sa)) return false
        if (!util.isRealNumber(ea)) return false
        if (math.equalTo(sa, ea, epsilon)) return false
        return true
    }
    /**
     * Move point `this` by `offsetX` and `offsetY` to get new point.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move point `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.centerCoordinate = coord.move(this.centerCoordinate, deltaX, deltaY)
        return this
    }

    /**
     * Move point `this` with `distance` along `angle` to get new point.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move point `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.centerCoordinate = coord.moveAlongAngle(this.centerCoordinate, angle, distance)
        return this
    }

    isPointOn(point: [number, number] | Point): boolean {
        throw new Error("Method not implemented.")
    }

    static fromTwoPointsEtc(
        this: OwnerCarrier,
        point1: [number, number] | Point,
        point2: [number, number] | Point,
        radiusX: number,
        radiusY: number,
        largeArc: boolean,
        positive: boolean,
        rotation: number
    ) {
        assert.isCoordinateOrPoint(point1, "point1")
        assert.isCoordinateOrPoint(point2, "point2")
        assert.isPositiveNumber(radiusX, "radiusX")
        assert.isPositiveNumber(radiusY, "radiusY")
        assert.isBoolean(largeArc, "largeArc")
        assert.isBoolean(positive, "positive")
        assert.isRealNumber(rotation, "rotation")
        const [x1, y1] = point1 instanceof Point ? point1.coordinate : point1
        const [x2, y2] = point2 instanceof Point ? point2.coordinate : point2
        const {
            centerX,
            centerY,
            radiusX: correctedRx,
            radiusY: correctedRy,
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
        return new Arc(this.owner, centerX, centerY, correctedRx, correctedRy, startAngle, endAngle, positive, rotation)
    }
    getLength() {
        return 0
    }
    getGraphics() {
        const c = this.centerCoordinate
        const g = new Graphics()
        g.centerArcTo(...c, this.radiusX, this.radiusY, this.rotation, this.startAngle, this.endAngle, this.positive)
        return g.commands
    }
    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.")
    }
    clone() {
        return new Arc(this.owner, this.centerCoordinate, this.radiusX, this.radiusY, this.startAngle, this.endAngle, this.positive, this.rotation)
    }
    copyFrom(arc: Arc | null) {
        if (arc === null) arc = new Arc(this.owner)
        this._setCenterX(coord.x(arc._centerCoordinate))
        this._setCenterY(coord.y(arc._centerCoordinate))
        this._setRadiusX(arc._radiusX)
        this._setRadiusY(arc._radiusY)
        this._setStartAngle(arc._startAngle)
        this._setEndAngle(arc._endAngle)
        this._setPositive(arc._positive)
        this._setRotation(arc._rotation)
        return this
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
    toArray() {
        return [this.centerCoordinate, this.radiusX, this.radiusY, this.startAngle, this.endAngle, this.positive, this.rotation]
    }
    toObject() {
        return {
            centerCoordinate: this.centerCoordinate,
            radiusX: this.radiusX,
            radiusY: this.radiusY,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            positive: this.positive,
            rotation: this.rotation
        }
    }
}

validAndWithSameOwner(Arc)
/**
 * @category Shape
 */
export default Arc

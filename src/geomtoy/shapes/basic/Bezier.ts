import { validAndWithSameOwner } from "../../decorator"
import assert from "../../utility/assertion"
import util from "../../utility"
import coord from "../../utility/coordinate"

import Shape from "../../base/Shape"
import Point from "./Point"
import Graphics from "../../graphics"

import type Geomtoy from "../.."
import type Transformation from "../../transformation"
import type { FiniteOpenShape, TransformableShape } from "../../types"

class Bezier extends Shape implements FiniteOpenShape, TransformableShape {
    private _point1Coordinate: [number, number] = [NaN, NaN]
    private _point2Coordinate: [number, number] = [NaN, NaN]
    private _controlPoint1Coordinate: [number, number] = [NaN, NaN]
    private _controlPoint2Coordinate: [number, number] = [NaN, NaN]

    constructor(
        owner: Geomtoy,
        point1X: number,
        point1Y: number,
        point2X: number,
        point2Y: number,
        controlPoint1X: number,
        controlPoint1Y: number,
        controlPoint2X: number,
        controlPoint2Y: number
    )
    constructor(
        owner: Geomtoy,
        point1Coordinate: [number, number],
        point2Coordinate: [number, number],
        controlPoint1Coordinate: [number, number],
        controlPoint2Coordinate: [number, number]
    )
    constructor(owner: Geomtoy, point1: Point, point2: Point, controlPoint1: Point, controlPoint2: Point)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any, a8?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4, controlPoint1X: a5, controlPoint1Y: a6, controlPoint2X: a7, controlPoint2Y: a8 })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { point1Coordinate: a1, point2Coordinate: a2, controlPoint1Coordinate: a3, controlPoint2Coordinate: a4 })
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point1: a1, point2: a2, controlPoint1: a3, controlPoint2: a4 })
        }

        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        point1XChanged: "point1XChanged",
        point1YChanged: "point1YChanged",
        point2XChanged: "point2XChanged",
        point2YChanged: "point2YChanged",
        controlPoint1XChanged: "controlPoint1XChanged",
        controlPoint1YChanged: "controlPoint1YChanged",
        controlPoint2XChanged: "controlPoint2XChanged",
        controlPoint2YChanged: "controlPoint2YChanged"
    })

    private _setPoint1X(value: number) {
        this.willTrigger_(coord.x(this._point1Coordinate), value, [Bezier.events.point1XChanged])
        coord.x(this._point1Coordinate, value)
    }
    private _setPoint1Y(value: number) {
        this.willTrigger_(coord.y(this._point1Coordinate), value, [Bezier.events.point1YChanged])
        coord.y(this._point1Coordinate, value)
    }
    private _setPoint2X(value: number) {
        this.willTrigger_(coord.x(this._point2Coordinate), value, [Bezier.events.point2XChanged])
        coord.x(this._point2Coordinate, value)
    }
    private _setPoint2Y(value: number) {
        this.willTrigger_(coord.y(this._point2Coordinate), value, [Bezier.events.point2YChanged])
        coord.y(this._point2Coordinate, value)
    }
    private _setControlPoint1X(value: number) {
        this.willTrigger_(coord.x(this._controlPoint1Coordinate), value, [Bezier.events.controlPoint1XChanged])
        coord.x(this._controlPoint1Coordinate, value)
    }
    private _setControlPoint1Y(value: number) {
        this.willTrigger_(coord.y(this._controlPoint1Coordinate), value, [Bezier.events.controlPoint1YChanged])
        coord.y(this._controlPoint1Coordinate, value)
    }
    private _setControlPoint2X(value: number) {
        this.willTrigger_(coord.x(this._controlPoint2Coordinate), value, [Bezier.events.controlPoint2XChanged])
        coord.x(this._controlPoint2Coordinate, value)
    }
    private _setControlPoint2Y(value: number) {
        this.willTrigger_(coord.y(this._controlPoint2Coordinate), value, [Bezier.events.controlPoint2YChanged])
        coord.y(this._controlPoint2Coordinate, value)
    }

    get point1X() {
        return coord.x(this._point1Coordinate)
    }
    set point1X(value) {
        assert.isRealNumber(value, "point1X")
        this._setPoint1X(value)
    }
    get point1Y() {
        return coord.y(this._point1Coordinate)
    }
    set point1Y(value) {
        assert.isRealNumber(value, "point1Y")
        this._setPoint1Y(value)
    }
    get point1Coordinate() {
        return coord.clone(this._point1Coordinate)
    }
    set point1Coordinate(value) {
        assert.isCoordinate(value, "point1Coordinate")
        this._setPoint1X(coord.x(value))
        this._setPoint1Y(coord.y(value))
    }
    get point1() {
        return new Point(this.owner, this._point1Coordinate)
    }
    set point1(value) {
        assert.isPoint(value, "point1")
        this._setPoint1X(value.x)
        this._setPoint1Y(value.y)
    }
    get point2X() {
        return coord.x(this._point2Coordinate)
    }
    set point2X(value) {
        assert.isRealNumber(value, "point2X")
        this._setPoint2X(value)
    }
    get point2Y() {
        return coord.y(this._point2Coordinate)
    }
    set point2Y(value) {
        assert.isRealNumber(value, "point2Y")
        this._setPoint2Y(value)
    }
    get point2Coordinate() {
        return coord.clone(this._point2Coordinate)
    }
    set point2Coordinate(value) {
        assert.isCoordinate(value, "point2Coordinate")
        this._setPoint2X(coord.x(value))
        this._setPoint2Y(coord.y(value))
    }
    get point2() {
        return new Point(this.owner, this._point2Coordinate)
    }
    set point2(value) {
        assert.isPoint(value, "point2")
        this._setPoint2X(value.x)
        this._setPoint2Y(value.y)
    }
    get controlPoint1X() {
        return coord.x(this._controlPoint1Coordinate)
    }
    set controlPoint1X(value) {
        assert.isRealNumber(value, "controlPoint1X")
        this._setControlPoint1X(value)
    }
    get controlPoint1Y() {
        return coord.y(this._controlPoint1Coordinate)
    }
    set controlPoint1Y(value) {
        assert.isRealNumber(value, "controlPoint1Y")
        this._setControlPoint1Y(value)
    }
    get controlPoint1Coordinate() {
        return coord.clone(this._controlPoint1Coordinate)
    }
    set controlPoint1Coordinate(value) {
        assert.isCoordinate(value, "controlPoint1Coordinate")
        this._setControlPoint1X(coord.x(value))
        this._setControlPoint1Y(coord.y(value))
    }
    get controlPoint1() {
        return new Point(this.owner, this._controlPoint1Coordinate)
    }
    set controlPoint1(value) {
        assert.isPoint(value, "controlPoint1")
        this._setControlPoint1X(value.x)
        this._setControlPoint1Y(value.y)
    }
    get controlPoint2X() {
        return coord.x(this._controlPoint2Coordinate)
    }
    set controlPoint2X(value) {
        assert.isRealNumber(value, "controlPoint2X")
        this._setControlPoint2X(value)
    }
    get controlPoint2Y() {
        return coord.y(this._controlPoint2Coordinate)
    }
    set controlPoint2Y(value) {
        assert.isRealNumber(value, "controlPoint2Y")
        this._setControlPoint2Y(value)
    }
    get controlPoint2Coordinate() {
        return coord.clone(this._controlPoint2Coordinate)
    }
    set controlPoint2Coordinate(value) {
        assert.isCoordinate(value, "controlPoint2Coordinate")
        this._setControlPoint2X(coord.x(value))
        this._setControlPoint2Y(coord.y(value))
    }
    get controlPoint2() {
        return new Point(this.owner, this._controlPoint2Coordinate)
    }
    set controlPoint2(value) {
        assert.isPoint(value, "controlPoint2")
        this._setControlPoint2X(value.x)
        this._setControlPoint2Y(value.y)
    }

    isValid() {
        const [c1, c2] = [this._point1Coordinate, this._point2Coordinate]
        const epsilon = this.options_.epsilon
        if (!coord.isValid(c1)) return false
        if (!coord.isValid(c2)) return false
        if (coord.isSameAs(c1, c2, epsilon)) return false
        return true
    }
    /**
     * Whether the three vertices of triangle `this` is the same as triangle `triangle` ignoring the order of the vertices.
     * @param triangle
     */
    isSameAs(bezier: Bezier) {
        const epsilon = this.options_.epsilon
        return true
    }
    /**
     * Whether the three vertices of triangle `this` is the same as triangle `triangle` considering the order of vertices.
     * @param triangle
     */
    isSameAs2(bezier: Bezier) {
        const epsilon = this.options_.epsilon
        return (
            coord.isSameAs(this.point1Coordinate, bezier.point1Coordinate, epsilon) &&
            coord.isSameAs(this.point2Coordinate, bezier.point2Coordinate, epsilon) &&
            coord.isSameAs(this.controlPoint1Coordinate, bezier.controlPoint1Coordinate, epsilon) &&
            coord.isSameAs(this.controlPoint2Coordinate, bezier.controlPoint2Coordinate, epsilon)
        )
    }
    /**
     * Move triangle `this` by `offsetX` and `offsetY` to get new triangle.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move triangle `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.point1Coordinate = coord.move(this.point1Coordinate, deltaX, deltaY)
        this.point2Coordinate = coord.move(this.point2Coordinate, deltaX, deltaY)
        this.controlPoint1Coordinate = coord.move(this.controlPoint1Coordinate, deltaX, deltaY)
        this.controlPoint2Coordinate = coord.move(this.controlPoint2Coordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move triangle `this` with `distance` along `angle` to get new triangle.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move triangle `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.point1Coordinate = coord.moveAlongAngle(this.point1Coordinate, angle, distance)
        this.point2Coordinate = coord.moveAlongAngle(this.point2Coordinate, angle, distance)
        this.controlPoint1Coordinate = coord.moveAlongAngle(this.controlPoint1Coordinate, angle, distance)
        this.controlPoint2Coordinate = coord.moveAlongAngle(this.controlPoint2Coordinate, angle, distance)
        return this
    }

    /**
     * Get perimeter of triangle `this`.
     */
    getLength() {
        return 0
        // return this.side1Length + this.side2Length + this.side3Length
    }

    isPointOn(point: Point): boolean {
        return true
    }
    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.")
    }
    getGraphics() {
        const g = new Graphics()
        if (!this.isValid()) return g

        const { point1Coordinate: c1, point2Coordinate: c2, controlPoint1Coordinate: cpc1, controlPoint2Coordinate: cpc2 } = this
        g.moveTo(...c1)
        g.bezierCurveTo(...cpc1, ...cpc2, ...c2)
        return g
    }
    clone() {
        return new Bezier(this.owner, this.point1Coordinate, this.point2Coordinate, this.controlPoint1Coordinate, this.controlPoint2Coordinate)
    }
    copyFrom(bezier: Bezier | null) {
        if (bezier === null) bezier = new Bezier(this.owner)
        this._setPoint1X(coord.x(bezier._point1Coordinate))
        this._setPoint1Y(coord.y(bezier._point1Coordinate))
        this._setPoint2X(coord.x(bezier._point2Coordinate))
        this._setPoint2Y(coord.y(bezier._point2Coordinate))
        this._setControlPoint1X(coord.x(bezier._controlPoint1Coordinate))
        this._setControlPoint1Y(coord.y(bezier._controlPoint1Coordinate))
        this._setControlPoint2X(coord.x(bezier._controlPoint2Coordinate))
        this._setControlPoint2Y(coord.y(bezier._controlPoint2Coordinate))
        return this
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tpoint1Coordinate: ${this.point1Coordinate.join(", ")}`,
            `\tpoint2Coordinate: ${this.point2Coordinate.join(", ")}`,
            `\tcontrolPoint1Coordinate: ${this.controlPoint1Coordinate.join(", ")}`,
            `\tcontrolPoint2Coordinate: ${this.controlPoint2Coordinate.join(", ")}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [this.point1Coordinate, this.point2Coordinate, this.controlPoint1Coordinate, this.controlPoint2Coordinate]
    }
    toObject() {
        return {
            point1Coordinate: this.point1Coordinate,
            point2Coordinate: this.point2Coordinate,
            controlPoint1Coordinate: this.controlPoint1Coordinate,
            controlPoint2Coordinate: this.controlPoint2Coordinate
        }
    }
}

validAndWithSameOwner(Bezier)
/**
 *
 * @category Shape
 */
export default Bezier

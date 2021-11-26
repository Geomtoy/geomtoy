import { validAndWithSameOwner } from "../../decorator"
import assert from "../../utility/assertion"
import util from "../../utility"
import math from "../../utility/math"
import coord from "../../utility/coordinate"
import vec2 from "../../utility/vec2"
import angle from "../../utility/angle"

import Arrow from "../../helper/Arrow"

import Shape from "../../base/Shape"
import Point from "./Point"
import Line from "./Line"
import Ray from "./Ray"
import LineSegment from "./LineSegment"
import Graphics from "../../graphics"

import type Geomtoy from "../.."
import type Transformation from "../../transformation"
import type { TransformableShape } from "../../types"

class Vector extends Shape implements TransformableShape {
    private _coordinate: [number, number] = [NaN, NaN]
    private _point1Coordinate: [number, number] = [0, 0]

    constructor(owner: Geomtoy, x: number, y: number)
    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number)
    constructor(owner: Geomtoy, coordinate: [number, number])
    constructor(owner: Geomtoy, point1Coordinate: [number, number], point2Coordinate: [number, number])
    constructor(owner: Geomtoy, point: Point)
    constructor(owner: Geomtoy, point1: Point, point2: Point)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any) {
        super(o)
        if (util.isNumber(a1)) {
            if (util.isNumber(a3)) {
                Object.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4 })
            } else {
                Object.assign(this, { x: a1, y: a2 })
            }
        }
        if (util.isArray(a1)) {
            if (util.isArray(a2)) {
                Object.assign(this, { point1Coordinate: a1, point2Coordinate: a2 })
            } else {
                Object.assign(this, { coordinate: a1 })
            }
        }
        if (a1 instanceof Point) {
            if (a2 instanceof Point) {
                Object.assign(this, { point1: a1, point2: a2 })
            } else {
                Object.assign(this, { point: a1 })
            }
        }
        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        xChanged: "xChanged",
        yChanged: "yChanged",
        point1XChanged: "point1XChanged",
        point1YChanged: "point1YChanged",
        point2XChanged: "point2XChanged",
        point2YChanged: "point2YChanged"
    })

    private _setX(value: number) {
        this.willTrigger_(coord.x(this._coordinate), value, [Vector.events.xChanged, Vector.events.point2XChanged])
        coord.x(this._coordinate, value)
    }
    private _setY(value: number) {
        this.willTrigger_(coord.y(this._coordinate), value, [Vector.events.yChanged, Vector.events.point2YChanged])
        coord.y(this._coordinate, value)
    }
    private _setPoint1X(value: number) {
        this.willTrigger_(coord.x(this._point1Coordinate), value, [Vector.events.point1XChanged])
        coord.x(this._point1Coordinate, value)
    }
    private _setPoint1Y(value: number) {
        this.willTrigger_(coord.y(this._point1Coordinate), value, [Vector.events.point1YChanged])
        coord.y(this._point1Coordinate, value)
    }

    get x() {
        return coord.x(this._coordinate)
    }
    set x(value) {
        assert.isRealNumber(value, "x")
        this._setX(value)
    }
    get y() {
        return coord.y(this._coordinate)
    }
    set y(value) {
        assert.isRealNumber(value, "y")
        this._setY(value)
    }
    get coordinate() {
        return coord.clone(this._coordinate)
    }
    set coordinate(value) {
        assert.isCoordinate(value, "coordinate")
        this._setX(coord.x(value))
        this._setY(coord.y(value))
    }
    get point() {
        return new Point(this.owner, this._coordinate)
    }
    set point(value) {
        assert.isPoint(value, "point")
        this._setX(value.x)
        this._setY(value.y)
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
        return coord.x(this._point1Coordinate) + coord.x(this._coordinate)
    }
    set point2X(value) {
        assert.isRealNumber(value, "point2X")
        this._setX(value - coord.x(this._point1Coordinate))
    }
    get point2Y() {
        return coord.y(this._point1Coordinate) + coord.y(this._coordinate)
    }
    set point2Y(value) {
        assert.isRealNumber(value, "point2Y")
        this._setX(value - coord.y(this._point1Coordinate))
    }
    get point2Coordinate() {
        return vec2.add(this._point1Coordinate, this._coordinate)
    }
    set point2Coordinate(value) {
        assert.isCoordinate(value, "point2Coordinate")
        const c = vec2.from(this._point1Coordinate, value)
        this._setX(coord.x(c))
        this._setY(coord.y(c))
    }
    get point2() {
        return new Point(this.owner, vec2.add(this._point1Coordinate, this._coordinate))
    }
    set point2(value) {
        assert.isPoint(value, "point2")
        const c = vec2.from(this._point1Coordinate, value.coordinate)
        this._setX(coord.x(c))
        this._setY(coord.y(c))
    }

    /**
     * Get the angle of vector `this`, the result is in the interval `(-math.PI, math.PI]`.
     */
    get angle() {
        return angle.simplify2(vec2.angle(this._coordinate))
    }
    /**
     * Get the magnitude of vector `this`.
     */
    get magnitude(): number {
        return vec2.magnitude(this._coordinate)
    }

    isValid() {
        if (!coord.isValid(this._coordinate)) return false
        if (!coord.isValid(this._point1Coordinate)) return false
        return true
    }

    static zero(owner: Geomtoy) {
        return new Vector(owner, 0, 0)
    }

    static fromAngleAndMagnitude(owner: Geomtoy, angle: number, magnitude: number): Vector {
        const [x, y] = coord.moveAlongAngle([0, 0], angle, magnitude)
        return new Vector(owner, x, y)
    }
    static fromLineSegment(owner: Geomtoy, lineSegment: LineSegment, reverse = false) {
        return reverse
            ? new Vector(owner, lineSegment.point2Coordinate, lineSegment.point1Coordinate)
            : new Vector(owner, lineSegment.point1Coordinate, lineSegment.point2Coordinate)
    }

    /**
     * Whether vector `this` is the same as vector `vector`.
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs(vector: Vector): boolean {
        if (this === vector) return true
        return coord.isSameAs(this.coordinate, vector.coordinate, this.options_.epsilon)
    }
    /**
     * Whether vector `this` is the same as vector `vector`, including the initial point
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs2(vector: Vector): boolean {
        if (this === vector) return true
        const epsilon = this.options_.epsilon
        return coord.isSameAs(this.point1Coordinate, vector.point1Coordinate, epsilon) && this.isSameAs(vector)
    }
    /**
     * Move vector `this` by `deltaX` and `deltaY` to get new vector.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move vector `this` itself by `deltaX` and `deltaY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.coordinate = coord.move(this.coordinate, deltaX, deltaY)
        this.point1Coordinate = coord.move(this.point1Coordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move vector `this` with `distance` along `angle` to get new vector.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move vector `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.coordinate = coord.moveAlongAngle(this.coordinate, angle, distance)
        this.point1Coordinate = coord.moveAlongAngle(this.point1Coordinate, angle, distance)
        return this
    }

    /**
     * Angle from vector `this` to vector `vector`, in the interval `(-math.PI, math.PI]`
     * @param {Vector} vector
     * @returns {number}
     */
    getAngleToVector(vector: Vector): number {
        return angle.simplify2(this.angle - vector.angle)
    }

    standardize() {
        return this.clone().standardizeSelf()
    }
    standardizeSelf() {
        this.point1Coordinate = [0, 0]
    }
    toPoint() {
        return new Point(this.owner, this.coordinate)
    }
    toLine() {
        return Line.fromTwoPoints.bind(this)(this.point1Coordinate, this.point2Coordinate)
    }
    toLineSegment() {
        return new LineSegment(this.owner, this.point1Coordinate, this.point2Coordinate)
    }
    toRay() {
        return new Ray(this.owner, this.point1Coordinate, this.angle)
    }

    dotProduct(vector: Vector): number {
        return vec2.dot(this.coordinate, vector.coordinate)
    }
    crossProduct(vector: Vector): number {
        return vec2.cross(this.coordinate, vector.coordinate)
    }
    normalize(): Vector {
        return new Vector(this.owner, vec2.normalize(this.coordinate))
    }
    add(vector: Vector): Vector {
        return new Vector(this.owner, vec2.add(this.coordinate, vector.coordinate))
    }
    subtract(vector: Vector): Vector {
        return new Vector(this.owner, vec2.subtract(this.coordinate, vector.coordinate))
    }
    scalarMultiply(scalar: number): Vector {
        return new Vector(this.owner, vec2.scalarMultiply(this.coordinate, scalar))
    }
    negative() {
        return new Vector(this.owner, vec2.negative(this.coordinate))
    }
    rotate(angle: number): Vector {
        return new Vector(this.owner, vec2.rotate(this.coordinate, angle))
    }
    clone() {
        return new Vector(this.owner, this.point1Coordinate, this.coordinate)
    }
    copyFrom(vector: Vector | null) {
        if (vector === null) vector = new Vector(this.owner)
        this._setX(coord.x(vector._coordinate))
        this._setY(coord.y(vector._coordinate))
        this._setPoint1X(coord.x(vector._point1Coordinate))
        this._setPoint1Y(coord.y(vector._point1Coordinate))
        return this
    }
    apply(transformation: Transformation) {
        let c = transformation.transformCoordinate(this.coordinate)
        return new Vector(this.owner, this.point1Coordinate, c)
    }
    getGraphics() {
        const g = new Graphics()
        if (!this.isValid()) return g
        const { point1Coordinate: c1, point2Coordinate: c2 } = this

        g.moveTo(...c1)
        g.lineTo(...c2)

        const arrowGraphics = new Arrow(this.owner, c2, this.angle).getGraphics()
        g.append(arrowGraphics)
        return g
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tcoordinate: ${this.coordinate.join(", ")}`,
            `\tpoint1Coordinate: ${this.point1Coordinate.join(", ")}`,
            `\tpoint2Coordinate: ${this.point2Coordinate.join(", ")}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [this.coordinate, this.point1Coordinate, this.point2Coordinate]
    }
    toObject() {
        return {
            coordinate: this.coordinate,
            point1Coordinate: this.point1Coordinate,
            point2Coordinate: this.point2Coordinate
        }
    }
}

validAndWithSameOwner(Vector)

/**
 *
 * @category Shape
 */
export default Vector

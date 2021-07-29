import Vector from "./Vector"
import Segment from "./Segment"
import Line from "./Line"
import Circle from "./Circle"
import Graphic from "./graphic"
import GeomObject from "./base/GeomObject"
import vec2 from "./utility/vec2"
import type from "./utility/type"
import angle from "./utility/angle"
import math from "./utility/math"
import { Coordinate, GraphicImplType, RsPointToCircle, RsPointToLine, RsPointToSegment, CanvasDirective, SvgDirective } from "./types"
import { is, sealed } from "./decorator"
import Transformation from "./transformation"

@sealed
class Point extends GeomObject {
    #x: number | undefined
    #y: number | undefined

    constructor(x: number, y: number)
    constructor(position: Coordinate | Point | Vector)
    constructor()
    constructor(a1?: any, a2?: any) {
        super()
        if (type.isNumber(a1) && type.isNumber(a2)) {
            Object.seal(Object.assign(this, { a1, a2 }))
            return this
        }
        if (type.isCoordinate(a1)) {
            return Point.fromCoordinate(a1)
        }
        if (a1 instanceof Point) {
            return a1.clone()
        }
        if (a1 instanceof Vector) {
            return Point.fromVector(a1)
        }
        return Point.zero
    }

    @is("realNumber")
    get x() {
        return this.#x!
    }
    set x(value) {
        this.#x = value
    }
    @is("realNumber")
    get y() {
        return this.#y!
    }
    set y(value) {
        this.#y = value
    }

    static get zero(): Point {
        return new Point(0, 0)
    }

    /**
     * Return a point from a coordinate
     * @param {Coordinate} coordinate
     * @returns {Point}
     */
    static fromCoordinate(coordinate: Coordinate): Point {
        return new Point(coordinate[0], coordinate[1])
    }
    /**
     * Return a point from a vector
     * @param {Vector} vector
     * @returns {Point}
     */
    static fromVector(vector: Vector): Point {
        return vector.point2
    }

    /**
     * Whether point `this` is `Point.zero`
     * @returns {boolean}
     */
    isZero(): boolean {
        return this.isSameAs(Point.zero)
    }
    /**
     * Whether point `this` is the same as point `point`
     * @param {Point} point
     * @returns {boolean}
     */
    isSameAs(point: Point): boolean {
        if (point === this) return true
        let epsilon = this.options.epsilon
        return math.equalTo(this.x, point.x, epsilon) && math.equalTo(this.y, point.y, epsilon)
    }
    /**
     * Get coordinate from point `this`
     * @returns {Coordinate}
     */
    getCoordinate(): Coordinate {
        return [this.x, this.y]
    }
    /**
     * Walk point `this` with a `distance` towards the direction of the `angle`
     * @param {number} angle
     * @param {number} distance
     * @returns {Point}
     */
    walk(angle: number, distance: number): Point {
        return this.clone().walkSelf(angle, distance)
    }
    walkSelf(angle: number, distance: number) {
        this.x += distance * math.cos(angle)
        this.y += distance * math.sin(angle)
        return this
    }
    /**
     * Move point `this` by the offset
     * @param {number} offsetX
     * @param {number} offsetY
     * @returns {Point}
     */
    move(offsetX: number, offsetY: number): Point {
        return this.clone().moveSelf(offsetX, offsetY)
    }
    moveSelf(offsetX: number, offsetY: number) {
        this.x += offsetX
        this.y += offsetY
        return this
    }
    /**
     * Get the distance between point `this` and point `point`
     * @param {Point} point
     * @returns {number}
     */
    getDistanceBetweenPoint(point: Point): number {
        return vec2.magnitude(vec2.from(this.getCoordinate(), point.getCoordinate()))
    }
    /**
     * Get the distance square between point `this` and point `point`
     * @param {Point} point
     * @returns {number}
     */
    getSquaredDistanceFromPoint(point: Point): number {
        return vec2.squaredMagnitude(vec2.from(this.getCoordinate(), point.getCoordinate()))
    }
    /**
     * Get the distance between point `this` and line `line`
     * @param {Line} line
     * @returns {number}
     */
    getDistanceBetweenLine(line: Line): number {
        return math.abs(this.getSignedDistanceBetweenLine(line))
    }
    /**
     * Get the signed distance between point `this` and line `line`
     * @param {Line} line
     * @returns {number}
     */
    getSignedDistanceBetweenLine(line: Line): number {
        let { a, b, c } = line,
            { x, y } = this
        return (a * x + b * y + c) / math.hypot(a, b)
    }
    /**
     * Whether point `this` is lying on the same line determined by points `point1` and `point2` and point `this` is between points `point1` and `point2`
     * @param {Point} point1
     * @param {Point} point2
     * @param {boolean} allowEqual Allow point `this` to be equal to point `point1` or `point2`
     * @returns {boolean}
     */
    isBetweenPoints(point1: Point, point2: Point, allowEqual: boolean = true): boolean {
        let v1 = vec2.from(point1.getCoordinate(), point2.getCoordinate()),
            v2 = vec2.from(point1.getCoordinate(), this.getCoordinate()),
            cp = vec2.cross(v1, v2),
            dp = vec2.dot(v1, v2),
            sm = vec2.squaredMagnitude(v1),
            epsilon = this.options.epsilon

        if (allowEqual) {
            return math.equalTo(cp, 0, epsilon) && !math.lessThan(dp, 0, epsilon) && !math.greaterThan(dp, sm, epsilon)
        }
        return math.equalTo(cp, 0, epsilon) && math.greaterThan(dp, 0, epsilon) && math.lessThan(dp, sm, epsilon)
    }

    isOutsideRectangle() {}

    isInsideRectangle() {}

    isOnRectangle() {}

    isOnLine(line: Line): boolean {
        let { a, b, c } = line,
            { x, y } = this,
            epsilon = this.options.epsilon
        return math.equalTo(a * x + b * y + c, 0, epsilon)
    }
    isEndpointOfSegment(segment: Segment): boolean {
        return this.isSameAs(segment.point1) || this.isSameAs(segment.point2)
    }

    isOnSegmentLyingLine(segment: Segment): boolean {
        let v1 = vec2.from(segment.point1.getCoordinate(), segment.point2.getCoordinate()),
            v2 = vec2.from(segment.point1.getCoordinate(), this.getCoordinate()),
            epsilon = this.options.epsilon,
            dp = vec2.dot(v1, v2)
        return math.equalTo(dp, 0, epsilon)
    }

    isOnSegment(segment: Segment): boolean {
        return this.isBetweenPoints(segment.point1, segment.point2, true)
    }

    isOnCircle(circle: Circle) {
        let sd = this.getSquaredDistanceFromPoint(circle.centerPoint),
            sr = circle.radius ** 2,
            epsilon = this.options.epsilon
        return math.equalTo(sd, sr, epsilon)
    }
    isInsideCircle(circle: Circle) {
        let sd = this.getSquaredDistanceFromPoint(circle.centerPoint),
            sr = circle.radius ** 2,
            epsilon = this.options.epsilon
        return math.lessThan(sd, sr, epsilon)
    }
    isOutsideCircle(circle: Circle) {
        let sd = this.getSquaredDistanceFromPoint(circle.centerPoint),
            sr = circle.radius ** 2,
            epsilon = this.options.epsilon
        return math.greaterThan(sd, sr, epsilon)
    }

    /**
     * Get graphic object of `this`
     * @param {GraphicImplType} type
     * @returns {Array<SvgDirective | CanvasDirective>}
     */
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective> {
        let x = this.x,
            y = this.y,
            g = new Graphic(),
            pointSize = this.options.graphic.pointSize
        g.moveTo(x, y)
        g.centerArcTo(x, y, pointSize, pointSize, 0, 2 * Math.PI, 0)
        g.close()
        return g.valueOf(type)
    }
    /**
     * apply the transformation
     * @returns {Point}
     */
    apply(t: Transformation): Point {
        return t.get().transformPoint(this)
    }
    clone() {
        return new Point(this.x, this.y)
    }
    toArray() {
        return [this.x, this.y]
    }
    toObject() {
        return { x: this.x, y: this.y }
    }
    toString() {
        return `Point(x:${this.x}, y:${this.y})}`
    }
}

export default Point

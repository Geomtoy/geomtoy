import vec2 from "./utility/vec2"
import util from "./utility"
import math from "./utility/math"
import { is, sealed, validAndWithSameOwner } from "./decorator"
import coord from "./helper/coordinate"

import Geomtoy from "."
import GeomObject from "./base/GeomObject"
import Vector from "./Vector"
import Segment from "./Segment"
import Line from "./Line"
import Circle from "./Circle"
import Transformation from "./transformation"

import Graphic from "./graphic"
import { GraphicImplType, CanvasDirective, SvgDirective } from "./types"
import { Visible } from "./interfaces"
import Polygon from "./Polygon"
import Triangle from "./Triangle"
import Ray from "./Ray"

@sealed
@validAndWithSameOwner
class Point extends GeomObject implements Visible {
    #coordinate: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, x: number, y: number)
    constructor(owner: Geomtoy, coordinate: [number, number])
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any) {
        super(o)
        if (util.isNumber(a1) && util.isNumber(a2)) {
            Object.assign(this, { x: a1, y: a2 })
        }
        if (util.isCoordinate(a1)) {
            Object.assign(this, { coordinate: coord.copy(a1) })
        }
        return Object.seal(this)
    }

    @is("realNumber")
    get x() {
        return coord.x(this.#coordinate)
    }
    set x(value) {
        coord.x(this.#coordinate, value)
    }
    @is("realNumber")
    get y() {
        return coord.y(this.#coordinate)
    }
    set y(value) {
        coord.y(this.#coordinate, value)
    }
    @is("coordinate")
    get coordinate() {
        return coord.copy(this.#coordinate)
    }
    set coordinate(value) {
        coord.assign(this.#coordinate, value)
    }

    static zero(owner: Geomtoy): Point {
        return new Point(owner, 0, 0)
    }

    isValid() {
        return coord.isValid(this.#coordinate)
    }
    /**
     * Whether points `point1`, `point2`, `point3` are collinear.
     * @category Static
     * @param point1
     * @param point2
     * @param point3
     * @returns
     */
    static isThreePointsCollinear(owner: Geomtoy, point1: Point, point2: Point, point3: Point) {
        let [x1, y1] = point1.coordinate,
            [x2, y2] = point2.coordinate,
            [x3, y3] = point3.coordinate,
            d = x1 * y2 + x2 * y3 + x3 * y1 - (x2 * y1 + x3 * y2 + x1 * y3) //cross product shorthand
        return math.equalTo(d, 0, owner.getOptions().epsilon)
    }
    /**
     * Get the `n` equally dividing rays of the angle which is formed by points `vertex`, `leg1` and `leg2`.
     * @description
     * The angle is generated from `leg1` to `leg2` taking `vertex` as the center of rotation.
     * If `n` is not an integer, return `null`.
     * If any two in `vertex`, `leg1`, `leg2` are the same, return `null`.
     * @param n
     * @param vertex
     * @param leg1
     * @param leg2
     */
    static getAngleNEquallyDividingRaysFromThreePoints(owner: Geomtoy, n: number, vertex: Point, leg1: Point, leg2: Point): Array<Ray> | null {
        if (!util.isInteger(n) || n < 2) return null

        let c0 = vertex.coordinate,
            c1 = leg1.coordinate,
            c2 = leg2.coordinate,
            epsilon = owner.getOptions().epsilon
        if (coord.isSameAs(c0, c1, epsilon) || coord.isSameAs(c0, c2, epsilon) || coord.isSameAs(c1, c2, epsilon)) return null
        let a1 = vec2.angle(vec2.from(c0, c1)),
            a2 = vec2.angle(vec2.from(c0, c1)),
            d = (a2 - a1) / n,
            ret: Array<any> = []

        util.forEach(util.range(1, n), i => {
            ret.push(new Ray(owner, vertex, a1 + d * i))
        })
        return ret
    }

    //todo
    static isFourPointsConcyclic(owner: Geomtoy, point1: Point, point2: Point, point3: Point, point4: Point) {}
    /**
     * Determine a point from vector `vector`.
     * @category Static
     * @param vector
     * @returns
     */
    static fromVector(owner: Geomtoy, vector: Vector): Point {
        return new Point(owner, vector.point2.coordinate)
    }

    /**
     * Whether point `this` is `Point.zero()`.
     * @returns {boolean}
     */
    isZero(): boolean {
        let { x, y } = this,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(x, 0, epsilon) && math.equalTo(y, 0, epsilon)
    }
    /**
     * Whether point `this` is the same as point `point`.
     * @param {Point} point
     * @returns {boolean}
     */
    isSameAs(point: Point): boolean {
        if (point === this) return true
        let epsilon = this.owner.getOptions().epsilon
        return coord.isSameAs(this.coordinate, point.coordinate, epsilon)
    }
    /**
     * Move point `this` by offsets `offsetX` and `offsetY`.
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
     * Move point `this` with distance `distance` along angle `angle`.
     * @param {number} angle
     * @param {number} distance
     * @returns {Point}
     */
    moveAlongAngle(angle: number, distance: number): Point {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    moveAlongAngleSelf(angle: number, distance: number) {
        this.x += distance * math.cos(angle)
        this.y += distance * math.sin(angle)
        return this
    }

    /**
     * Get the distance between point `this` and point `point`.
     * @param {Point} point
     * @returns {number}
     */
    getDistanceBetweenPoint(point: Point): number {
        return vec2.magnitude(vec2.from(this.coordinate, point.coordinate))
    }
    /**
     * Get the distance square between point `this` and point `point`.
     * @param {Point} point
     * @returns {number}
     */
    getSquaredDistanceBetweenPoint(point: Point): number {
        return vec2.squaredMagnitude(vec2.from(this.coordinate, point.coordinate))
    }
    /**
     * Get the distance between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getDistanceBetweenLine(line: Line): number {
        return math.abs(this.getSignedDistanceBetweenLine(line))
    }
    /**
     * Get the signed distance between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getSignedDistanceBetweenLine(line: Line): number {
        let { a, b, c } = line,
            { x, y } = this
        return (a * x + b * y + c) / math.hypot(a, b)
    }
    /**
     * Get the distance square between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getSquaredDistanceBetweenLine(line: Line): number {
        let { a, b, c } = line,
            { x, y } = this
        return (a * x + b * y + c) ** 2 / (a ** 2 + b ** 2)
    }
    /**
     * Get the distance between point `this` and segment `segment`.
     * @param {Segment} segment
     * @returns {number}
     */
    getDistanceBetweenSegment(segment: Segment): number {
        return math.abs(this.getSignedDistanceBetweenSegment(segment))
    }
    /**
     * Get the signed distance between point `this` and segment `segment`.
     * @summary [[include:Line.md]]
     * @param {Segment} segment
     * @returns {number}
     */
    getSignedDistanceBetweenSegment(segment: Segment): number {
        let c0 = this.coordinate,
            c1 = segment.point1Coordinate,
            c2 = segment.point2Coordinate,
            v12 = vec2.from(c1, c2),
            v10 = vec2.from(c1, c0)
        return vec2.cross(v12, v10) / vec2.magnitude(vec2.from(c1, c2))
    }
    /**
     * Get the distance square between point `this` and segment `segment`
     * @param {Segment} segment
     * @returns {number}
     */
    getSquaredDistanceBetweenSegment(segment: Segment): number {
        let c0 = this.coordinate,
            c1 = segment.point1Coordinate,
            c2 = segment.point2Coordinate,
            v12 = vec2.from(c1, c2),
            v10 = vec2.from(c1, c0)
        return vec2.cross(v12, v10) ** 2 / vec2.squaredMagnitude(vec2.from(c1, c2))
    }

    /**
     * Whether point `this` is on the same line determined by points `point1` and `point2`,
     * and point `this` is between points `point1` and `point2`
     * @param point1
     * @param point2
     * @param allowEqual Allow point `this` to be equal to point `point1` or `point2`
     * @returns
     */
    isBetweenPoints(point1: Point, point2: Point, allowEqual: boolean = true): boolean {
        let c0 = this.coordinate,
            c1 = point1.coordinate,
            c2 = point2.coordinate,
            v12 = vec2.from(c1, c2),
            v10 = vec2.from(c1, c0),
            cp = vec2.cross(v12, v10),
            dp = vec2.dot(v12, v10),
            sm = vec2.squaredMagnitude(v12),
            epsilon = this.owner.getOptions().epsilon

        if (allowEqual) {
            return math.equalTo(cp, 0, epsilon) && !math.lessThan(dp, 0, epsilon) && !math.greaterThan(dp, sm, epsilon)
        }
        return math.equalTo(cp, 0, epsilon) && math.greaterThan(dp, 0, epsilon) && math.lessThan(dp, sm, epsilon)
    }

    isOnTriangle(triangle: Triangle) {}
    isInsideTriangle(triangle: Triangle) {}
    isOutsideTriangle(triangle: Triangle) {}

    isOutsidePolygon() {}

    isInsidePolygon() {}

    isOnPolygon(polygon: Polygon) {}

    isOnLine(line: Line): boolean {
        let { a, b, c } = line,
            { x, y } = this,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(a * x + b * y + c, 0, epsilon)
    }
    isEndpointOfSegment(segment: Segment): boolean {
        return this.isSameAs(segment.point1) || this.isSameAs(segment.point2)
    }

    isOnSegmentLyingLine(segment: Segment): boolean {
        let v1 = vec2.from(segment.point1Coordinate, segment.point2Coordinate),
            v2 = vec2.from(segment.point1Coordinate, this.coordinate),
            epsilon = this.owner.getOptions().epsilon,
            dp = vec2.dot(v1, v2)
        return math.equalTo(dp, 0, epsilon)
    }

    isOnSegment(segment: Segment): boolean {
        return this.isBetweenPoints(segment.point1, segment.point2, true)
    }

    isOnCircle(circle: Circle) {
        let sd = this.getSquaredDistanceBetweenPoint(circle.centerPoint),
            sr = circle.radius ** 2,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(sd, sr, epsilon)
    }
    isInsideCircle(circle: Circle) {
        let sd = this.getSquaredDistanceBetweenPoint(circle.centerPoint),
            sr = circle.radius ** 2,
            epsilon = this.owner.getOptions().epsilon
        return math.lessThan(sd, sr, epsilon)
    }
    isOutsideCircle(circle: Circle) {
        let sd = this.getSquaredDistanceBetweenPoint(circle.centerPoint),
            sr = circle.radius ** 2,
            epsilon = this.owner.getOptions().epsilon
        return math.greaterThan(sd, sr, epsilon)
    }

    /**
     * Get graphic object of `this`
     * @param {GraphicImplType} type
     * @returns {Array<SvgDirective | CanvasDirective>}
     */
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective> {
        let { x, y } = this,
            g = new Graphic(),
            pointSize = this.owner.getOptions().graphic.pointSize
        g.moveTo(x, y)
        g.centerArcTo(x, y, pointSize, pointSize, 0, 2 * Math.PI, 0)
        g.close()
        return g.valueOf(type)
    }
    /**
     * apply the transformation
     * @returns {Point}
     */
    apply(transformation: Transformation): Point {
        let c = transformation.get().transformCoordinate(this.coordinate)
        return new Point(this.owner, c)
    }
    clone() {
        return new Point(this.owner, this.x, this.y)
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tcoordinate: ${coord.toString(this.coordinate)}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [coord.copy(this.coordinate)]
    }
    toObject() {
        return { coordinate: coord.copy(this.coordinate) }
    }
}

/**
 *
 * @category GeomObject
 */
export default Point

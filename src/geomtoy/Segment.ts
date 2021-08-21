import util from "./utility"
import math from "./utility/math"
import vec2 from "./utility/vec2"

import Point from "./Point"
import Vector from "./Vector"
import Line from "./Line"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import { GraphicImplType, SvgDirective, CanvasDirective } from "./types"
import { is, sameOwner, sealed } from "./decorator"
import Graphic from "./graphic"
import Geomtoy from "."
import coord from "./helper/coordinate"
import Ray from "./Ray"

@sealed
class Segment extends GeomObject {
    #name = "Segment"
    #uuid = util.uuid()

    #point1Coordinate: [number, number] = [NaN, NaN]
    #point2Coordinate: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number)
    constructor(owner: Geomtoy, point1Coordinate: [number, number], point2Coordinate: [number, number])
    constructor(owner: Geomtoy, point1: Point, point2: Point)
    constructor(o: Geomtoy, a1: any, a2: any, a3?: any, a4?: any) {
        super(o)
        if (util.isNumber(a1) && util.isNumber(a2) && util.isNumber(a3) && util.isNumber(a4)) {
            return Object.seal(Object.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4 }))
        }
        if (util.isCoordinate(a1) && util.isCoordinate(a2)) {
            return Object.seal(Object.assign(this, { point1Coordinate: a1, point2Coordinate: a2 }))
        }
        if (a1 instanceof Point && a2 instanceof Point) {
            return Object.seal(Object.assign(this, { point1: a1, point2: a2 }))
        }
        throw new Error("[G]Arguments can NOT construct a `Segment`.")
    }
    get name() {
        return this.#name
    }
    get uuid() {
        return this.#uuid
    }

    @is("realNumber")
    get point1X() {
        return coord.x(this.#point1Coordinate)
    }
    set point1X(value) {
        coord.x(this.#point1Coordinate, value)
        this.#guard()
    }
    @is("realNumber")
    get point1Y() {
        return coord.y(this.#point1Coordinate)
    }
    set point1Y(value) {
        coord.y(this.#point1Coordinate, value)
        this.#guard()
    }
    @is("coordinate")
    get point1Coordinate() {
        return coord.copy(this.#point1Coordinate)
    }
    set point1Coordinate(value) {
        coord.assign(this.#point1Coordinate, value)
        this.#guard()
    }
    @sameOwner
    @is("point")
    get point1() {
        return new Point(this.owner, this.#point1Coordinate)
    }
    set point1(value) {
        coord.assign(this.#point1Coordinate, value.coordinate)
        this.#guard()
    }

    @is("realNumber")
    get point2X() {
        return coord.x(this.#point2Coordinate)
    }
    set point2X(value) {
        coord.x(this.#point2Coordinate, value)
        this.#guard()
    }
    @is("realNumber")
    get point2Y() {
        return coord.y(this.#point2Coordinate)
    }
    set point2Y(value) {
        coord.y(this.#point2Coordinate, value)
        this.#guard()
    }
    @is("coordinate")
    get point2Coordinate() {
        return coord.copy(this.#point2Coordinate)
    }
    set point2Coordinate(value) {
        coord.assign(this.#point2Coordinate, value)
        this.#guard()
    }
    @sameOwner
    @is("point")
    get point2() {
        return new Point(this.owner, this.#point2Coordinate)
    }
    set point2(value) {
        coord.assign(this.#point2Coordinate, value.coordinate)
        this.#guard()
    }

    /**
     * Get the angle of segment `this`, treated as a vector from `point1` to `point2`, the result is in the interval `(-math.PI, math.PI]`.
     */
    get angle(): number {
        return vec2.angle(vec2.from(this.point1Coordinate, this.point2Coordinate))
    }
    /**
     * Get the length of segment `this`.
     */
    get length(): number {
        return vec2.magnitude(vec2.from(this.point1Coordinate, this.point2Coordinate))
    }

    #guard() {
        let epsilon = this.owner.getOptions().epsilon
        if (coord.isSameAs(this.#point1Coordinate, this.#point2Coordinate, epsilon)) {
            throw new Error(`[G]The two endpoints of a segment should be distinct.`)
        }
    }
    static fromPointAndAngleAndLength(owner: Geomtoy, point: Point, angle: number, length: number) {
        let p1 = point,
            p2 = p1.moveAlongAngle(angle, length)
        return new Segment(owner, p1, p2)
    }
    /**
     * Get the `n` equally dividing rays of the angle which is formed by rays `ray1` and `ray2`.
     * @description
     * The angle is generated from `ray1` to `ray2` taking the common endpoint as the center of rotation.
     * If `n` is not integer, return `null`.
     * If `ray1` and `ray2` have different endpoint, return `null`.
     * @param n
     * @param ray1
     * @param ray2
     */
    static getAngleNEquallyDividingRaysOfTwoRays(owner: Geomtoy, n: number, ray1: Ray, ray2: Ray): Array<Ray> | null {
        if (!util.isInteger(n) || n < 2) return null
        if (!ray1.isEndpointSameAs(ray2)) return null
        let a1 = ray1.angle,
            a2 = ray2.angle,
            vertex = ray1.point,
            d = (a2 - a1) / n,
            ret: Array<Ray> = []
        util.forEach(util.range(1, n), i => {
            ret.push(new Ray(owner, vertex, a1 + d * i))
        })
        return ret
    }

    /**
     * Whether the two endpoints of segment `this` is the same as segment `segment` ignoring the order of the endpoints.
     * @param segment
     * @returns
     */
    isSameAs(segment: Segment) {
        let epsilon = this.owner.getOptions().epsilon,
            cs1 = coord.sort([this.point1Coordinate, this.point2Coordinate]),
            cs2 = coord.sort([segment.point1Coordinate, segment.point2Coordinate])
        return coord.isSameAs(cs1[0], cs2[0], epsilon) && coord.isSameAs(cs1[1], cs2[1], epsilon)
    }
    /**
     * Whether the two endpoints of segment `this` is the same as segment `segment` considering the order of the endpoints.
     * @param segment
     * @returns
     */
    isSameAs2(segment: Segment) {
        let epsilon = this.owner.getOptions().epsilon
        return coord.isSameAs(this.point1Coordinate, segment.point1Coordinate, epsilon) && coord.isSameAs(this.point2Coordinate, segment.point2Coordinate, epsilon)
    }
    /**
     * Get the middle point of segment `this`.
     * @returns
     */
    getMiddlePoint() {
        let [x1, y1] = this.point1Coordinate,
            [x2, y2] = this.point2Coordinate
        return new Point(this.owner, (x1 + x2) / 2, (y1 + y2) / 2)
    }
    /**
     * Get the perpendicularly bisecting line of segment `this`.
     * @returns
     */
    getPerpendicularlyBisectingLine() {
        let [x1, y1] = this.point1Coordinate,
            [x2, y2] = this.point2Coordinate,
            k = (x1 - x2) / (y1 - y2),
            p = this.getMiddlePoint()
        return Line.fromPointAndSlope(this.owner, p, k)
    }

    getIntersectionPointWithLine(line: Line) {
        return line.getIntersectionPointWithSegment(this)
    }

    // #region Positional relationships of segment to segment
    // (IdenticalTo)
    // PerpendicularTo
    // ParallelTo
    // CollinearWith = ParallelTo | self
    // JointedWith
    // OverlappedWith = ParallelTo | CollinearWith | self,
    // IntersectedWith
    // SeparatedFrom

    /**
     * Whether segment `this` is perpendicular to segment `segment`, regardless of whether they intersect.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isPerpendicularWithSegment(segment: Segment): boolean {
        let { point1Coordinate: c1, point2Coordinate: c2 } = this,
            { point1Coordinate: c3, point2Coordinate: c4 } = segment,
            v12 = vec2.from(c1, c2),
            v34 = vec2.from(c3, c4),
            dp = vec2.dot(v12, v34),
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(dp, 0, epsilon)
    }
    /**
     * Whether segment `this` is parallel to segment `segment`, regardless of whether they are collinear or even the same.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isParallelToSegment(segment: Segment): boolean {
        let { point1Coordinate: c1, point2Coordinate: c2 } = this,
            { point1Coordinate: c3, point2Coordinate: c4 } = segment,
            v12 = vec2.from(c1, c2),
            v34 = vec2.from(c3, c4),
            cp = vec2.cross(v12, v34),
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(cp, 0, epsilon)
    }

    /**
     * `线段this`与`线段s`是否共线，无论是否相接乃至相同
     * @param {Segment} segment
     * @returns {boolean}
     */
    isCollinearToSegment(segment: Segment): boolean {
        let { point1Coordinate: c1, point2Coordinate: c2 } = this,
            { point1Coordinate: c3, point2Coordinate: c4 } = segment,
            v12 = vec2.from(c1, c2),
            v34 = vec2.from(c3, c4),
            v32 = vec2.from(c3, c2),
            cp1 = vec2.cross(v12, v34),
            cp2 = vec2.cross(v32, v34),
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(cp1, 0, epsilon) && math.equalTo(cp2, 0, epsilon)
    }
    /**
     * `线段this`与`线段s`是否相接，即有且只有一个端点被共用(若两个共用则相同)，无论夹角为多少
     * @param {Segment} segment
     * @returns {boolean | Point} 接点
     */
    isJointedWithSegment(segment: Segment): boolean {
        let { point1Coordinate: c1, point2Coordinate: c2 } = this,
            { point1Coordinate: c3, point2Coordinate: c4 } = segment,
            epsilon = this.owner.getOptions().epsilon,
            d1 = coord.isSameAs(c1, c3, epsilon),
            d2 = coord.isSameAs(c2, c4, epsilon),
            d3 = coord.isSameAs(c1, c4, epsilon),
            d4 = coord.isSameAs(c2, c3, epsilon)
        return d1 !== d2 || d3 !== d4
    }
    getJointPointWithSegment(segment: Segment): Point | null {
        if (!this.isJointedWithSegment(segment)) return null
        let { point1Coordinate: c1, point2Coordinate: c2 } = this,
            { point1Coordinate: c3, point2Coordinate: c4 } = segment,
            epsilon = this.owner.getOptions().epsilon
        if (coord.isSameAs(c1, c3, epsilon) || coord.isSameAs(c1, c4, epsilon)) {
            return this.point1
        } else {
            return this.point2
        }
    }
    /**
     * `线段this`与`线段s`是否有重合，即有部分重合的一段(线段)
     * @param {Segment} s
     * @returns {boolean | Segment} 重合部分
     */
    #isOverlappedWithSegment(segment: Segment) {
        if (!this.isCollinearToSegment(segment)) return false //重合的前提是共线

        let arrP = []

        if (this.point1.isBetweenPoints(segment.point1, segment.point2)) arrP.push(this.point1)
        if (this.point2.isBetweenPoints(segment.point1, segment.point2)) arrP.push(this.point2)
        if (segment.point1.isBetweenPoints(this.point1, this.point2)) arrP.push(segment.point1)
        if (segment.point2.isBetweenPoints(this.point1, this.point2)) arrP.push(segment.point2)

        //去掉相接的情况，相接uniq之后，元素个数为1，其余情况为2
        arrP = util.uniqWith(arrP, (i, j) => i.isSameAs(j))
        if (arrP.length == 2) return new Segment(this.owner, arrP[0], arrP[1])

        return false
    }
    isOverlappedWithSegment(segment: Segment) {
        return Boolean(this.#isOverlappedWithSegment(segment))
    }
    getOverlapSegmentWithSegment(segment: Segment) {
        let ret = this.#isOverlappedWithSegment(segment)
        if (ret) return ret
        return null
    }
    /**
     * `线段this`与`线段s`是否相交，相交不仅要求有且仅有一个点重合，且要求夹角不等于0或者math.PI
     * 包含了不共线的相接和线段的端点在另一个线段上的特殊情况
     * @param {Segment} segment
     * @returns {boolean | Point} 交点
     */
    #isIntersectedWithSegment(segment: Segment) {
        if (this.isParallelToSegment(segment)) return false //相交的前提是不平行

        let v1 = new Vector(this.owner, this.point1, this.point2),
            v2 = new Vector(this.owner, segment.point1, segment.point2),
            v3 = new Vector(this.owner, this.point1, segment.point1),
            cp1 = v1.crossProduct(v2),
            cp2 = v3.crossProduct(v2),
            cp3 = v3.crossProduct(v1)

        if (math.equalTo(cp1, 0)) return false
        let t1 = cp3 / cp1,
            t2 = cp2 / cp1
        if (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) {
            return Point.fromVector(this.owner, new Vector(this.owner, this.point1).add(v1.scalarMultiply(t2)))
        }
        return false
    }

    isIntersectedWithSegment(segment: Segment) {
        return Boolean(this.#isIntersectedWithSegment(segment))
    }
    getIntersectionPointWithSegment(segment: Segment) {
        let ret = this.#isIntersectedWithSegment(segment)
        if (ret) return ret
        return null
    }

    /**
     * Get the lerping(**lerp** here means **linear interpolation and extrapolation**) point of segment `this`.
     * @description
     * - When the `weight` is in the interval `[0, 1]`, it is interpolation:
     *      - If "weight=0", return `point1`.
     *      - If "weight=1", return `point2`.
     *      - If "0<weight<1", return a point between `point1` and `point2`.
     * - When the `weight` is in the interval `(-math.Infinity, 0)` and `(1, math.Infinity)`, it is extrapolation:
     *      - If "weight<0", return a point exterior of `point1`.
     *      - If "weight>1", return a point exterior of `point2`.
     * @param {number} weight
     * @returns {Point}
     */
    getLerpingPoint(weight: number): Point {
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = this,
            x = math.lerp(x1, x2, weight),
            y = math.lerp(y1, y2, weight)
        return new Point(this.owner, x, y)
    }
    /**
     * Get the lerping ratio `weight` lerped by line `line `.
     * @description
     * - When `line` is parallel to `this`, return `NaN`.
     * - When `line` is intersected with `this`, return a number in the interval `[0, 1]`:
     *      - If `line` passes through `point1`, return 0.
     *      - If `line` passes through `point2`, return 1.
     * - When `line` is not parallel to and not intersected with `this`, return a number in the interval `(-math.Infinity, 0)` and `(1, math.Infinity)`.
     * @param {Line} line
     * @returns {number}
     */
    getLerpingRatioByLine(line: Line): number {
        if (line.isParallelToSegment(this)) return NaN
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = this,
            { a, b, c } = line,
            d1 = a * x1 + b * y1 + c,
            d2 = a * x2 + b * y2 + c
        return d1 / (d1 - d2)
    }
    /**
     * Get the division point of segment `this`.
     * @description
     * - When `lambda` is equal to -1, return `null`.
     * - When `lambda` is in the interval `[0, math.Infinity]`, return a internal division point, a point between `point1` and `point2`:
     *      - If "lambda=0", return `point1`.
     *      - If "lambda=math.Infinity", return `point2`.
     * - When `lambda` is in the interval `(-math.Infinity, -1)` and `(-1, 0)`, return a external division point:
     *      - If "-1<lambda<0", return a point exterior of `point1`.
     *      - If "lambda<-1", return a point exterior of `point2`.
     *
     * @param {number} lambda
     * @returns {Point}
     */
    getDivisionPoint(lambda: number): Point | null {
        if (lambda === -1) return null
        if (math.abs(lambda) === math.Infinity) return this.point2.clone()
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = this,
            x = (x1 + lambda * x2) / (1 + lambda),
            y = (y1 + lambda * y2) / (1 + lambda)
        return new Point(this.owner, x, y)
    }

    /**
     * Get the division ratio `lambda` divided by line `line `.
     * @description
     * - When `line` is parallel to `this`, return `NaN`.
     * - When `line` is intersected with `this`, return a number in the interval `[0, math.Infinity]`:
     *      - If `line` passes through `point1`, return 0.
     *      - If `line` passes through `point2`, return `math.Infinity`.
     * - When `line` is not parallel to and not intersected with `this`, return a number in the interval `(-math.Infinity, -1)` and `(-1, 0)`.
     * @param {Line} line
     * @returns {number}
     */
    getDivisionRatioByLine(line: Line): number {
        if (line.isParallelToSegment(this)) return NaN
        if (this.point2.isOnLine(line)) return math.Infinity
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = this,
            { a, b, c } = line
        return -(a * x1 + b * y1 + c) / (a * x2 + b * y2 + c)
    }
    toLine(){
        return Line.fromTwoCoordinates(this.owner,this.point1Coordinate,this.point2Coordinate)
    }

    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[] {
        let g = new Graphic()
        g.moveTo(...this.point1Coordinate)
        g.lineTo(...this.point2Coordinate)
        return g.valueOf(type)
    }
    toArray() {
        return [this.point1.x, this.point1.y, this.point2.x, this.point2.y]
    }
    toObject() {
        return { p1x: this.point1.x, p1y: this.point1.y, p2x: this.point2.x, p2y: this.point2.y }
    }
    toString() {
        return `Segment(${this.point1.x}, ${this.point1.y}, ${this.point2.x}, ${this.point2.y})`
    }

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    clone(): GeomObject {
        throw new Error("Method not implemented.")
    }
}

/**
 *
 * @category GeomObject
 */
export default Segment

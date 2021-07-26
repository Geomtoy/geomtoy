import _ from "lodash"
import Vector from "./Vector"
import Segment from "./Segment"
import Line from "./Line"
import Circle from "./Circle"
import Graphic from "./graphic"
import GeomObject from "./base/GeomObject"
import util from "./utility"
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
        if (_.isNumber(a1) && _.isNumber(a2)) {
            Object.seal(Object.assign(this, { a1, a2 }))
            return this
        }
        if (util.type.isCoordinate(a1)) {
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
        let { x: x1, y: y1 } = this,
            { x: x2, y: y2 } = point,
            epsilon = this.options.epsilon
        return util.apxEqualsTo(x1, x2, epsilon) && util.apxEqualsTo(y1, y2, epsilon)
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
        this.x += distance * Math.cos(angle)
        this.y += distance * Math.sin(angle)
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
        let { x: x1, y: y1 } = this,
            { x: x2, y: y2 } = point
        return Math.hypot(x1 - x2, y1 - y2)
    }
    /**
     * Get the distance square between point `this` and point `point`
     * @param {Point} point
     * @returns {number}
     */
    getDistanceSquareFromPoint(point: Point): number {
        let { x: x1, y: y1 } = this,
            { x: x2, y: y2 } = point
        return (x1 - x2) ** 2 + (y1 - y2) ** 2
    }
    /**
     * Get the distance between point `this` and line `line`
     * @param {Line} line
     * @returns {number}
     */
    getDistanceBetweenLine(line: Line): number {
        return Math.abs(this.getSignedDistanceBetweenLine(line))
    }
    /**
     * Get the signed distance between point `this` and line `line`
     * @param {Line} line
     * @returns {number}
     */
    getSignedDistanceBetweenLine(line: Line): number {
        let { a, b, c } = line,
            { x, y } = this
        return (a * x + b * y + c) / Math.hypot(a, b)
    }
    /**
     * Whether point `this` is inside an imaginary rectangle with diagonals of point `point1` and point `point2`,
     * the coordinate of point `this` will not be greater than the maximum value of point `point1` and point `point2`,
     * nor less than the minimum value
     * @param {Point} point1
     * @param {Point} point2
     * @param {boolean} allowedOn Can it be on the rectangle, in other words, can it be equal to the maximum or minimum value
     * @returns {boolean}
     */
    isBetweenPoints(point1: Point, point2: Point, allowedOn: boolean = true): boolean {
        let { x: x1, y: y1 } = point1,
            { x: x2, y: y2 } = point2,
            arrX = _.sortBy([x1, x2]),
            arrY = _.sortBy([y1, y2]),
            epsilon = this.options.epsilon

        if (allowedOn) {
            return (
                !util.defLessThan(this.x, arrX[0], epsilon) &&
                !util.defGreaterThan(this.x, arrX[1], epsilon) &&
                !util.defLessThan(this.y, arrY[0], epsilon) &&
                !util.defGreaterThan(this.y, arrY[1], epsilon)
            )
        }
        return (
            util.defGreaterThan(this.x, arrX[0], epsilon) &&
            util.defLessThan(this.x, arrX[1], epsilon) &&
            util.defGreaterThan(this.y, arrY[0], epsilon) &&
            util.defLessThan(this.y, arrY[1], epsilon)
        )
    }
    /**
     * Get the relationship of point `this` to line `line`
     * @param {Line} line
     * @returns {RsPointToLine}
     */
    getRelationshipToLine(line: Line): RsPointToLine {
        let ret = 1,
            { a, b, c } = line,
            { x, y } = this,
            epsilon = this.options.epsilon

        if (util.apxEqualsTo(a * x + b * y + c, 0, epsilon)) {
            return (ret |= RsPointToLine.On)
        }
        return (ret |= RsPointToLine.NotOn)
    }
    /**
     * Whether point `this` is an endpoint of segment `segment`
     * @param {Segment} segment
     * @returns {boolean}
     */
    isEndpointOfSegment(segment: Segment): boolean {
        return this.isSameAs(segment.p1) || this.isSameAs(segment.p2)
    }
    /**
     * Get the relationship of point `this` to segment `segment`
     * @param {Segment} s
     * @returns {RsPointToSegment}
     */
    getRelationshipToSegment(segment: Segment): RsPointToSegment {
        let ret = 1,
            { x: x0, y: y0 } = this,
            { x: x1, y: y1 } = segment.p1,
            { x: x2, y: y2 } = segment.p2,
            v1 = util.vector.subtract([x1, y1], [x0, y0]),
            v2 = util.vector.subtract([x2, y2], [x0, y0]),
            epsilon = this.options.epsilon

        if (util.apxEqualsTo(util.vector.crossProduct(v1, v2), 0, epsilon) && this.isBetweenPoints(segment.p1, segment.p2, false)) {
            return (ret |= RsPointToSegment.On)
        }
        return (ret |= RsPointToSegment.NotOn)
    }
    /**
     * Get the relationship of point `this` to circle `circle`
     * @param {Circle} circle
     * @returns {RsPointToCircle}
     */
    getRelationshipToCircle(circle: Circle): RsPointToCircle {
        let ret = 1,
            distSquare = this.getDistanceSquareFromPoint(circle.centerPoint),
            rSquare = circle.radius ** 2,
            epsilon = this.options.epsilon

        if (util.apxEqualsTo(distSquare, rSquare, epsilon)) {
            ret |= RsPointToCircle.On
        }
        if (util.defLessThan(distSquare, rSquare, epsilon)) {
            ret |= RsPointToCircle.Inside | RsPointToCircle.NotOn
        }
        if (util.defGreaterThan(distSquare, rSquare, epsilon)) {
            ret |= RsPointToCircle.Outside | RsPointToCircle.NotOn
        }
        return ret
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

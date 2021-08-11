import math from "./utility/math"
import util from "./utility"

import Point from "./Point"
import Segment from "./Segment"
import Graphic from "./graphic"
import Rectangle from "./Rectangle"
import Circle from "./Circle"
import { is, sealed, validateOwner } from "./decorator"
import GeomObject from "./base/GeomObject"
import { CanvasDirective, GraphicImplType, SvgDirective } from "./types"
import Transformation from "./transformation"
import Vector from "./Vector"
import Geomtoy from "."
import Polygon from "./Polygon"

@sealed
class Line extends GeomObject {
    #name = "Line"
    #uuid = util.uuid()

    #a: number = NaN
    #b: number = NaN
    #c: number = NaN

    constructor(owner: Geomtoy, a: number, b: number, c: number)
    constructor(o: Geomtoy, a1: number, a2: number, a3: number) {
        super(o)
        if (util.isNumber(a1) && util.isNumber(a2) && util.isNumber(a3)) {
            return Object.seal(util.assign(this, { a: a1, b: a2, c: a3 }))
        }

        throw new Error("[G]Arguments can NOT construct a `Line`.")
    }

    get name() {
        return this.#name
    }
    get uuid() {
        return this.#uuid
    }

    @is("realNumber")
    get a() {
        return this.#a
    }
    set a(value) {
        this.#a = value
        this.#guard()
    }
    @is("realNumber")
    get b() {
        return this.#b
    }
    set b(value) {
        this.#b = value
        this.#guard()
    }
    @is("realNumber")
    get c() {
        return this.#c
    }
    set c(value) {
        this.#c = value
    }

    /**
     * The angle between line `this` and the positive x-axis, the result is in the interval `(-Math.PI / 2, Math.PI / 2]`.
     */
    get angle(): number {
        let slope = this.slope
        return math.atan(slope)
    }
    /**
     * The slope of line `this`, the result is in the interval `(-Infinity, Infinity]`.
     * @description
     * If "b=0", line `this` is perpendicular to the x-axis, the slope is `Infinity`.
     */
    get slope(): number {
        let { a, b } = this,
            epsilon = this.owner.getOptions().epsilon
        if (math.equalTo(b, 0, epsilon)) return Infinity
        if (math.equalTo(a, 0, epsilon)) return 0
        return -(a / b)
    }
    /**
     * The y-intercept of line `this`, the result is in the interval `(-Infinity, Infinity]`.
     * @description
     * If "b=0", line `this` is perpendicular to the x-axis, the y-intercept is `Infinity`.
     */
    get yIntercept(): number {
        let { a, b, c } = this,
            epsilon = this.owner.getOptions().epsilon
        if (math.equalTo(b, 0, epsilon)) return Infinity
        if (math.equalTo(a, 0, epsilon)) return 0
        return -(c / b)
    }
    /**
     * The x-intercept of line `this`, the result is in the interval `(-Infinity, Infinity]`.
     * @description
     * If "a=0", line `this` is perpendicular to the y-axis, the x-intercept is `Infinity`.
     */
    get xIntercept(): number {
        let { a, b, c } = this,
            epsilon = this.owner.getOptions().epsilon
        if (math.equalTo(a, 0, epsilon)) return Infinity
        if (math.equalTo(b, 0, epsilon)) return 0
        return -(c / a)
    }

    #guard() {
        let { a, b } = this,
            epsilon = this.owner.getOptions().epsilon
        if (math.equalTo(a, 0, epsilon) && math.equalTo(b, 0, epsilon)) {
            throw new Error("[G]The `a` and `b` of a `Line` can NOT equal to 0 at the same time.")
        }
    }
    /**
     * Whether line `this` is the same as line `line`.
     * @param {Line} line
     * @returns {boolean}
     */
    @validateOwner
    isSameAs(line: Line): boolean {
        // If two lines "a1x+b1y+c1=0" and "a2x+b2y+c2=0" are identical then "a1/a2=b1/b2=c1/c2".
        // Use multiplication to avoid "a/b/c=0" situation.
        if (this === line) return true
        let { a: a1, b: b1, c: c1 } = this,
            { a: a2, b: b2, c: c2 } = line,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(a1 * b2, a2 * b1, epsilon) && math.equalTo(c1 * b2, c2 * b1, epsilon) && math.equalTo(a1 * c2, a2 * c1, epsilon)
    }

    static yAxis(owner: Geomtoy) {
        return new Line(owner, 1, 0, 0)
    }
    static xAxis(owner: Geomtoy) {
        return new Line(owner, 0, 1, 0)
    }
    static yEqualPositiveX(owner: Geomtoy) {
        return new Line(owner, -1, 1, 0)
    }
    static yEqualNegativeX(owner: Geomtoy) {
        return new Line(owner, 1, 1, 0)
    }

    /**
     * Determine a line from two points `point1` and `point2`.
     * @param {Point} point1
     * @param {Point} point2
     * @returns {Line}
     */
    @validateOwner
    static fromPoints(owner: Geomtoy, point1: Point, point2: Point): Line {
        if (point1.isSameAs(point2)) {
            throw new Error(`[G]The points \`point1\` and \`point2\` are the same, they can NOT determine a line.`)
        }
        let { x: x1, y: y1 } = point1,
            { x: x2, y: y2 } = point2,
            a = y2 - y1,
            b = x1 - x2,
            c = (x2 - x1) * y1 - (y2 - y1) * x1
        return new Line(owner, a, b, c)
    }
    /**
     * Determine a line from segment `segment`, it is the underlying line of the segment.
     * @param {Segment} segment
     * @returns {Line}
     */
    @validateOwner
    static fromSegment(owner: Geomtoy, segment: Segment): Line {
        return Line.fromPoints(owner, segment.point1, segment.point2)
    }
    /**
     * Determine a line from vector `vector` with initial point set to `Point.zero()`.
     * @param {Vector} vector
     * @returns {Line}
     */
    @validateOwner
    static fromVector(owner: Geomtoy, vector: Vector): Line {
        let { x, y } = vector
        return Line.fromPoints(owner, Point.zero(owner), new Point(owner, x, y))
    }
    /**
     * Determine a line from vector `vector` base on the initial and terminal point of it.
     * @param {Vector} vector
     * @returns {Line}
     */
    @validateOwner
    static fromVector2(owner: Geomtoy, vector: Vector): Line {
        return Line.fromPoints(owner, vector.point1, vector.point2)
    }
    /**
     * Determine a line from point `point` and vector `vector`.
     * @param {Point} point
     * @param {Vector} vector
     * @returns {Line}
     */
    @validateOwner
    static fromPointAndVector(owner: Geomtoy, point: Point, vector: Vector): Line {
        let { x, y } = vector
        return Line.fromPoints(owner, point, new Point(owner, x, y))
    }
    /**
     * Determine a line from point `point` and slope `slope`.
     * @param {Point} point
     * @param {number} slope
     * @returns {Line}
     */
    @validateOwner
    static fromPointAndSlope(owner: Geomtoy, point: Point, slope: number): Line {
        let { x, y } = point
        if (math.abs(slope) === Infinity) {
            let [a, b, c] = [1, 0, -x]
            return new Line(owner, a, b, c)
        }
        let [a, b, c] = [slope, -1, y - slope * x]
        return new Line(owner, a, b, c)
    }
    /**
     * Determine a line from point `point` and angle `angle`.
     * @param {Point} point
     * @param {number} angle
     * @returns {Line}
     */
    @validateOwner
    static fromPointAndAngle(owner: Geomtoy, point: Point, angle: number): Line {
        let slope = math.tan(angle)
        return Line.fromPointAndSlope(owner, point, slope)
    }
    /**
     * Determine a line from x-intercept `xIntercept` and y-intercept `yIntercept`.
     * @param {number} xIntercept
     * @param {number} yIntercept
     * @returns {Line}
     */
    static fromIntercepts(owner: Geomtoy, xIntercept: number, yIntercept: number): Line {
        if (math.abs(xIntercept) === Infinity && math.abs(yIntercept) === Infinity) {
            throw new Error("[G]When the `xIntercept` and `yIntercept` are `Infinity`, a line can NOT be determined.")
        }
        if (math.abs(xIntercept) === Infinity) {
            return Line.fromPointAndSlope(owner, new Point(owner, 0, yIntercept), 0)
        }
        if (math.abs(yIntercept) === Infinity) {
            return Line.fromPointAndSlope(owner, new Point(owner, xIntercept, 0), Infinity)
        }
        return Line.fromPoints(owner, new Point(owner, 0, yIntercept), new Point(owner, xIntercept, 0))
    }
    /**
     * Determine a line from slope `slope` and x-intercept `xIntercept`.
     * @param {number} slope
     * @param {number} xIntercept
     * @returns {Line}
     */
    static fromSlopeAndXIntercept(owner: Geomtoy, slope: number, xIntercept: number): Line {
        if (math.abs(slope) === Infinity && math.abs(xIntercept) === Infinity) {
            throw new Error("[G]When the `slope` and `xIntercept` are `Infinity`, a line can NOT be determined.")
        }
        return Line.fromPointAndSlope(owner, new Point(owner, xIntercept, 0), slope)
    }
    /**
     * Determine a line from slope `slope` and y-intercept `yIntercept`.
     * @param {number} slope
     * @param {number} yIntercept
     * @returns {Line}
     */
    static fromSlopeAndYIntercept(owner: Geomtoy, slope: number, yIntercept: number): Line {
        if (math.abs(slope) === Infinity || math.abs(yIntercept) === Infinity) {
            throw new Error("[G]When the `slope` or `yIntercept` is `Infinity`, a line can NOT be determined.")
        }
        return Line.fromPointAndSlope(owner, new Point(owner, 0, yIntercept), slope)
    }

    /**
     * Simplify line `this`, convert `b` to 1, if "b=0", convert `a` to 1.
     * @returns {Line}
     */
    simplify(): Line {
        return this.clone().simplifySelf()
    }
    simplifySelf() {
        let { a, b, c } = this,
            epsilon = this.owner.getOptions().epsilon,
            d = math.equalTo(b, 0, epsilon) ? a : b
        util.assign(this, { a: a / d, b: b / d, c: c / d })
        return this
    }

    /**
     * Get the point on line `this` where y is equal to `y`.
     * @param {number} y
     * @returns {Point | null}
     */
    getPointWhereYEqualTo(y: number): Point | null {
        let l = new Line(this.owner, 0, 1, -y),
            { a, b, c } = this
        if (this.isParallelToLine(l)) return null
        // "x=-(b/a)y-c/a" => "x=-(by+c)/a"
        return new Point(this.owner, -(b * y + c) / a, y)
    }
    /**
     * Get the point on line `this` where x is equal to `x`.
     * @param {number} x
     * @returns {Point | null}
     */
    getPointWhereXEqualTo(x: number): Point | null {
        let l = new Line(this.owner, 1, 0, -x),
            { a, b, c } = this
        if (this.isParallelToLine(l)) return null
        // "y=-(a/b)x-c/b" => "y=-(ax+c)/b"
        return new Point(this.owner, x, -(a * x + c) / b)
    }

    // #region Positional relationships of line to line
    // (IdenticalTo)
    // ParallelTo
    // PerpendicularTo
    // IntersectedWith
    /**
     * Whether line `this` is parallel(including identical) to line `line`.
     * @param {Line} line
     * @returns {boolean}
     */
    @validateOwner
    isParallelToLine(line: Line): boolean {
        // If two lines "a1x+b1y+c1=0" and "a2x+b2y+c2=0" are parallel(including identical) then
        // "k1=-(a1/b1)" and "k2=-(a2/b2)", "k1=k2", "a1b2=b1a2"
        if (this === line) return true
        let { a: a1, b: b1 } = this,
            { a: a2, b: b2 } = line,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(a1 * b2, a2 * b1, epsilon)
    }
    /**
     * Whether line `this` is perpendicular to line `line`.
     * @param {Line} line
     * @returns {boolean}
     */
    @validateOwner
    isPerpendicularToLine(line: Line): boolean {
        // If two lines "a1x+b1y+c1=0" and "a2x+b2y+c2=0" are perpendicular then
        // "k1=-(a1/b1)" and "k2=-(a2/b2)", "k1k2=-1", "a1a2=-b1b2"
        let { a: a1, b: b1 } = this,
            { a: a2, b: b2 } = line,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(a1 * a2, -b1 * b2, epsilon)
    }
    /**
     * Whether line `this` is intersected with line `line`.
     * @param {Line} line
     * @returns {boolean}
     */
    @validateOwner
    isIntersectedWithLine(line: Line): boolean {
        return !this.isParallelToLine(line)
    }
    /**
     * Get the intersection point with line `line`.
     * @param {Line} line
     * @returns {Point | null}
     */
    @validateOwner
    getIntersectionPointWithLine(line: Line): Point | null {
        if (this.isParallelToLine(line)) return null
        let { a: a1, b: b1, c: c1 } = this,
            { a: a2, b: b2, c: c2 } = line,
            //`m` will not be equal to 0, we call `isParallelToLine` already
            m = a1 * b2 - a2 * b1,
            x = (c2 * b1 - c1 * b2) / m,
            y = (c1 * a2 - c2 * a1) / m
        return new Point(this.owner, x, y)
    }
    // #endregion

    // #region Positional relationships of line to circle
    // IntersectedWith
    // TangentTo
    // SeparatedFrom
    /**
     * Whether line `this` is intersected with circle `circle`.
     * @param {Circle} circle
     * @returns {boolean}
     */
    @validateOwner
    isIntersectedWithCircle(circle: Circle): boolean {
        let epsilon = this.owner.getOptions().epsilon
        return math.lessThan(circle.centerPoint.getSquaredDistanceBetweenLine(this), circle.radius ** 2, epsilon)
    }
    /**
     * Get the intersection points of line `this` and circle `circle`.
     * @param {Circle} circle
     * @returns {[Point, Point] | null}
     */
    @validateOwner
    getIntersectionPointsWithCircle(circle: Circle): [Point, Point] | null {
        if (!this.isIntersectedWithCircle(circle)) return null
        let p0 = circle.centerPoint,
            r = circle.radius,
            p1 = this.getPerpendicularPointFromPoint(p0),
            sd = p0.getSquaredDistanceBetweenPoint(p1),
            d1i = math.sqrt(r ** 2 - sd),
            a = this.angle,
            ip1 = p1.moveAlongAngle(a, d1i),
            ip2 = p1.moveAlongAngle(a + Math.PI, d1i)
        return [ip1, ip2]
    }
    /**
     * Whether line `this` is tangent to circle `circle`.
     * @param {Circle} circle
     * @returns {boolean}
     */
    @validateOwner
    isTangentToCircle(circle: Circle): boolean {
        let epsilon = this.owner.getOptions().epsilon
        return math.equalTo(circle.centerPoint.getSquaredDistanceBetweenLine(this), circle.radius ** 2, epsilon)
    }
    /**
     * Get the tangency point of line `this` and circle `circle`.
     * @param {Circle} circle
     * @returns {Point | null}
     */
    @validateOwner
    getTangencyPointToCircle(circle: Circle): Point | null {
        if (!this.isTangentToCircle(circle)) return null
        return this.getPerpendicularPointFromPoint(circle.centerPoint)
    }
    /**
     * Whether line `this` is separated from circle `circle`.
     * @param {Circle} circle
     * @returns {boolean}
     */
    @validateOwner
    isSeparatedFromCircle(circle: Circle): boolean {
        let epsilon = this.owner.getOptions().epsilon
        return math.greaterThan(circle.centerPoint.getSquaredDistanceBetweenLine(this), circle.radius ** 2, epsilon)
    }
    // #endregion

    // #region Positional relationships of line to segment
    // ParallelTo
    // PerpendicularTo
    // CollinearWith
    // SeparatedFrom
    // IntersectedWith
    /**
     * Whether line `this` is parallel to segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isParallelToSegment(segment: Segment): boolean {
        /* 
        If `line` is parallel to `segment`, the signed distances of endpoints of `segment` between `line` are equal,
        and we can eliminate the denominator "sqrt(a^2+b^2)", just compare the numerator.
        */
        let { point1: p1, point2: p2 } = segment,
            { x: x1, y: y1 } = p1,
            { x: x2, y: y2 } = p2,
            { a, b } = this,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(a * x1 + b * y1, a * x2 + b * y2, epsilon)
    }
    /**
     * Whether line `this` is perpendicular to segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isPerpendicularToSegment(segment: Segment): boolean {
        /* 
        If `line` is perpendicular to `segment`, then `segment` should parallel to the line which is perpendicular to `line`.
        The perpendicular line of "y=-(a/b)x-(c/b)" is written as "y=(b/a)x-(c/b)", simplify it to "bx-ay=0".
        */
        let { point1: p1, point2: p2 } = segment,
            { x: x1, y: y1 } = p1,
            { x: x2, y: y2 } = p2,
            { a, b } = this,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(b * x1 - a * y1, b * x2 - a * y2, epsilon)
    }
    /**
     * Whether line `this` is collinear with segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isCollinearWithSegment(segment: Segment): boolean {
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = segment,
            { a, b, c } = this,
            epsilon = this.owner.getOptions().epsilon,
            s1 = math.strictSign(a * x1 + b * y1 + c, epsilon),
            s2 = math.strictSign(a * x2 + b * y2 + c, epsilon)
        return s1 === 0 && s2 === 0
    }
    /**
     * Whether line `this` is separated from segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isSeparatedFromSegment(segment: Segment): boolean {
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = segment,
            { a, b, c } = this,
            epsilon = this.owner.getOptions().epsilon,
            s1 = math.strictSign(a * x1 + b * y1 + c, epsilon),
            s2 = math.strictSign(a * x2 + b * y2 + c, epsilon)
        return s1 * s2 === 1
    }
    /**
     * Whether line `this` is intersected with segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isIntersectedWithSegment(segment: Segment): boolean {
        // If `line` is intersected with `segment`, the signed distance of endpoints of `segment` between `line` have different sign.
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = segment,
            { a, b, c } = this,
            epsilon = this.owner.getOptions().epsilon,
            s1 = math.strictSign(a * x1 + b * y1 + c, epsilon),
            s2 = math.strictSign(a * x2 + b * y2 + c, epsilon)
        return (s1 === 0) !== (s2 === 0) || s1 * s2 === -1
    }
    /**
     * Get the intersection point of line `this` and segment `segment`
     * @param {Segment} segment
     * @returns {Point | null}
     */
    getIntersectionPointWithSegment(segment: Segment): Point | null {
        if (!this.isIntersectedWithSegment(segment)) return null
        let w = segment.getLerpingRatioByLine(this),
            {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = segment,
            x = math.lerp(x1, x2, w),
            y = math.lerp(y1, y2, w)
        return new Point(this.owner, x, y)
    }

    /**
     * 是否与`矩形rectangle`相交
     * @param {Rectangle} rectangle
     * @returns {boolean | Array<Point>}
     */
    #isIntersectedWithPolygon(polygon: Polygon) {
        // let

        //     s1 = Segment.fromPoints(rectangle.getCornerPoint("leftTop"), rectangle, p2),
        //     s2 = Segment.fromPoints(rectangle.p2, rectangle.p3),
        //     s3 = Segment.fromPoints(rectangle.p3, rectangle.p4),
        //     s4 = Segment.fromPoints(rectangle.p4, rectangle.p1),
        //     ret1 = this.#isIntersectedWithSegment(s1),
        //     ret2 = this.#isIntersectedWithSegment(s2),
        //     ret3 = this.#isIntersectedWithSegment(s3),
        //     ret4 = this.#isIntersectedWithSegment(s4),
        //     //去掉相交于顶点出现重复的情况
        //     ret = _.uniqWith(_.compact([ret1, ret2, ret3, ret4]), (i, j) => i.isSameAs(j))

        // if (ret) return ret
        return false
    }
    isIntersectedWithPolygon(polygon: Polygon) {
        return Boolean(this.#isIntersectedWithPolygon(polygon))
    }
    getIntersectionPointWithPolygon(polygon: Polygon) {
        let ret = this.#isIntersectedWithPolygon(polygon)
        if (ret) return ret
        return null
    }

    /**
     * Find the perpendicular line of line `this` from point `point`.
     * @param {Point} point
     * @returns {Line}
     */
    getPerpendicularLineFromPoint(point: Point): Line {
        // If two line are perpendicular to each other, the slope multiplication is equal to -1
        let k1 = this.slope,
            k2 = k1 === Infinity ? 0 : k1 === 0 ? Infinity : -1 / k1
        return Line.fromPointAndSlope(this.owner, point, k2)
    }
    /**
     * Find the perpendicular point(the foot of the perpendicular) on line `this` from point `point`.
     * @description
     * If point `point` is on line `line`, return itself(cloned).
     * If point `point` is not on line `line`, return the perpendicular point.
     * @param {Point} point
     * @returns {Point}
     */
    @validateOwner
    getPerpendicularPointFromPoint(point: Point): Point {
        if (point.isOnLine(this)) return point.clone()
        let { a, b, c } = this,
            { x: x1, y: y1 } = point,
            d = -(a * x1 + b * y1 + c) / (a ** 2 + b ** 2),
            x2 = d * a + x1,
            y2 = d * b + y1
        return new Point(this.owner, x2, y2)
    }

    /**
     * 若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回null
     * @param {Line} line
     * @returns {number}
     */
    @validateOwner
    getDistanceToParallelLine(line: Line): number {
        if (!this.isParallelToLine(line)) return NaN
        let l1 = this,
            l2 = line
        return Math.abs(l1.c - l2.c) / Math.hypot(l1.a, l1.b)
    }

    /**
     * Get graphic object of `this`
     * @param {GraphicImplType} type
     * @returns {Array<SvgDirective | CanvasDirective>}
     */
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective> {
        let lowerBound = -this.owner.getOptions().graphic.lineRange,
            upperBound = this.owner.getOptions().graphic.lineRange,
            { a, b, c } = this,
            x1,
            x2,
            y1,
            y2
        //x=-(b/a)y-c/a
        //y=-(a/b)x-c/b
        if (this.b === 0) {
            y1 = lowerBound
            y2 = upperBound
            x1 = -(b / a) * y1 - c / a
            x2 = -(b / a) * y2 - c / a
        } else {
            x1 = lowerBound
            x2 = upperBound
            y1 = -(a / b) * x1 - c / b
            y2 = -(a / b) * x2 - c / b
        }
        let g = new Graphic()
        g.moveTo(x1, y1)
        g.lineTo(x2, y2)
        g.close()
        return g.valueOf(type)
    }
    @validateOwner
    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    clone() {
        return new Line(this.owner, this.a, this.b, this.c)
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\ta: ${this.a}`, 
            `\tb: ${this.b}`,
            `\tc: ${this.c}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [this.a, this.b, this.c]
    }
    toObject() {
        return { a: this.a, b: this.b, c: this.c }
    }
}

/**
 * 
 * @category GeomObject
 */
export default Line

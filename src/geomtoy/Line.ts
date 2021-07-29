import math from "./utility/math"
import type from "./utility/type"

import Point from "./Point"
import Segment from "./Segment"
import Graphic from "./graphic"
import Rectangle from "./Rectangle"
import Circle from "./Circle"
import { is, sealed } from "./decorator"
import GeomObject from "./base/GeomObject"
import { GraphicImplType } from "./types"
import Transformation from "./transformation"
import Vector from "./Vector"
import util from "./utility"

@sealed
class Line extends GeomObject {
    #a: number | undefined
    #b: number | undefined
    #c: number | undefined

    constructor(a: number, b: number, c: number)
    constructor(line: Line)
    constructor(a1: any, a2?: any, a3?: any) {
        super()
        if (type.isNumber(a1) && type.isNumber(a2) && type.isNumber(a3)) {
            this.#a = a1
            this.#b = a2
            this.#c = a3
            this.#guard()
            return Object.seal(this)
        }
        if (a1 instanceof Line) {
            return a1.clone()
        }
        throw new Error(`[G]Arguments can NOT construct a line.`)
    }

    @is("realNumber")
    get a() {
        return this.#a!
    }
    set a(value) {
        this.#a = value
        this.#guard()
    }
    @is("realNumber")
    get b() {
        return this.#b!
    }
    set b(value) {
        this.#b = value
        this.#guard()
    }
    @is("realNumber")
    get c() {
        return this.#c!
    }
    set c(value) {
        this.#c = value
    }

    #guard() {
        let epsilon = this.options.epsilon
        if (math.equalTo(this.#a!, 0, epsilon) && math.equalTo(this.#b!, 0, epsilon)) {
            throw new Error(`[G]The \`a\` and \`b\` of a line can NOT equal to 0 at the same time.`)
        }
    }

    isSameAs(line: Line) {
        // If two lines "a1x+b1y+c1=0" and "a2x+b2y+c2=0" are identical then
        // "a1/a2=b1/b2=c1/c2"
        // Use multiply to avoid "a/b/c=0" situation

        if (this === line) return true
        let { a: a1, b: b1, c: c1 } = this,
            { a: a2, b: b2, c: c2 } = line,
            epsilon = this.options.epsilon

        // If `a1 === a2 === 0`, check `c1 * b2 === c2 * b1` is `true`
        // If `b1 === b2 === 0`, check `a1 * c2 === a2 * c1` is `true`
        // If `c1 === c2 === 0`, check `a1 * b2 === a2 * b1` is `true`
        return math.equalTo(a1 * b2, a2 * b1, epsilon) && math.equalTo(c1 * b2, c2 * b1, epsilon) && math.equalTo(a1 * c2, a2 * c1, epsilon)
    }

    /**
     * Determine a line from two points `point1` and `point2`.
     * @param {Point} point1
     * @param {Point} point2
     * @returns {Line}
     */
    static fromPoints(point1: Point, point2: Point): Line {
        if (point1.isSameAs(point2)) {
            throw new Error(`[G]Points \`point1\` and \`point2\` are the same, they can NOT determine a line.`)
        }
        let { x: x1, y: y1 } = point1,
            { x: x2, y: y2 } = point2,
            a = y2 - y1,
            b = x1 - x2,
            c = (x2 - x1) * y1 - (y2 - y1) * x1
        return new Line(a, b, c)
    }
    /**
     * Get the line where the `segment` lies.
     * @param {Segment} segment
     * @returns {Line}
     */
    static fromSegment(segment: Segment): Line {
        return Line.fromPoints(segment.point1, segment.point2)
    }
    static fromVector(vector: Vector) {
        let { x, y } = vector
        return Line.fromPoints(Point.zero, new Point(x, y))
    }
    static fromVector2(vector: Vector) {
        return Line.fromPoints(vector.point1, vector.point2)
    }
    static fromPointAndVector(point:Point,vector:Vector){
        let { x, y } = vector
        return Line.fromPoints(point, new Point(x, y))
    }
    static fromPointAndSlope(point: Point, slope: number) {
        let { x, y } = point
        if (math.abs(slope) === Infinity) {
            let a = 1,
                b = 0,
                c = point.x
            return new Line(a, b, c)
        }
        let a = slope,
            b = -1,
            c = y - slope * x
        return new Line(a, b, c)
    }
    static fromPointAndAngle(point: Point, angle: number) {
        let slope = math.tan(angle)
        return Line.fromPointAndSlope(point, slope)
    }

    static fromIntercepts(interceptX: number, interceptY: number) {
        if (math.abs(interceptX) === Infinity && math.abs(interceptY) === Infinity) {
            throw new Error(`[G]It is impossible for a line to have infinite intercepts on both the x-axis and y-axis.`)
        }
        if (math.abs(interceptX) === Infinity) {
            return Line.fromPointAndSlope(new Point(0, interceptY), 0)
        }
        if (math.abs(interceptY) === Infinity) {
            return Line.fromPointAndSlope(new Point(interceptX, 0), Infinity)
        }
        return Line.fromPoints(new Point(0, interceptY), new Point(interceptX, 0))
    }

    static fromSlopeAndInterceptX(slope: number, interceptX: number) {
        if (math.abs(slope) === Infinity || math.abs(interceptX) === Infinity) {
            throw new Error(`[G]Provide values other than infinity for slope and interceptX.`)
        }
        return Line.fromPointAndSlope(new Point(interceptX, 0), slope)
    }
    static fromSlopeAndInterceptY(slope: number, interceptY: number) {
        if (math.abs(slope) === Infinity || math.abs(interceptY) === Infinity) {
            throw new Error(`[G]Provide values other than infinity for slope and interceptY.`)
        }
        return Line.fromPointAndSlope(new Point(0, interceptY), slope)
    }

    /**
     * Whether line `this` is parallel(including identical) to line `line`
     * @summary
     * If two lines "a1x+b1y+c1=0" and "a2x+b2y+c2=0" are parallel(including identical) then
     * "k1=-(a1/b1)" and "k2=-(a2/b2)", "k1=k2", "a1b2=b1a2"
     * @param {Line} line
     * @returns
     */
    isParallelToLine(line: Line) {
        if (this === line) return true
        let { a: a1, b: b1 } = this,
            { a: a2, b: b2 } = line,
            epsilon = this.options.epsilon
        if (math.equalTo(a1, 0, epsilon) && math.equalTo(a2, 0, epsilon)) return true
        if (math.equalTo(b1, 0, epsilon) && math.equalTo(b2, 0, epsilon)) return true
        return math.equalTo(a1 * b2, a2 * b1, epsilon)
    }
    /**
     * Whether line `this` is perpendicular to line `line`
     * @summary
     * If two lines "a1x+b1y+c1=0" and "a2x+b2y+c2=0" are perpendicular then
     * "k1=-(a1/b1)" and "k2=-(a2/b2)", "k1k2=-1", "a1a2=-b1b2"
     * @param {Line} line
     * @returns
     */
    isPerpendicularToLine(line: Line) {
        let { a: a1, b: b1 } = this,
            { a: a2, b: b2 } = line,
            epsilon = this.options.epsilon
        if (math.equalTo(a1, 0, epsilon) && math.equalTo(b2, 0, epsilon)) return true
        if (math.equalTo(b1, 0, epsilon) && math.equalTo(a2, 0, epsilon)) return true
        return math.equalTo(a1 * a2, -b1 * b2, epsilon)
    }
    simple() {
        return this.clone().simpleSelf()
    }
    simpleSelf() {
        //make `b` equal to `1`, if "b=0", make `a` equal to `1`
        let { a, b, c } = this,
            epsilon = this.options.epsilon
        if (math.equalTo(b, 0, epsilon)) {
            let d = a
            this.a = a / d
            this.b = b / d
            this.c = c / d
        }
        let d = b
        this.a = a / d
        this.b = b / d
        this.c = c / d
    }

    /**
     * Get the slope of line `this`
     * @summary
     * If "b=0", line `this` is "ax+c=0". It is perpendicular to the x-axis, the slope is `NaN` or `Infinity`
     * @returns {number}
     */
    getSlope(): number {
        let { a, b } = this,
            epsilon = this.options.epsilon
        if (math.equalTo(b, 0, epsilon)) return Infinity
        return -(a / b)
    }
    /**
     * Get the intercept on the y-axis of line `this`
     * @summary
     * If "b=0", line `this` is "ax+c=0". It is perpendicular to the x-axis, the intercept on the y-axis is `NaN` or `Infinity`
     * @returns {number}
     */
    getInterceptY(): number {
        let { b, c } = this,
            epsilon = this.options.epsilon
        if (math.equalTo(b, 0, epsilon)) return Infinity
        return -(c / b)
    }
    /**
     * Get the intercept on the x-axis of line `this`
     * @summary
     * If "a=0", line `this` is "by+c=0". It is perpendicular to the y-axis, the intercept on the x-axis is `NaN` or `Infinity`
     * @returns {number}
     */
    getInterceptX(): number {
        let { a, c } = this,
            epsilon = this.options.epsilon
        if (math.equalTo(a, 0, epsilon)) return Infinity
        return -(c / a)
    }

    getRandomPointOnLine() {
        // if (util.apxEqualsTo(this.b, 0)) {
        //     k = -(this.b / this.a) //ax+by+c = 0  x=(-by-c)/a  x=-(b/a)y-c/a
        //     b = -(this.c / this.a)
        //     let y = _.random(1000, true)
        //     x = -(b / a) * y - c / a
        // } else {
        //     k = -(this.a / this.b) //ax+by+c = 0  y=(-ax-c)/b  y=-(a/b)x-c/b
        //     b = -(this.c / this.b)
        //     let x = _.random(1000, true)
        //     y = -(a / b) * x - c / b
        // }
        // return new Point(x, y)
    }

    /**
     * 是否与`圆circle`相交
     * @param {Circle} circle
     * @returns {boolean | Array<Point>}
     */
    #isIntersectedWithCircle(circle: Circle) {
        if (circle.centerPoint.getDistanceBetweenLine(this) > circle.radius) {
            return false
        }
        let k: number,
            b: number,
            m = circle.cx,
            n = circle.cy,
            r = circle.radius

        if (math.equalTo(this.b, 0)) {
            k = -(this.b / this.a) //ax+by+c = 0  x=(-by-c)/a  x=-(b/a)y-c/a
            b = -(this.c / this.a)
            let aY = 1 + k ** 2,
                bY = 2 * k * (b - m) - 2 * n,
                cY = n ** 2 + (b - m) ** 2 - r ** 2,
                roots = math.quadraticRoots(aY, bY, cY)
            return util.map(roots, root => {
                return new Point(k * root + b, root)
            })
        } else {
            k = -(this.a / this.b) //ax+by+c = 0  y=(-ax-c)/b  y=-(a/b)x-c/b
            b = -(this.c / this.b)
            let aX = 1 + k ** 2,
                bX = 2 * k * (b - n) - 2 * m,
                cX = m ** 2 + (b - n) ** 2 - r ** 2,
                roots = math.quadraticRoots(aX, bX, cX)
            return util.map(roots, root => {
                return new Point(root, k * root + b)
            })
        }
    }
    isIntersectedWithCircle(circle: Circle) {
        return Boolean(this.#isIntersectedWithCircle(circle))
    }
    getIntersectionPointsWithCircle(circle: Circle) {
        let ret = this.#isIntersectedWithCircle(circle)
        if (ret) return ret
        return null
    }

    /**
     * 是否与`直线line`相交
     * @param {Line} line
     * @returns {boolean | Point}
     */
    #isIntersectedWithLine(line: Line) {
        let a1 = this.a,
            b1 = this.b,
            c1 = this.c,
            a2 = line.a,
            b2 = line.b,
            c2 = line.c,
            m = a1 * b2 - a2 * b1
        //两直线平行或重合
        if (m == 0) return false
        let x = (c2 * b1 - c1 * b2) / m,
            y = (c1 * a2 - c2 * a1) / m
        return new Point(x, y)
    }
    isIntersectedWithLine(line: Line) {
        return Boolean(this.#isIntersectedWithLine(line))
    }
    getIntersectionPointWithLine(line: Line) {
        let ret = this.#isIntersectedWithLine(line)
        if (ret) return ret
        return null
    }

    /**
     * 是否与`线段segment`相交
     * @param {Segment} segment
     * @returns {boolean | Point}
     */
    #isIntersectedWithSegment(segment: Segment) {
        let l = Line.fromSegment(segment),
            ret = this.#isIntersectedWithLine(l)
        if (ret && ret.isBetweenPoints(segment.point1, segment.point2)) return ret
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
     * 是否与`矩形rectangle`相交
     * @param {Rectangle} rectangle
     * @returns {boolean | Array<Point>}
     */
    #isIntersectedWithRectangle(rectangle: Rectangle) {
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
    isIntersectedWithRectangle(rectangle: Rectangle) {
        return Boolean(this.#isIntersectedWithRectangle(rectangle))
    }
    getIntersectionPointWithRectangle(rectangle: Rectangle) {
        let ret = this.#isIntersectedWithRectangle(rectangle)
        if (ret) return ret
        return null
    }

    getNormalLineAtPoint() {}

    /**
     * 过`直线this`上一点`点point`的垂线
     * @param {Point} point
     * @returns {Line}
     */
    getPerpendicularLineWithPointOn(point: Point) {
        if (!point.isOnLine(this)) return null
        let { a, b } = this,
            { x, y } = point,
            epsilon = this.options.epsilon

        if (math.equalTo(b, 0, epsilon)) {
            //ax+by+c = 0  x=-(b/a)y-c/a，斜率为-(b/a)，直线垂直斜率乘积为-1，故垂线：x-x0=a/b(y-y0)
            // bx-ay+ay0-bx0=0
            return new Line(b, -a, a * y - b * x)
        } else {
            //ax+by+c = 0  y=-(a/b)x-c/b，斜率为-(a/b)，直线垂直斜率乘积为-1，故垂线：y-y0=b/a(x-x0)
            // -bx+ay-ay0+bx0=0
            return new Line(-b, a, -a * y + b * x)
        }
    }

    /**
     * `直线this`外一点`点point`到`直线this`的垂点（垂足）
     * @param {Line} l
     * @returns {Point | null}
     */
    getPerpendicularPointWithPointNotOn(point: Point) {
        if (point.isOnLine(this)) return null

        let { a, b, c } = this,
            x0 = point.x,
            y0 = point.y,
            x,
            y
        x = (b ** 2 * x0 - a * b * y0 - a * c) / (a ** 2 + b ** 2)
        y = (-a * b * x0 + a ** 2 * y0 - b * c) / (a ** 2 + b ** 2)
        return new Point(x, y)
    }

    /**
     * 若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回null
     * @param {Line} line
     * @returns {number | null}
     */
    getDistanceToParallelLine(line: Line) {
        if (!this.isParallelToLine(line)) return null
        let l1 = this,
            l2 = line
        return Math.abs(l1.c - l2.c) / Math.hypot(l1.a, l1.b)
    }

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    getGraphic(type: GraphicImplType) {
        let lowerBound = -this.options.graphic.lineRange,
            upperBound = this.options.graphic.lineRange,
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
        let p1 = new Point(x1, y1),
            p2 = new Point(x2, y2),
            g = new Graphic()
        g.moveTo(x1, y1)
        g.lineTo(x2, y2)
        g.close()
        return g.valueOf(type)
    }

    flatten() {
        return this
    }

    clone() {
        return new Line(this.a, this.b, this.c)
    }
    toArray() {
        return [this.a, this.b, this.c]
    }
    toObject() {
        return { a: this.a, b: this.b, c: this.c }
    }
    toString() {
        return `Line(${this.a}, ${this.b}, ${this.c})`
    }
}

export default Line

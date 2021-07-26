import _ from "lodash"
import util from "./utility"
import Point from "./Point"
import Matrix from "./transformation/Matrix"
import Segment from "./Segment"
import Graphic from "./graphic"
import Rectangle from "./Rectangle"
import Circle from "./Circle"
import { is } from "./decorator"
import GeomObject from "./base/GeomObject"
import { GraphicImplType, RsPointToLine } from "./types"
import Transformation from "./transformation"
import Vector from "./Vector"

class Line extends GeomObject {
    #a: number | undefined
    #b: number | undefined
    #c: number | undefined

    constructor(a: number, b: number, c: number)
    constructor(line: Line)
    constructor(a1: any, a2?: any, a3?: any) {
        super()
        if (_.isNumber(a1) && _.isNumber(a2) && _.isNumber(a3)) {
            Object.seal(Object.assign(this, { a: a1, b: a2, c: a3 }))
            return this
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
        if (this.a === 0 && this.b === 0) {
            throw new Error(`[G]The \`a\` and \`b\` of a line can NOT equal to 0 at the same time.`)
        }
    }

    isSameAs(line: Line) {
        if (this === line) return true
        if (util.apxEqualsTo(this.a, line.a) && util.apxEqualsTo(this.b, line.b) && util.apxEqualsTo(this.c, line.c)) return true
        return false
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
        return this.fromPoints(segment.p1, segment.p2)
    }

    static fromPointAndAngle(point: Point, angle: number) {
        let pointP = point.walk(angle, 100)
        return Line.fromPoints(point, pointP)
    }
    static fromPointAndSlope(point:Point,slope:number){

    }

    static fromVector(vector:Vector) {
        return Line.fromPoints(vector.point1, vector.point2)
    }

    static fromIntercepts(interceptX:number,interceptY:number) {
        if(interceptX === NaN) {

        }
        if(interceptY === NaN){


        }        
    }
    
    static fromSlopeAndInterceptX(slope : number, interceptX:number) {


    }
    static fromSlopeAndInterceptY(slope : number, interceptY:number) {

    }
    

    /**
     * `直线this`的斜率
     * @returns {number}
     */
    getSlope(): number {
        //ax+c = 0 垂直于x轴的直线，与x轴的夹角为Math.PI / 2, 斜率无穷大或不存在（Math.tan(Math.PI / 2)的结果有bug）
        if (util.apxEqualsTo(this.b, 0)) return NaN
        return -(this.a / this.b)
    }
    /**
     * `直线this`的截距
     * @returns {number}
     */
    getInterceptY(): number {
        //ax+c = 0 垂直于x轴的直线，不与y轴相交，截距无穷大或不存在
        if (util.apxEqualsTo(this.b, 0)) return NaN
        return -(this.c / this.b)
    }
    /**
     * 
     * @returns {number}
     */
    getInterceptX(): number {
        //by+c = 0 垂直于y轴的直线，不与x轴相交，截距无穷大或不存在
        if (util.apxEqualsTo(this.a, 0)) return NaN
        return -(this.c / this.a)
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

        if (util.apxEqualsTo(this.b, 0)) {
            k = -(this.b / this.a) //ax+by+c = 0  x=(-by-c)/a  x=-(b/a)y-c/a
            b = -(this.c / this.a)
            let aY = 1 + k ** 2,
                bY = 2 * k * (b - m) - 2 * n,
                cY = n ** 2 + (b - m) ** 2 - r ** 2,
                roots = util.solveQuadraticEquation(aY, bY, cY)
            return _.map(roots, root => {
                return new Point(k * root + b, root)
            })
        } else {
            k = -(this.a / this.b) //ax+by+c = 0  y=(-ax-c)/b  y=-(a/b)x-c/b
            b = -(this.c / this.b)
            let aX = 1 + k ** 2,
                bX = 2 * k * (b - n) - 2 * m,
                cX = m ** 2 + (b - n) ** 2 - r ** 2,
                roots = util.solveQuadraticEquation(aX, bX, cX)
            return _.map(roots, root => {
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
        if (ret && ret.isBetweenPoints(segment.p1, segment.p2)) return ret
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
        if (point.getRelationshipToLine(this) & RsPointToLine.NotOn) return null
        let a = this.a,
            b = this.b,
            c = this.c,
            x0 = point.x,
            y0 = point.y

        if (util.apxEqualsTo(this.b, 0)) {
            //ax+by+c = 0  x=-(b/a)y-c/a，斜率为-(b/a)，直线垂直斜率乘积为-1，故垂线：x-x0=a/b(y-y0)
            // bx-ay+ay0-bx0=0
            return new Line(b, -a, a * y0 - b * x0)
        } else {
            //ax+by+c = 0  y=-(a/b)x-c/b，斜率为-(a/b)，直线垂直斜率乘积为-1，故垂线：y-y0=b/a(x-x0)
            // -bx+ay-ay0+bx0=0
            return new Line(-b, a, -a * y0 + b * x0)
        }
    }

    /**
     * `直线this`外一点`点point`到`直线this`的垂点（垂足）
     * @param {Line} l
     * @returns {Point | null}
     */
    getPerpendicularPointWithPointNotOn(point: Point) {
        if (point.getRelationshipToLine(this) & RsPointToLine.On) return null

        let a = this.a,
            b = this.b,
            c = this.c,
            x0 = point.x,
            y0 = point.y,
            x,
            y
        x = (b ** 2 * x0 - a * b * y0 - a * c) / (a ** 2 + b ** 2)
        y = (-a * b * x0 + a ** 2 * y0 - b * c) / (a ** 2 + b ** 2)
        return new Point(x, y)
    }

    /**
     * `直线this`与`直线line`是否平行（包括重合）
     * @param {Line} line
     * @returns
     */
    isParallelToLine(line: Line) {
        if (this.b === 0 && line.b === 0) return true
        if (this.a === 0 && line.a === 0) return true
        return util.apxEqualsTo(this.a * line.b, this.b * line.a)
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

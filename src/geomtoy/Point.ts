import _ from "lodash"
import Vector from "./Vector"
import Size from "./Size"
import Segment from "./Segment"
import Line from "./Line"
import utility from "./utility"
import { AnglePositive, Coordinate } from "./types"
import G from "."
import Circle from "./Circle"
import Graphic from "./graphic"
import { GraphicImplType } from "./types"
import Matrix from "./transformation/Matrix"
import GeomObjectD0 from "./base/GeomObjectD0"

class Point extends GeomObjectD0 {
    x!: number
    y!: number
    transformation!: Matrix

    constructor(x: number, y: number)
    constructor(coordinate: Coordinate)
    constructor(point: Point)
    constructor(vector: Vector)
    constructor()
    constructor(x?: any, y?: any) {
        super()
        if (_.isNumber(x) && _.isNumber(y)) {
            Object.assign(this, { x, y })
            return this
        }

        if (utility.type.isCoordinate(x)) {
            Object.assign(this, { x: x[0], y: x[1] })
            return this
        }

        if (x instanceof Point) {
            return x.clone()
        }

        if (x instanceof Vector) {
            return Point.fromVector(x)
        }
        this.transformation = Matrix.identity
        return Point.zero
    }

    static fromVector(vector: Vector): Point {
        return new Point(vector.x + vector.initial.x, vector.y + vector.initial.y)
    }

    static fromSize(size: Size): Point {
        return new Point(size.width, size.height)
    }

    static get zero(): Point {
        return new Point(0, 0)
    }

    isSameAs(point: Point): boolean {
        if (point === this) return true
        return utility.apxEqualsTo(this.x, point.x) && utility.apxEqualsTo(this.y, point.y)
    }

    done() {}
    /**
     * 按照给出的角和距离进行移动
     * @param {Number} angle 移动方向，与x轴正方向逆时针/顺时针旋转的角
     * @param {Number} distance 移动距离
     * @returns {Point}
     */
    goTo(angle: number, distance: number): Point {
        return this.clone().goToO(angle, distance)
    }
    goToO(angle: number, distance: number): Point {
        if (G.options.anglePositive === AnglePositive.Clockwise) {
            angle = utility.angle.reverse(angle) // or switch the cos and sin call below
        }
        this.x = this.x + distance * Math.cos(angle)
        this.y = this.y + distance * Math.sin(angle)
        return this
    }

    /**
     * 求出`点this`到`点p`之间的距离
     * @param {Point} p
     * @returns {number}
     */
    getDistanceFromPoint(p: Point): number {
        let a = this,
            b = p,
            d = Math.hypot(a.x - b.x, a.y - b.y)
        return utility.apxEqualsTo(d, 0) ? 0 : d
    }
    /**
     * 求出`点this`到`点p`之间的距离的平方
     * @param {Point} point
     * @returns {number}
     */
    getDistanceSquareFromPoint(point: Point): number {
        let a = this,
            b = point,
            d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2
        return utility.apxEqualsTo(d, 0) ? 0 : d
    }

    /**
     * 求出`点this`到`直线l`之间的距离
     * @param {Line} l
     * @returns {number}
     */
    getDistanceToLine(l: Line): number {
        return Math.abs(this.getSignedDistanceToLine(l))
    }

    /**
     * 求出`点this`到`直线l`之间的带符号距离
     * @param {Line} l
     * @returns {number}
     */
    getSignedDistanceToLine(l: Line): number {
        let a = l.a,
            b = l.b,
            c = l.c,
            x0 = this.x,
            y0 = this.y
        return (a * x0 + b * y0 + c) / Math.hypot(a, b)
    }

    /**
     * 判断`点this`是否在由`点p1`和`点p2`为对角线的假想矩形内，`点this`的坐标不会大于`点p1`和`点p2`中的最大值，且也不会小于最小值
     * @param {Point} p1
     * @param {Point} p2
     * @param {boolean} allowedOn 是否允许在矩形的上
     * @returns {boolean}
     */
    isBetweenPoints(p1: Point, p2: Point, allowedOn: boolean = true): boolean {
        let x1 = p1.x,
            y1 = p1.y,
            x2 = p2.x,
            y2 = p2.y,
            arrX = _.sortBy([x1, x2]),
            arrY = _.sortBy([y1, y2])

        if (allowedOn) {
            return !utility.defLessThan(this.x, arrX[0]) && !utility.defGreaterThan(this.x, arrX[1]) && !utility.defLessThan(this.y, arrY[0]) && !utility.defGreaterThan(this.y, arrY[1])
        }
        return utility.defGreaterThan(this.x, arrX[0]) && utility.defLessThan(this.x, arrX[1]) && utility.defGreaterThan(this.y, arrY[0]) && utility.defLessThan(this.y, arrY[1])
    }

    /**
     * `点this`是否在`直线l`上
     * @param {Line} l
     * @returns {boolean}
     */
    isOnLine(l: Line): boolean {
        return utility.apxEqualsTo(l.a * this.x + l.b * this.y + l.c, 0)
    }
    /**
     * `点this`是否在`线段s`上
     * @param {Segment} s
     * @returns {boolean}
     */
    isOnSegment(s: Segment): boolean {
        let p0 = this,
            p1 = s.p1,
            p2 = s.p2,
            v1 = new Vector(p1, p2),
            v2 = new Vector(p1, p0)
        return utility.apxEqualsTo(v1.crossProduct(v2), 0) && this.isBetweenPoints(p1, p2)
    }

    isAnEndpointOfSegment(s: Segment): boolean {
        return this.isSameAs(s.p1) || this.isSameAs(s.p2)
    }

    isOnCircle(circle: Circle) {
        return utility.apxEqualsTo(this.getDistanceSquareFromPoint(new Point(circle.cx, circle.cy)), circle.radius ** 2)
    }
    isInsideCircle(circle: Circle) {
        return utility.defLessThan(this.getDistanceSquareFromPoint(new Point(circle.cx, circle.cy)), circle.radius ** 2)
    }
    isOutsideCircle(circle: Circle) {
        return utility.defGreaterThan(this.getDistanceSquareFromPoint(new Point(circle.cx, circle.cy)), circle.radius ** 2)
    }

    getGraphic(type: GraphicImplType) {
        let x = this.x,
            y = this.y,
            g = new Graphic()
        g.moveTo(x, y)
        g.centerArcTo(x, y, G.options.graphic.pointSize, G.options.graphic.pointSize, 0, 2 * Math.PI, 0)
        g.close()
        return g.valueOf(type)
    }
    clone() {
        return new Point(this)
    }
    toArray() {
        return [this.x, this.y]
    }
    toObject() {
        return { x: this.x, y: this.y }
    }
    toString() {
        return `Point(x:${this.x}, y:${this.y})`
    }
}

export default Point

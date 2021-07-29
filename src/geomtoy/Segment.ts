import type from "./utility/type"
import math from "./utility/math"
import vec2 from "./utility/vec2"

import Point from "./Point"
import Vector from "./Vector"
import Line from "./Line"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import { GraphicImplType, SvgDirective, CanvasDirective, Coordinate } from "./types"
import { is, sealed } from "./decorator"
import util from "./utility"

@sealed
class Segment extends GeomObject {
    #point1: Point | undefined
    #point2: Point | undefined

    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number)
    constructor(point1Position: Coordinate | Point, point2Position: Coordinate | Point)
    constructor(a1: any, a2: any, a3?: any, a4?: any) {
        super()
        if (type.isNumber(a1) && type.isNumber(a2) && type.isNumber(a3) && type.isNumber(a4)) {
            let p1 = new Point(a1, a2),
                p2 = new Point(a3, a4)
            this.#point1 = p1
            this.#point2 = p2
            this.#guard()
            return Object.seal(this)
        }
        if ((type.isCoordinate(a1) || a1 instanceof Point) && (type.isCoordinate(a2) || a2 instanceof Point)) {
            let p1 = new Point(a1),
                p2 = new Point(a2)
            this.#point1 = p1
            this.#point2 = p2
            this.#guard()
            return Object.seal(this)
        }
        throw new Error(`[G]Arguments can NOT construct a segment.`)
    }

    @is("point")
    get point1() {
        return this.#point1!
    }
    set point1(value) {
        this.#point1 = value
        this.#guard()
    }
    @is("point")
    get point2() {
        return this.#point2!
    }
    set point2(value) {
        this.#point2 = value
        this.#guard()
    }

    #guard() {
        if (this.#point1!.isSameAs(this.#point2!)) {
            throw new Error(`[G]The two endpoints of a segment must be distinct.`)
        }
    }

    static fromPoints(point1: Point, point2: Point) {
        return new Segment(point1, point2)
    }

    isSameAs(segment: Segment) {
        let { point1: ap1, point2: ap2 } = this,
            { point1: bp1, point2: bp2 } = segment

        return (ap1.isSameAs(bp1) && ap2.isSameAs(bp2)) || (ap1.isSameAs(bp2) && ap2.isSameAs(bp1))
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
     * Whether segment `this` is perpendicular to segment `segment`,
     * regardless of whether they intersect,
     * the angle between them is `Math.PI / 2`
     * @param {Segment} segment
     * @returns {boolean}
     */
    isPerpendicularWithSegment(segment: Segment): boolean {
        let { point1: ap1, point2: ap2 } = this,
            { point1: bp1, point2: bp2 } = segment,
            va = vec2.from(ap1.getCoordinate(), ap2.getCoordinate()),
            vb = vec2.from(bp1.getCoordinate(), bp2.getCoordinate()),
            dp = vec2.dot(va, vb),
            epsilon = this.options.epsilon
        return math.equalTo(dp, 0, epsilon)
    }
    /**
     * Whether segment `this` is parallel to segment `segment`,
     * regardless of whether they are collinear or even the same,
     * the angle between them is `0` or `Math.PI`
     * @param {Segment} segment
     * @returns {boolean}
     */
    isParallelToSegment(segment: Segment): boolean {
        let { point1: ap1, point2: ap2 } = this,
            { point1: bp1, point2: bp2 } = segment,
            va = vec2.from(ap1.getCoordinate(), ap2.getCoordinate()),
            vb = vec2.from(bp1.getCoordinate(), bp2.getCoordinate()),
            cp = vec2.cross(va, vb),
            epsilon = this.options.epsilon
        return math.equalTo(cp, 0, epsilon)
    }


    /**
     * `线段this`与`线段s`是否共线，无论是否相接乃至相同
     * @param {Segment} segment
     * @returns {boolean}
     */
    isCollinearToSegment(segment: Segment): boolean {
        let { point1: ap1, point2: ap2 } = this,
            { point1: bp1, point2: bp2 } = segment,
            va = vec2.from(ap1.getCoordinate(), ap2.getCoordinate()),
            vb = vec2.from(bp1.getCoordinate(), bp2.getCoordinate()),
            vc = vec2.from(bp1.getCoordinate(), ap2.getCoordinate()),
            cp1 = vec2.cross(va, vb),
            cp2 = vec2.cross(vc, vb),
            epsilon = this.options.epsilon
        return math.equalTo(cp1, 0, epsilon) && math.equalTo(cp2, 0, epsilon)
    }
    /**
     * `线段this`与`线段s`是否相接，即有且只有一个端点被共用(若两个共用则相同)，无论夹角为多少
     * @param {Segment} segment
     * @returns {boolean | Point} 接点
     */
    isJointedWithSegment(segment: Segment): boolean {
        let { point1: ap1, point2: ap2 } = this,
            { point1: bp1, point2: bp2 } = segment,
            d1 = ap1.isSameAs(bp1),
            d2 = ap2.isSameAs(bp2),
            d3 = ap1.isSameAs(bp2),
            d4 = ap2.isSameAs(bp1)
        return d1 !== d2 || d3 !== d4
    }
    getJointPointWithSegment(segment: Segment) {
        if (!this.isJointedWithSegment(segment)) return null
        let { point1: ap1, point2: ap2 } = this,
            { point1: bp1, point2: bp2 } = segment
        if (ap1.isSameAs(bp1) || ap1.isSameAs(bp2)) {
            return ap1
        } else {
            return ap2
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
        if (arrP.length == 2) return new Segment(arrP[0], arrP[1])

        return false
    }
    isOverlappedWithSegment(segment:Segment) {
        return Boolean(this.#isOverlappedWithSegment(segment))
    }
    getOverlapSegmentWithSegment(segment:Segment) {
        let ret = this.#isOverlappedWithSegment(segment)
        if (ret) return ret
        return null
    }
    /**
     * `线段this`与`线段s`是否相交，相交不仅要求有且仅有一个点重合，且要求夹角不等于0或者Math.PI
     * 包含了不共线的相接和线段的端点在另一个线段上的特殊情况
     * @param {Segment} segment
     * @returns {boolean | Point} 交点
     */
    #isIntersectedWithSegment(segment:Segment) {
        if (this.isParallelToSegment(segment)) return false //相交的前提是不平行

        let v1 = new Vector(this.point1, this.point2),
            v2 = new Vector(segment.point1, segment.point2),
            v3 = new Vector(this.point1, segment.point1),
            cp1 = v1.crossProduct(v2),
            cp2 = v3.crossProduct(v2),
            cp3 = v3.crossProduct(v1)

        if (math.equalTo(cp1, 0))  return false 
        let t1 = cp3 / cp1,
            t2 = cp2 / cp1
        if (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) {
            return Point.fromVector(new Vector(this.point1).add(v1.scalarMultiply(t2)))
        }
        return false
    }

    isIntersectedWithSegment(segment:Segment) {
        return Boolean(this.#isIntersectedWithSegment(segment))
    }
    getIntersectionPointWithSegment(segment:Segment) {
        let ret = this.#isIntersectedWithSegment(segment)
        if (ret) return ret
        return null
    }

    getMiddlePoint() {
        let { x: x1, y: y1 } = this.point1,
            { x: x2, y: y2 } = this.point2
        return new Point((x1 + x2) / 2, (y1 + y2) / 2)
    }

    /**
     * 获得从线段起点开始的lambda定比分点P
     * @description 当P为内分点时，lambda > 0；当P为外分点时，lambda < 0 && lambda !== -1；当P与A重合时，lambda === 0,当P与B重合时，lambda===1
     * @param {number} lambda
     * @returns {Point}
     */
    getInterpolatePoint(lambda: number): Point {
        if (lambda === -1) throw new Error(`[G]Can NOT divide \`Segment\` by -1.`)
        let x = (this.point1.x + lambda * this.point2.x) / (1 + lambda),
            y = (this.point1.y + lambda * this.point2.y) / (1 + lambda)
        return new Point(x, y)
    }

    /**
     * `直线l`分线段成两部分之间的比例
     * @param {Line} l
     * @returns {number}
     */
    getDivisionRatioByLine(l: Line): number {
        return -(l.a * this.point1.x + l.b * this.point1.y + l.c) / (l.a * this.point2.x + l.b * this.point2.y + l.c)
    }

    /**
     * `线段this`与x轴正方向的夹角，范围[-Math.PI, Math.PI]
     * @returns {number}
     */
    getAngle(): number {
        return vec2.angle(vec2.from(this.point1.getCoordinate(), this.point2.getCoordinate()))
    }

    

    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[] {
        throw new Error("Method not implemented.")
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

export default Segment

import vec2 from "./utility/vec2"
import type from "./utility/type"
import angle from "./utility/angle"
import math from "./utility/math"

import Point from "./Point"
import Segment from "./Segment"
import { CanvasDirective, Coordinate, GraphicImplType, SvgDirective } from "./types"
import GeomObject from "./base/GeomObject"
import Graphic from "./graphic"
import { is, sealed } from "./decorator"
import Transformation from "./transformation"

@sealed
class Vector extends GeomObject {
    #x: number | undefined
    #y: number | undefined
    #point1: Point | undefined

    constructor(x: number, y: number)
    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number)
    constructor(position: Coordinate | Point | Vector)
    constructor(point1Position: Coordinate | Point | Vector, point2Position: Coordinate | Point | Vector)
    constructor()
    constructor(a1?: any, a2?: any, a3?: any, a4?: any) {
        super()
        if (type.isNumber(a1) && type.isNumber(a2)) {
            if (type.isNumber(a3) && type.isNumber(a4)) {
                let [x, y] = vec2.from([a1, a2], [a3, a4])
                return Object.seal(Object.assign(this, { point1: new Point(a1, a2), x, y }))
            }
            return Object.seal(Object.assign(this, { point1: Point.zero, x: a1, y: a2 }))
        }

        if (type.isCoordinate(a1) || a1 instanceof Point || a1 instanceof Vector) {
            if (type.isCoordinate(a2) || a2 instanceof Point || a2 instanceof Vector) {
                let p1 = new Point(a1),
                    p2 = new Point(a2),
                    [x, y] = vec2.from(p1.getCoordinate(), p2.getCoordinate())
                return Object.seal(Object.assign(this, { point1: p1, x, y }))
            }

            if (!(a1 instanceof Vector)) {
                let p = new Point(a1),
                    { x, y } = p
                return Object.seal(Object.assign(this, { point1: Point.zero, x, y }))
            }
            return a1.clone()
        }
        return Vector.zero
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
    /**
     * Initial point of vector `this`, usually `Point.zero`
     */
    @is("point")
    get point1() {
        return this.#point1!
    }
    set point1(value) {
        this.#point1 = value
    }
    /**
     * Terminal point of vector `this`
     */
    get point2() {
        let { x: x1, y: y1 } = this.#point1!,
            x = this.#x!,
            y = this.#y!,
            [x2, y2] = vec2.add([x1, y1], [x, y])
        return new Point([x2, y2])
    }
    get angle() {
        if (this.isZero()) return NaN
        return angle.simplify(vec2.angle(this.getCoordinate()))
    }
    get magnitude(): number {
        if (this.isZero()) return 0
        return vec2.magnitude(this.getCoordinate())
    }

    static get zero() {
        return new Vector(0, 0)
    }

    static fromPoint(point: Point): Vector {
        return new Vector(point)
    }
    static fromPoints(point1: Point, point2: Point): Vector {
        return new Vector(point1, point2)
    }
    static fromAngleAndMagnitude(angle: number, magnitude: number): Vector {
        let x = magnitude * Math.cos(angle),
            y = magnitude * Math.sin(angle)
        return new Vector(x, y)
    }
    static fromSegment(segment: Segment, reverse = false) {
        return reverse ? new Vector(segment.point2, segment.point1) : new Vector(segment.point1, segment.point2)
    }

    /**
     * Whether vector `this` is `Vector.zero`
     * @returns {boolean}
     */
    isZero(): boolean {
        let { x, y } = this,
            epsilon = this.options.epsilon
        return math.equalTo(x, 0, epsilon) && math.equalTo(y, 0, epsilon)
    }
    /**
     * Whether vector `this` is the same as vector `vector`, if they are all initialized from `Point.zero`
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs(vector: Vector): boolean {
        if (this.isZero() && vector.isZero()) return true
        if (this === vector) return true
        let epsilon = this.options.epsilon
        return math.equalTo(this.x, vector.y, epsilon) && math.equalTo(this.y, vector.y, epsilon)
    }
    /**
     * Whether vector `this` is the same as vector `vector`, including the initial point 
     * @param {Vector} vector 
     * @returns {boolean}
     */
    isSameAs2(vector: Vector): boolean {
        if (this === vector) return true
        return this.point1.isSameAs(vector.point1) && this.isSameAs(vector)
    }
    /**
     * Whether the angle of vector `this` is the same as vector `vector`
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAngleAs(vector: Vector): boolean {
        if (this.isZero() && vector.isZero()) return true
        if (this === vector) return true
        let epsilon = this.options.epsilon
        return math.equalTo(this.angle, vector.angle, epsilon)
    }
    isSameMagnitudeAs(vector: Vector) {
        if (this.isZero() && vector.isZero()) return true
        if (this === vector) return true
        let epsilon = this.options.epsilon
        return math.equalTo(this.magnitude, vector.magnitude, epsilon)
    }

    /**
     * Angle from vector `this` to vector `vector`, in "(-Math.PI,Math.PI]"
     * @param {Vector} vector
     * @returns {number}
     */
    angleTo(vector: Vector): number {
        return angle.simplify2(this.angle - vector.angle)
    }

    /**
     * `向量this`到`向量v`的角差（另一种实现），记作theta，(-Math.PI, Math.PI]
     * @param {Vector} v
     * @returns {number}
     */
    #angleToAnotherImpl(vector: Vector): number {
        if (this.isZero() || vector.isZero()) return NaN
        let dotProduct = this.dotProduct(vector),
            crossProduct = this.crossProduct(vector),
            cosTheta = dotProduct / (this.magnitude * vector.magnitude),
            a = Math.acos(cosTheta) //Math.acos，[0, Math.PI]

        //点乘与夹角范围：
        //dp>0      投影为正，夹角[0, Math.PI/2)
        //dp==0     投影为0，夹角为Math.PI/2，正交
        //dp<0      投影为负，夹角(Math.PI/2,Math.PI]

        //利用叉乘来确定符号，注意叉乘参数有顺序之别
        //cp>0      法向量大于0，`向量this`到`向量v`的正旋角 (0, Math.PI)
        //cp==0     法向量为0，`向量this`到`向量v`的正旋角 0或Math.PI
        //cp<0      法向量小于0，`向量this`到`向量v`的正旋角 (Math.PI, 2*Math.PI)
        if (crossProduct < 0) a = -a //此处已经是正旋角，无论正旋角定义为顺时针还是逆时针都一样
        return angle.simplify2(a)
    }

    simplify() {
        return this.clone().simplifySelf()
    }
    simplifySelf() {
        this.point1 = Point.zero
    }

    dotProduct(vector: Vector): number {
        return vec2.dot(this.getCoordinate(), vector.getCoordinate())
    }
    crossProduct(vector: Vector): number {
        return vec2.cross(this.getCoordinate(), vector.getCoordinate())
    }
    normalize(): Vector {
        return new Vector(vec2.normalize(this.getCoordinate()))
    }
    add(vector: Vector): Vector {
        return new Vector(vec2.add(this.getCoordinate(), vector.getCoordinate()))
    }
    subtract(vector: Vector): Vector {
        return new Vector(vec2.subtract(this.getCoordinate(), vector.getCoordinate()))
    }
    scalarMultiply(scalar: number): Vector {
        return new Vector(vec2.scalarMultiply(this.getCoordinate(), scalar))
    }
    negative() {
        return new Vector(vec2.negative(this.getCoordinate()))
    }
    rotate(angle: number): Vector {
        return new Vector(vec2.rotate(this.getCoordinate(), angle))
    }
    clone() {
        return new Vector(this.point1, this.getCoordinate())
    }
    getCoordinate(): Coordinate {
        return [this.x, this.y]
    }

    apply(transformation: Transformation) {
        return transformation.get().transformVector(this)
    }

    //todo
    /**
     * Get graphic object of `this`
     * @param {GraphicImplType} type
     * @returns {Array<SvgDirective | CanvasDirective>}
     */
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective> {
        let p1 = this.point1,
            { x: x1, y: y1 } = p1,
            p2 = this.point2,
            { x: x2, y: y2 } = p2,
            g = new Graphic()

        g.moveTo(x1, y1)
        g.lineTo(x2, y2)
        // g.centerArcTo(x, y, Vector.options.graphic.pointSize, Vector.options.graphic.pointSize, 0, 2 * Math.PI, 0)
        // g.close()
        return g.valueOf(type)
    }
    toArray() {
        return []
    }
    toObject() {
        return {}
    }
    toString() {
        return ""
    }
}

export default Vector

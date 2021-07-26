import Point from "./Point"
import Segment from "./Segment"
import util from "./utility"
import _ from "lodash"
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
        if (_.isNumber(a1) && _.isNumber(a2)) {
            if (_.isNumber(a3) && _.isNumber(a4)) {
                let [x, y] = util.vector.subtract([a3, a4], [a1, a2])
                Object.seal(Object.assign(this, { point1: new Point(a1, a2), x, y }))
                return this
            }
            Object.seal(Object.assign(this, { point1: Point.zero, x: a1, y: a2 }))
            return this
        }

        if (util.type.isCoordinate(a1) || a1 instanceof Point || a1 instanceof Vector) {
            if (util.type.isCoordinate(a2) || a2 instanceof Point || a2 instanceof Vector) {
                let p1 = new Point(a1),
                    p2 = new Point(a2),
                    { x: x1, y: y1 } = p1,
                    { x: x2, y: y2 } = p2

                let [x, y] = util.vector.subtract([x1, y1], [x2, y2])
                Object.seal(Object.assign(this, { point1: p1, x, y }))
                return this
            }

            if (!(a1 instanceof Vector)) {
                let p = new Point(a1),
                    { x, y } = p
                Object.seal(Object.assign(this, { point1: Point.zero, x, y }))
                return this
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
            [x2, y2] = util.vector.add([x1, y1], [x, y])
        return new Point([x2, y2])
    }
    /**
     * The angle of vector `this`
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2}
     */
    get angle() {
        if (this.isZero()) return NaN
        let a = Math.atan2(this.y, this.x) //Note: Math.atan2 return the ANTICLOCKWISE angle, in the range of [-Math.PI, Math.PI]
        return util.angle.simplify(-a)
    }
    /**
     * The magnitude of vector `this`
     * @returns {number}
     */
    get magnitude(): number {
        if (this.isZero()) return 0
        return Math.hypot(this.x, this.y)
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
        return reverse ? new Vector(segment.p2, segment.p1) : new Vector(segment.p1, segment.p2)
    }

    /**
     * Whether vector `this` is `Vector.zero`
     * @returns {boolean}
     */
    isZero(): boolean {
        let { x, y } = this,
            epsilon = this.options.epsilon
        return util.apxEqualsTo(x, 0, epsilon) && util.apxEqualsTo(y, 0, epsilon)
    }
    /**
     * Whether vector `this` is the same as vector `vector`
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs(vector: Vector): boolean {
        if (this.isZero() && vector.isZero()) return true
        return this.isSameAngleAs(vector) && this.isSameMagnitudeAs(vector)
    }
    /**
     * Whether the angle of vector `this` is the same as vector `vector`
     * @param {Vector} vector 
     * @returns {boolean}
     */
    isSameAngleAs(vector: Vector):boolean {
        if (this.isZero() && vector.isZero()) return true
        let epsilon = this.options.epsilon
        return util.apxEqualsTo(this.angle, vector.angle, epsilon)
    }
    isSameMagnitudeAs(vector: Vector) {
        if (this.isZero() && vector.isZero()) return true
        let epsilon = this.options.epsilon
        return util.apxEqualsTo(this.magnitude, vector.magnitude, epsilon)
    }

    /**
     * `向量this`到`向量v`的角差，记作theta，(-Math.PI, Math.PI]
     * angle本身已经处理了顺时针/逆时针正角的问题
     * @param {Vector} v
     * @returns {number}
     */
    angleTo(vector: Vector): number {
        return util.angle.simplify2(this.angle - vector.angle)
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
            angle = Math.acos(cosTheta) //Math.acos，[0, Math.PI]

        //点乘与夹角范围：
        //dp>0      投影为正，夹角[0, Math.PI/2)
        //dp==0     投影为0，夹角为Math.PI/2，正交
        //dp<0      投影为负，夹角(Math.PI/2,Math.PI]

        //利用叉乘来确定符号，注意叉乘参数有顺序之别
        //cp>0      法向量大于0，`向量this`到`向量v`的正旋角 (0, Math.PI)
        //cp==0     法向量为0，`向量this`到`向量v`的正旋角 0或Math.PI
        //cp<0      法向量小于0，`向量this`到`向量v`的正旋角 (Math.PI, 2*Math.PI)
        if (crossProduct < 0) angle = -angle //此处已经是正旋角，无论正旋角定义为顺时针还是逆时针都一样
        return util.angle.simplify2(angle)
    }

    /**
     * `向量this`与`向量v`的点乘
     * @summary V1(x1, y1) · V2(x2, y2) = x1 * x2 + y1 * y2
     * @param {Vector} v
     * @returns {number}
     */
    dotProduct(v: Vector): number {
        return this.x * v.x + this.y * v.y
    }
    /**
     * `向量this`与`向量v`的叉乘（不考虑叉乘之后得到的向量方向）
     * @summary V1(x1, y1) × V2(x2, y2) = x1 * y2 – y1 * x2
     * @param {*} v
     * @returns {number}
     */
    crossProduct(v: Vector): number {
        return this.x * v.y - this.y * v.x
    }

    normalize() {
        let { x, y } = this,
            [nx, ny] = util.vector.normalize([x, y])
        return new Vector([nx, ny])
    }
    add(v: Vector): Vector {
        let { x: x1, y: y1 } = this,
            { x: x2, y: y2 } = v,
            [nx, ny] = util.vector.add([x1, y1], [x2, y2])
        return new Vector([nx, ny])
    }
    subtract(v: Vector): Vector {
        let { x: x1, y: y1 } = this,
            { x: x2, y: y2 } = v,
            [nx, ny] = util.vector.subtract([x1, y1], [x2, y2])
        return new Vector([nx, ny])
    }
    scalarMultiply(scalar: number): Vector {
        let { x, y } = this,
            [nx, ny] = util.vector.scalarMultiply([x, y], scalar)
        return new Vector([nx, ny])
    }
    reverse() {
        return new Vector(-this.x, -this.y)
    }
    rotate(angle:number):Vector{
        let { x, y } = this,
            [nx, ny] = util.vector.rotate([x, y], angle)
        return new Vector([nx, ny]) 
    }
    clone() {
        return new Vector(this.point1, [this.x, this.y])
    }

    getCoordinate(): Coordinate {
        return this.point2.getCoordinate()
    }

    // todo
    apply(transformation: Transformation) {
        return transformation.get().transformVector(this)
    }
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

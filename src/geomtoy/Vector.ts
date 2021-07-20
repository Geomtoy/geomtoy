import Point from "./Point"
import Segment from "./Segment"
import utility from "./utility"
import _ from "lodash"
import { Coordinate, AnglePositive } from "./types"
import G from "./index"

class Vector {
    x!: number
    y!: number
    initial!: Point

    constructor(x: number, y: number)
    constructor(x1: number, y1: number, x2: number, y2: number)
    constructor(coordinate: Coordinate)
    constructor(initialCoordinate: Coordinate, terminalCoordinate: Coordinate)
    constructor(point: Point)
    constructor(initialPoint: Point, terminalPoint: Point)
    constructor(initialPoint: Point, terminalCoordinate: Coordinate)
    constructor(initialCoordinate: Coordinate, terminalPoint: Point)
    constructor(vector: Vector)
    constructor()
    constructor(x1?: any, y1?: any, x2?: any, y2?: any) {
        if (_.isNumber(x1) && _.isNumber(y1)) {
            if (_.isNumber(x2) && _.isNumber(y2)) {
                Object.assign(this, { initial: new Point(x1, y1), x: x2 - x1, y: y2 - y1 })
                return this
            }
            Object.assign(this, { initial: Point.zero, x: x1, y: y1 })
            return this
        }

        if (utility.type.isCoordinate(x1)) {
            if (utility.type.isCoordinate(y1)) {
                Object.assign(this, { initial: new Point(x1[0], x1[1]), x: y1[0] - x1[0], y: y1[1] - x1[1] })
                return this
            }
            if (y1 instanceof Point) {
                Object.assign(this, { initial: new Point(x1[0], x1[1]), x: y1.x - x1[0], y: y1.y - x1[1] })
                return this
            }
            Object.assign(this, { initial: Point.zero, x: x1[0], y: x1[1] })
            return this
        }

        if (x1 instanceof Point) {
            if (y1 instanceof Point) {
                Object.assign(this, { initial: x1.clone(), x: y1.x - x1.x, y: y1.y - x1.y })
                return this
            }
            if (utility.type.isCoordinate(y1)) {
                Object.assign(this, { initial: x1.clone(), x: y1[0] - x1.x, y: y1[1] - x1.y })
                return this
            }
            Object.assign(this, { initial: Point.zero, x: x1.x, y: x1.y })
            return this
        }

        if (x1 instanceof Vector) {
            return x1.clone()
        }

        return Vector.zero
    }

    /**
     * 向量角度
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2}
     */
    get angle() {
        if (this.isZero()) return NaN
        let a = Math.atan2(this.y, this.x) //注意Math.atan2返回是逆时针正角下的角，[-Math.PI, Math.PI]
        if (G.options.anglePositive === AnglePositive.Clockwise) a = -a
        //将其转到[0,2*Math.PI)之间
        return utility.angle.simplify(a)
    }
    /**
     * 向量长度（模）
     * @returns {number}
     */
    get length(): number {
        if (this.isZero()) return 0
        return Math.hypot(this.x, this.y)
    }

    static fromPoint(point: Point): Vector {
        return new Vector(point)
    }

    static fromPoints(initialPoint: Point, terminalPoint: Point): Vector {
        return new Vector(initialPoint, terminalPoint)
    }

    static fromAngleAndLength(angle: number, length: number): Vector {
        if (G.options.anglePositive === AnglePositive.Anticlockwise) {
            angle = -angle
        }
        let x = length * Math.cos(angle),
            y = length * Math.sin(angle)
        return new Vector(x, y)
    }

    static fromSegment(segment: Segment, reverse = false) {
        return reverse ? new Vector(segment.p2, segment.p1) : new Vector(segment.p1, segment.p2)
    }

    static get zero() {
        return new Vector(0, 0)
    }

    isZero() {
        return this.x === 0 && this.y === 0
    }
    isSameAs(v: Vector): boolean {
        if (this.isZero() && v.isZero()) return true
        return this.isSameAngleAs(v) && this.isSameLengthAs(v)
    }
    isSameAngleAs(v: Vector) {
        if (this.isZero() && v.isZero()) return true
        return utility.apxEqualsTo(this.angle, v.angle)
    }
    isSameLengthAs(v: Vector) {
        if (this.isZero() && v.isZero()) return true
        return utility.apxEqualsTo(this.length, v.length)
    }

    /**
     * `向量this`到`向量v`的角差，记作theta，(-Math.PI, Math.PI]
     * angle本身已经处理了顺时针/逆时针正角的问题
     * @param {Vector} v
     * @returns {number}
     */
    angleBetween(v: Vector): number {
        return utility.angle.simplify2(this.angle - v.angle)
    }

    /**
     * `向量this`到`向量v`的角差（另一种实现），记作theta，(-Math.PI, Math.PI]
     * @param {Vector} v
     * @returns {number}
     */
    #angleBetweenAnotherImpl(v: Vector): number {
        if (this.isZero() || v.isZero()) return NaN
        let dotProduct = this.dotProduct(v),
            crossProduct = this.crossProduct(v),
            cosTheta = dotProduct / (this.length * v.length),
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
        return utility.angle.simplify2(angle)
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
        let norm = Math.hypot(this.x, this.y)
        return new Vector(this.x / norm, this.y / norm)
    }
    add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y)
    }
    subtract(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y)
    }
    multiply(n: number): Vector {
        return new Vector(this.x * n, this.y * n)
    }
    reverse() {
        return new Vector(-this.x, -this.y)
    }
    rotate(angle: number): Vector {
        if (G.options.anglePositive === AnglePositive.Anticlockwise) {
            angle = -angle
        }

        let x = this.x * Math.cos(angle) + this.y * Math.sin(angle),
            y = -this.x * Math.sin(angle) + this.y * Math.cos(angle)
        return new Vector(x, y)
    }

    clone() {
        return new Vector(this.initial.clone(), [this.x, this.y])
    }
}

export default Vector

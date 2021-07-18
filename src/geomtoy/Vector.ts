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
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2}
     */
    get angle() {
        if (G.options.anglePositive === AnglePositive.Clockwise) {
            return utility.angle.simplify(-Math.atan2(this.y, this.x)) //注意Math.atan2返回是逆时针正角下的角
        } else {
            return utility.angle.simplify(Math.atan2(this.y, this.x))
        }
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
        return this.getLength() === 0
    }
    isSameAs(v: Vector): boolean {
        if (this.isZero() && v.isZero()) {
            return true
        } else {
            return this.isSameDirectionAs(v) && this.isSameLengthAs(v)
        }
    }
    isSameDirectionAs(v: Vector) {
        if (this.isZero() && v.isZero()) {
            return true
        }
        return utility.apxEqualsTo(<number>this.getRotationAngle(), <number>v.getRotationAngle())
    }
    isSameLengthAs(v: Vector) {
        return utility.apxEqualsTo(this.getLength(), v.getLength())
    }

    /**
     * `向量this`的长度（模）
     * @returns {Number}
     */
    getLength() {
        return Math.hypot(this.x, this.y)
    }
    /**
     * `向量this`相对于x轴正方向V(1, 0)的逆时针旋转角度，零向量没有方向，故没有旋转角度
     * @returns {number | null}
     */
    getRotationAngle(): number | null {
        if (this.isZero()) return null
        return this.getRotationAngleBetween(new Vector(1, 0))
    }
    /**
     * `向量this`相对于x轴正方向V(1, 0)的夹角，零向量没有方向，故没有夹角
     * @returns {number | null}
     */
    getIncludedAngle(): number | null {
        if (this.isZero()) return null
        return this.getIncludedAngleBetween(new Vector(1, 0))
    }
    /**
     * 两个向量之间的逆时针旋转角度，即从`向量this`，需要逆时针旋转多少角度才能与`向量v`方向相同
     * @param {Vector} v
     * @returns {number | null}
     */
    getRotationAngleBetween(v: Vector): number | null {
        let angle = this.getIncludedAngleBetween(v)
        if (angle === null) return null

        if (angle === 0 || angle === Math.PI) {
            return angle
        }

        let crossProduct = this.crossProduct(v)
        //如果crossProduct接近0，则angle === 0 || angle === Math.PI，所以此处不用判断近似等于0的情况
        if (crossProduct < 0) {
            angle = 2 * Math.PI - angle
        } else if (crossProduct > 0) {
            //do nothing
        }
        return angle
    }
    /**
     * 两个向量之间的夹角，记作theta，0 <= theta <= Math.PI
     * @description 可以区分0和Math.PI，即可以区分出同向和反向
     * @param {Vector} v
     * @returns {number | null}
     */
    getIncludedAngleBetween(v: Vector): number | null {
        if (this.isZero() || v.isZero()) return null

        let lA = this.getLength(),
            lB = v.getLength(),
            dotProduct = this.dotProduct(v),
            cosTheta = dotProduct / (lA * lB),
            angle = Math.acos(cosTheta)

        if (utility.apxEqualsTo(angle, Math.PI)) angle = Math.PI
        if (utility.apxEqualsTo(angle, 0)) angle = 0
        return angle
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

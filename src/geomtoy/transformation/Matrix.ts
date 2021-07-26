import Point from "../Point"
import LineReflection from "./LineReflection"
import PointReflection from "./PointReflection"
import Rotation from "./Rotation"
import Scaling from "./Scaling"
import Skewing from "./Skewing"
import Translation from "./Translation"
import util from "../utility"
import _ from "lodash"
import { Coordinate } from "../types"
import Vector from "../Vector"
import { is, sealed } from "../decorator"

@sealed
class Matrix {
    //
    // a c e
    // b d f
    // 0 0 1
    //
    #a: number | undefined
    #b: number | undefined
    #c: number | undefined
    #d: number | undefined
    #e: number | undefined
    #f: number | undefined

    constructor(a: number, b: number, c: number, d: number, e: number, f: number)
    constructor(m: Matrix)
    constructor(m: Translation)
    constructor(m: Rotation)
    constructor(m: Scaling)
    constructor(m: Skewing)
    constructor(m: LineReflection)
    constructor(m: PointReflection)
    constructor()
    constructor(a?: any, b?: any, c?: any, d?: any, e?: any, f?: any) {
        if (_.every([a, b, c, d, e, f], _.isNumber)) {
            Object.seal(Object.assign(this, { a, b, c, d, e, f }))
            return this
        }
        if (a instanceof Matrix) {
            return this.clone()
        }
        return Matrix.identity
    }

    @is("realNumber")
    get a() {
        return this.#a!
    }
    set a(value) {
        this.#a = value
    }
    @is("realNumber")
    get b() {
        return this.#b!
    }
    set b(value) {
        this.#b = value
    }
    @is("realNumber")
    get c() {
        return this.#c!
    }
    set c(value) {
        this.#c = value
    }
    @is("realNumber")
    get d() {
        return this.#d!
    }
    set d(value) {
        this.#d = value
    }
    @is("realNumber")
    get e() {
        return this.#e!
    }
    set e(value) {
        this.#e = value
    }
    @is("realNumber")
    get f() {
        return this.#f!
    }
    set f(value) {
        this.#f = value
    }

    isSameAs(matrix: Matrix): boolean {
        if (matrix === this) return true
        return (
            util.apxEqualsTo(this.a, matrix.a) &&
            util.apxEqualsTo(this.b, matrix.b) &&
            util.apxEqualsTo(this.c, matrix.c) &&
            util.apxEqualsTo(this.d, matrix.d) &&
            util.apxEqualsTo(this.e, matrix.e) &&
            util.apxEqualsTo(this.f, matrix.f)
        )
    }

    static get identity(): Matrix {
        return new Matrix(1, 0, 0, 1, 0, 0)
    }

    isIdentity(): boolean {
        return this.isSameAs(Matrix.identity)
    }

    preMultiply(matrix: Matrix): Matrix {
        return this.clone().preMultiplySelf(matrix)
    }

    preMultiplySelf(matrix: Matrix) {
        let result = Matrix.multiply(matrix, this)
        Object.assign(this, result)
        return this
    }

    postMultiply(matrix: Matrix): Matrix {
        return this.clone().postMultiplySelf(matrix)
    }

    postMultiplySelf(matrix: Matrix) {
        let result = Matrix.multiply(this, matrix)
        Object.assign(this, result)
        return this
    }

    //@see {@link:https://frederic-wang.fr/decomposition-of-2d-transform-matrices.html}
    decompose(matrix: Matrix) {
        let { a, b, c, d, e, f } = this

        let determinant = a * d - b * c,
            rotation,
            scaleX,
            scaleY,
            skewX,
            skewY
        if (a != 0 || b != 0) {
            let r = Math.sqrt(a * a + b * b)
            rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r)
            scaleX = r
            scaleY = determinant / r
            skewX = Math.atan((a * c + b * d) / (r * r))
        } else if (c != 0 || d != 0) {
            let s = Math.sqrt(c * c + d * d)
            rotation = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s))
            scaleX = determinant / s
            scaleY = s
            skewY = Math.atan((a * c + b * d) / (s * s))
        } else {
            scaleX = 0
            scaleY = 0
        }

        //m.translate(dd.translateX,dd.translateY).rotate(dd.rotation).scale(dd.scaleX,dd.scaleY).skew(dd.skewX,dd.skewY)
        return {
            rotation: rotation,
            scaleX: scaleX,
            scaleY: scaleY,
            skewX: skewX,
            skewY: skewY,
            translateX: e,
            translateY: f
        }
    }

    static multiply(matrix1: Matrix, matrix2: Matrix): { a: number; b: number; c: number; d: number; e: number; f: number } {
        let { a: a1, b: b1, c: c1, d: d1, e: e1, f: f1 } = matrix1,
            { a: a2, b: b2, c: c2, d: d2, e: e2, f: f2 } = matrix2
        //
        // a1 c1 e1     a2 c2 e2    a1a2+c1b2+e1*0  a1c2+c1d2+e1*0  a1e2+c1f2+e1*1
        // b1 d1 f1  x  b2 d2 f2  = b1a2+d1b2+f1*0  b1c2+d1d2+f1*0  b1e2+d1f2+f1*1
        // 0  0  1      0  0  1     0*a2+0*b2+1 *0  0*c2+0*d2+1* 0  0*e2+0*f2+1 *1
        //
        let a = a1 * a2 + c1 * b2,
            b = b1 * a2 + d1 * b2,
            c = a1 * c2 + c1 * d2,
            d = b1 * c2 + d1 * d2,
            e = a1 * e2 + c1 * f2 + e1,
            f = b1 * e2 + d1 * f2 + f1

        return { a, b, c, d, e, f }
    }

    transformCoordinate(coordinate: Coordinate): Coordinate {
        let { a, b, c, d, e, f } = this,
            [x, y] = coordinate,
            tx = a * x + c * y + e,
            ty = b * x + d * y + f
        return [tx, ty]
    }
    transformPoint(point: Point): Point {
        let { x, y } = point
        return new Point(this.transformCoordinate([x, y]))
    }
    transformVector(vector: Vector): Vector {
        let { x: x1, y: y1 } = vector.point1,
            { x: x2, y: y2 } = vector.point2,
            [nx1, ny1] = this.transformCoordinate([x1, y1]),
            [nx2, ny2] = this.transformCoordinate([x2, y2])
        return new Vector(nx1, ny1, nx2, ny2)
    }

    /**
     * Convert the point corresponding to the identity matrix (in the initial state without transformation)
     * to the point with the current transformation,
     * and the actual position of the point will not change
     * @param point
     * @returns
     */
    pointBeforeTransformed(point: Point) {
        let m = this.inverse()
        if (!(m instanceof Matrix)) throw new Error(`[G]\`Matrix:\` ${this.toString()} is NOT invertible.`)
        return m.transformPoint(point)
    }
    /**
     * Convert the point with the current transformation
     * to the point corresponding to the identity matrix (in the initial state without transformation),
     * and the actual position of the point will not change
     * @param point
     * @returns
     */
    pointAfterTransformed(point: Point) {
        return this.transformPoint(point)
    }

    /**
     * Find the determinant of a matrix
     * @returns {number}
     */
    determinant(): number {
        //
        // A
        // a11 a12 a13
        // a21 a22 a23
        // a31 a32 a33
        //
        // det = a11a22a33+a12a23a31+a13a21a32-a11a23a32-a12a21a33-a13a22a31
        //
        // let a11 = this.a,
        //     a12 = this.c,
        //     a13 = this.e,
        //     a21 = this.b,
        //     a22 = this.d,
        //     a23 = this.f,
        //     a31 = 0,
        //     a32 = 0,
        //     a33 = 1
        // return a11 * a22 * a33 + a12 * a23 * a31 + a13 * a21 * a32 - a11 * a23 * a32 - a12 * a21 * a33 - a13 * a22 * a31
        //

        let a11 = this.a,
            a12 = this.c,
            a21 = this.b,
            a22 = this.d
        return a11 * a22 - a12 * a21
    }

    /**
     * Find the inverse of a matrix
     * @returns {Matrix | boolean}
     */
    inverse(): Matrix | boolean {
        return this.clone().inverseSelf()
    }
    inverseSelf(): Matrix | boolean {
        let det = this.determinant()

        if (util.apxEqualsTo(det, 0)) return false
        //
        // B = A* (adjoint matrix)
        // b11 b12 b13
        // b21 b22 b23
        // b31 b32 b33
        //
        // b11 = a22a33-a23a32 / det
        // b12 = a13a32-a12a33 / det
        // b13 = a12a23-a13a22 / det
        // b21 = a23a31-a21a33 / det
        // b22 = a11a33-a13a31 / det
        // b23 = a21a13-a11a23 / det
        // b31 = a21a32-a22a31 / det
        // b32 = a12a31-a11a32 / det
        // b33 = a11a22-a21a12 / det
        //
        // let a11 = this.a,
        //     a12 = this.c,
        //     a13 = this.e,
        //     a21 = this.b,
        //     a22 = this.d,
        //     a23 = this.f,
        //     a31 = 0,
        //     a32 = 0,
        //     a33 = 1,
        //     b11 = (a22 * a33 - a23 * a32) / det,
        //     b12 = (a13 * a32 - a12 * a33) / det,
        //     b13 = (a12 * a23 - a13 * a22) / det,
        //     b21 = (a23 * a31 - a21 * a33) / det,
        //     b22 = (a11 * a33 - a13 * a31) / det,
        //     b23 = (a21 * a13 - a11 * a23) / det,
        //     b31 = (a21 * a32 - a22 * a31) / det,
        //     b32 = (a12 * a31 - a11 * a32) / det,
        //     b33 = (a11 * a22 - a21 * a12) / det
        //

        let a11 = this.a,
            a12 = this.c,
            a13 = this.e,
            a21 = this.b,
            a22 = this.d,
            a23 = this.f,
            b11 = a22 / det,
            b12 = -a12 / det,
            b13 = (a12 * a23 - a13 * a22) / det,
            b21 = -a21 / det,
            b22 = a11 / det,
            b23 = (a21 * a13 - a11 * a23) / det

        Object.assign(this, { a: b11, b: b21, c: b12, d: b22, e: b13, f: b23 })
        return this
    }

    clone(): Matrix {
        let { a, b, c, d, e, f } = this
        return new Matrix(...(<[number, number, number, number, number, number]>[a, b, c, d, e, f]))
    }

    toString(): string {
        return `Matrix(a:${this.a}, b:${this.b}, c:${this.c}, d:${this.d}, e:${this.e}, f:${this.f})`
    }
}

export default Matrix

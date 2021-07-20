import Point from "../Point"
import LineReflection from "./LineReflection"
import PointReflection from "./PointReflection"
import Rotation from "./Rotation"
import Scaling from "./Scaling"
import Skewing from "./Skewing"
import Translation from "./Translation"
import utility from "../utility"

class Matrix {
    //
    // a c e
    // b d f
    // 0 0 1
    //
    a!: number
    b!: number
    c!: number
    d!: number
    e!: number
    f!: number

    constructor(a: number, b: number, c: number, d: number, e: number, f: number)
    constructor(m: Matrix)
    constructor(m: LineReflection)
    constructor(m: PointReflection)
    constructor(m: Translation)
    constructor(m: Rotation)
    constructor(m: Scaling)
    constructor(m: Skewing)
    constructor()
    constructor(a?: any, b?: any, c?: any, d?: any, e?: any, f?: any) {
        if (a instanceof Matrix) {
            Object.assign(this, { a: a.a, b: a.b, c: a.c, d: a.d, e: a.e, f: a.f })
        } else if (a && b && c && d && e && f) {
            Object.assign(this, { a, b, c, d, e, f })
        } else {
            return Matrix.identity
        }
    }

    isSameAs(m: Matrix): boolean {
        if (m === this) return true
        return (
            utility.apxEqualsTo(this.a, m.a) &&
            utility.apxEqualsTo(this.b, m.b) &&
            utility.apxEqualsTo(this.c, m.c) &&
            utility.apxEqualsTo(this.d, m.d) &&
            utility.apxEqualsTo(this.e, m.e) &&
            utility.apxEqualsTo(this.f, m.f)
        )
    }

    static get identity(): Matrix {
        return new Matrix(1, 0, 0, 1, 0, 0)
    }

    isIdentity(): boolean {
        return this.isSameAs(Matrix.identity)
    }

    preMultiply(m: Matrix): Matrix {
        return this.clone().preMultiplyO(m)
    }

    preMultiplyO(m: Matrix) {
        let result = Matrix.#multiply(m, this)
        Object.assign(this, result)
        return this
    }

    postMultiply(m: Matrix): Matrix {
        return this.clone().postMultiplyO(m)
    }

    postMultiplyO(m: Matrix) {
        let result = Matrix.#multiply(this, m)
        Object.assign(this, result)
        return this
    }

    static #multiply(m1: Matrix, m2: Matrix): { a: number; b: number; c: number; d: number; e: number; f: number } {
        let { a: a1, b: b1, c: c1, d: d1, e: e1, f: f1 } = m1,
            { a: a2, b: b2, c: c2, d: d2, e: e2, f: f2 } = m2
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

    #transformPoint(point: Point) {
        let { a, b, c, d, e, f } = this
        let { x, y } = point
        let tx = a * x + c * y + e,
            ty = b * x + d * y + f
        return new Point(tx, ty)
    }

    //将对应单位矩阵（没有变换的初始状态下）的点，转换为有了当前变换的点，点的实际位置不会改变
    getPointBeforeMatrixTransformed(p: Point) {
        let m = this.inverse()
        if (!(m instanceof Matrix)) throw new Error(`[G]\`Matrix:\` ${this.toString()} is NOT invertible.`)
        return m.#transformPoint(p)
    }

    //将点的当前变换塌陷或者应用，成为对应单位矩阵（没有变换的初始状态下）状态下的点，点的实际位置不会改变
    getPointAfterMatrixTransformed(p: Point) {
        return this.#transformPoint(p)
    }

    /**
     * 求矩阵的行列式
     * @returns {number}
     */
    determinant(): number {
        //A
        //a11 a12 a13
        //a21 a22 a23
        //a31 a32 a33
        //
        //det = a11a22a33+a12a23a31+a13a21a32-a11a23a32-a12a21a33-a13a22a31

        //完整版本
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

        let a11 = this.a,
            a12 = this.c,
            a21 = this.b,
            a22 = this.d
        return a11 * a22 - a12 * a21
    }

    /**
     * 求矩阵的逆矩阵
     * @returns {Matrix | boolean}
     */
    inverse(): Matrix | boolean {
        let det = this.determinant()

        if (utility.apxEqualsTo(det, 0)) return false
        //B = A*（伴随矩阵）
        //b11 b12 b13
        //b21 b22 b23
        //b31 b32 b33
        //
        //b11 = a22a33-a23a32 / det
        //b12 = a13a32-a12a33 / det
        //b13 = a12a23-a13a22 / det
        //b21 = a23a31-a21a33 / det
        //b22 = a11a33-a13a31 / det
        //b23 = a21a13-a11a23 / det
        //b31 = a21a32-a22a31 / det
        //b32 = a12a31-a11a32 / det
        //b33 = a11a22-a21a12 / det

        //完整版本
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
        return new Matrix(b11, b21, b12, b22, b13, b23)
    }

    clone(): Matrix {
        return new Matrix(this)
    }

    toString(): string {
        return `Matrix(a:${this.a}, b:${this.b}, c:${this.c}, d:${this.d}, e:${this.e}, f:${this.f})`
    }
}

export default Matrix

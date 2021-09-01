import math from "../utility/math"

import Point from "../Point"
import Line from "../Line"
import Matrix from "../helper/Matrix"
import GeomObject from "../base/GeomObject"
import Geomtoy from ".."
class Transformation extends GeomObject {
    #matrix: Matrix = Matrix.identity

    constructor(owner: Geomtoy) {
        super(owner)
    }

    isValid() {
        return true
    }
    /**
     * Get the matrix of transformation `this`.
     */
    get(): [number, number, number, number, number, number] {
        let { a, b, c, d, e, f } = this.#matrix
        return [a, b, c, d, e, f]
    }
    /**
     * Set the matrix of transformation `this`.
     */
    set(value: [number, number, number, number, number, number]) {
        let [a, b, c, d, e, f] = value
        Object.assign(this.#matrix, { a, b, c, d, e, f })
        return this
    }
    /**
     * Reset transformation `this` by the identity matrix.
     */
    reset() {
        this.#matrix.toIdentity()
        return this
    }
    /**
     * Add a translation to transformation `this`.
     */
    translate(deltaX: number, deltaY: number) {
        let t = Object.assign(Matrix.identity, {
            e: deltaX,
            f: deltaY
        }) as Matrix
        this.#matrix.postMultiplySelf(t)
        return this
    }
    /**
     * Add a rotation to transformation `this`.
     */
    rotate(angle: number, origin?: Point) {
        let t = Object.assign(Matrix.identity, {
            a: math.cos(angle),
            b: -math.sin(angle),
            c: math.sin(angle),
            d: math.cos(angle)
        }) as Matrix
        if (origin !== undefined) {
            let { x, y } = origin,
                preTranslation = Object.assign(Matrix.identity, {
                    e: x,
                    f: y
                }) as Matrix,
                postTranslation = Object.assign(Matrix.identity, {
                    e: -x,
                    f: -y
                }) as Matrix
            t.preMultiplySelf(preTranslation)
            t.postMultiplySelf(postTranslation)
        }

        this.#matrix.postMultiplySelf(t)
        return this
    }
    /**
     * Add a scaling to transformation `this`.
     */
    scale(factorX: number, factorY: number, origin?: Point) {
        let t = Object.assign(Matrix.identity, {
            a: factorX,
            d: factorY
        }) as Matrix
        if (origin !== undefined) {
            let { x, y } = origin,
                preTranslation = Object.assign(Matrix.identity, {
                    e: x,
                    f: y
                }) as Matrix,
                postTranslation = Object.assign(Matrix.identity, {
                    e: -x,
                    f: -y
                }) as Matrix
            t.preMultiplySelf(preTranslation)
            t.postMultiplySelf(postTranslation)
        }
        this.#matrix.postMultiplySelf(t)
        return this
    }
    /**
     * Add a skewing to transformation `this`.
     */
    skew(angleX: number, angleY: number, origin?: Point) {
        let t = Object.assign(Matrix.identity, {
            b: math.tan(angleY),
            c: math.tan(angleX)
        }) as Matrix

        if (origin !== undefined) {
            let { x, y } = origin,
                preTranslation = Object.assign(Matrix.identity, {
                    e: x,
                    f: y
                }) as Matrix,
                postTranslation = Object.assign(Matrix.identity, {
                    e: -x,
                    f: -y
                }) as Matrix
            t.preMultiplySelf(preTranslation)
            t.postMultiplySelf(postTranslation)
        }

        this.#matrix.postMultiplySelf(t)
        return this
    }
    /**
     * Add a line reflection to transformation `this`.
     */
    lineReflect(line: Line) {
        let { a, b, c } = line,
            denom = a ** 2 + b ** 2,
            t = Object.assign(Matrix.identity, {
                a: (b ** 2 - a ** 2) / denom,
                b: -(2 * a * b) / denom,
                c: -(2 * a * b) / denom,
                d: -(b ** 2 - a ** 2) / denom,
                e: -(2 * a * c) / denom,
                f: -(2 * b * c) / denom
            }) as Matrix
        this.#matrix.postMultiplySelf(t)
        return this
    }
    /**
     * Add a point reflection to transformation `this`.
     */
    pointReflect(point: Point) {
        let [x, y] = point.coordinate,
            t = Object.assign(Matrix.identity, {
                a: -1,
                d: -1,
                e: 2 * x,
                f: 2 * y
            })
        this.#matrix.postMultiplySelf(t)
        return this
    }
    /**
     * Add a matrix transformation to transformation `this`.
     */
    matrix(a: number, b: number, c: number, d: number, e: number, f: number) {
        let t = new Matrix(a, b, c, d, e, f)
        this.#matrix.postMultiplySelf(t)
        return this
    }
    /**
     * Transform coordinate `coordinate` with the current transformation
     * to the coordinate corresponding to the identity matrix (in the initial state without transformation),
     * and the visual position of the coordinate will not change.
     */
    transformCoordinate(coordinate: [number, number]): [number, number] {
        return this.#matrix.transformCoordinate(coordinate)
    }
    /**
     * Transform coordinate `coordinate` corresponding to the identity matrix (in the initial state without transformation)
     * to the coordinate with the current transformation,
     * and the visual position of the coordinate will not change.
     */
    antitransformCoordinate(coordinate: [number, number]): [number, number] {
        return this.#matrix.antitransformCoordinate(coordinate)
    }
    /**
     * Decompose transformation `this`.
     * @description The return object (if named `o`) means transformation `this` is equal to
     * ```javascript
     * this.reset().translate(o.translateX, o.translateY).rotate(o.rotation).scale(o.scaleX, o.scaleY).skew(o.skewX, o.skewY)
     * ```
     * @see https://frederic-wang.fr/decomposition-of-2d-transform-matrices.html
     */
    decompose() {
        let [a, b, c, d, e, f] = this.get(),
            determinant = a * d - b * c,
            rotation = 0,
            scaleX = 1,
            scaleY = 1,
            skewX = 0,
            skewY = 0
        if (a !== 0 || b !== 0) {
            let r = math.hypot(a, b)
            rotation = b > 0 ? math.acos(a / r) : -math.acos(a / r)
            scaleX = r
            scaleY = determinant / r
            skewX = math.atan((a * c + b * d) / r ** 2)
        } else if (c !== 0 || d !== 0) {
            let s = math.hypot(c, d)
            rotation = math.PI / 2 - (d > 0 ? math.acos(-c / s) : -math.acos(c / s))
            scaleX = determinant / s
            scaleY = s
            skewY = math.atan((a * c + b * d) / s ** 2) //always 0
        } else {
            scaleX = 0
            scaleY = 0
        }
        return {
            translateX: e,
            translateY: f,
            rotation,
            scaleX,
            scaleY,
            skewX,
            skewY
        }
    }
    clone() {
        return new Transformation(this.owner).set(this.get())
    }
    toString() {
        let [a, b, c, d, e, f] = this.get()
        //prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\ta: ${a}`,
            `\tb: ${b}`,
            `\tc: ${c}`,
            `\td: ${d}`,
            `\te: ${e}`,
            `\tf: ${f}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return this.get()
    }
    toObject() {
        let [a, b, c, d, e, f] = this.get()
        return { a, b, c, d, e, f }
    }
}

export default Transformation

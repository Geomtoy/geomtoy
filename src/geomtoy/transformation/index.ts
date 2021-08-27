import Point from "../Point"
import Line from "../Line"
import Matrix from "../helper/Matrix"
import GeomObject from "../base/GeomObject"
import Geomtoy from ".."
import math from "../utility/math"
class Transformation extends GeomObject {
    #matrix: Matrix = Matrix.identity

    constructor(owner: Geomtoy) {
        super(owner)
    }

    isValid() {
        return true
    }

    get(): [number, number, number, number, number, number] {
        let { a, b, c, d, e, f } = this.#matrix
        return [a, b, c, d, e, f]
    }
    set([a, b, c, d, e, f]: [number, number, number, number, number, number]) {
        this.#matrix = new Matrix(a, b, c, d, e, f)
        return this
    }
    reset(){
        this.#matrix = Matrix.identity
        return this
    }

    translate(deltaX: number, deltaY: number) {
        let t = Object.assign(Matrix.identity, {
            e:deltaX,
            f:deltaY
        }) as Matrix
        this.#matrix.postMultiplySelf(t)
        return this
    }
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
    matrix(a: number, b: number, c: number, d: number, e: number, f: number) {
        let t = new Matrix(a, b, c, d, e, f)
        this.#matrix.postMultiplySelf(t)
        return this
    }
    transformCoordinate(coordinate: [number, number]): [number, number] {
        return this.#matrix.transformCoordinate(coordinate)
    }
    antitransformCoordinate(coordinate: [number, number]): [number, number] {
        return this.#matrix.antitransformCoordinate(coordinate)
    }

    //@see {@link:https://frederic-wang.fr/decomposition-of-2d-transform-matrices.html}
    decompose() {
        let [a, b, c, d, e, f] = this.get(),
            determinant = a * d - b * c,
            rotation,
            scaleX,
            scaleY,
            skewX,
            skewY
        if (a != 0 || b != 0) {
            let r = math.sqrt(a * a + b * b)
            rotation = b > 0 ? math.acos(a / r) : -math.acos(a / r)
            scaleX = r
            scaleY = determinant / r
            skewX = math.atan((a * c + b * d) / (r * r))
        } else if (c != 0 || d != 0) {
            let s = math.sqrt(c * c + d * d)
            rotation = math.PI / 2 - (d > 0 ? math.acos(-c / s) : -math.acos(c / s))
            scaleX = determinant / s
            scaleY = s
            skewY = math.atan((a * c + b * d) / (s * s))
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
    toArray(): any[] {
        return this.get()
    }
    toObject(): object {
        let [a, b, c, d, e, f] = this.get()
        return {
            a,
            b,
            c,
            d,
            e,
            f
        }
    }
}

export default Transformation

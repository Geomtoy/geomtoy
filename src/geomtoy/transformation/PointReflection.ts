import { is, sealed } from "../decorator"
import Point from "../Point"
import Matrix from "./Matrix"

@sealed
class PointReflection extends Matrix {
    #point: Point | undefined

    constructor(point: Point)
    constructor()
    constructor(p?: any) {
        super()
        if (p instanceof Point) {
            Object.seal(Object.assign(this, { point: p }))
            this.#pointReflection()
            return this
        }
        Object.seal(Object.assign(this, { point: Point.zero }))
        this.#pointReflection()
    }

    @is("point")
    get point() {
        return this.#point!
    }
    set point(value) {
        this.#point = value
        this.#pointReflection()
    }

    #pointReflection() {
        this.a = -1
        this.d = -1
        this.e = 2 * this.#point!.x
        this.f = 2 * this.#point!.y
    }
    clone() {
        return new PointReflection(this.point)
    }
}

export default PointReflection

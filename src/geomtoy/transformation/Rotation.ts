import Matrix from "./Matrix"
import Translation from "./Translation"
import Point from "../Point"
import { is, sealed } from "../decorator"
import util from "../utility"

@sealed
class Rotation extends Matrix {
    #angle: number | undefined
    #origin: Point | undefined

    constructor(angle: number, origin: Point)
    constructor(angle: number)
    constructor()
    constructor(a?: any, o?: any) {
        super()
        if (util.isNumber(a)) {
            if (o instanceof Point) {
                Object.seal(Object.assign({ angle: a, origin: o }))
                this.#rotation()
                return this
            }
            Object.seal(Object.assign({ angle: a, origin: Point.zero }))
            this.#rotation()
            return this
        }
        Object.seal(Object.assign({ angle: 0, origin: Point.zero }))
        this.#rotation()
    }
    @is("realNumber")
    get angle() {
        return this.#angle!
    }
    set angle(value) {
        this.#angle = value
        this.#rotation()
    }
    @is("point")
    get origin() {
        return this.#origin!
    }
    set origin(value) {
        this.#origin = value
        this.#rotation()
    }

    #rotation() {
        let preTranslation = new Translation(this.#origin!.x, this.#origin!.y),
            postTranslation = new Translation(-this.#origin!.x, -this.#origin!.y)

        this.a = Math.cos(this.#angle!)
        this.b = -Math.sin(this.#angle!)
        this.c = Math.sin(this.#angle!)
        this.d = Math.cos(this.#angle!)

        this.preMultiplySelf(preTranslation)
        this.postMultiplySelf(postTranslation)
    }
    clone() {
        return new Rotation(this.angle, this.origin)
    }
}

export default Rotation

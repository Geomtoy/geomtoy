import Matrix from "./Matrix"
import Translation from "./Translation"
import Point from "../Point"
import { is, sealed } from "../decorator"
import util from "../utility"

@sealed
class Scaling extends Matrix {
    #factorX: number | undefined
    #factorY: number | undefined
    #origin: Point | undefined

    constructor(factorX: number, factorY: number, origin: Point)
    constructor(factorX: number, factorY: number)
    constructor()
    constructor(fx?: any, fy?: any, o?: any) {
        super()
        if (util.isNumber(fx) && util.isNumber(fy)) {
            if (o instanceof Point) {
                Object.seal(Object.assign(this, { factorX: fx, factorY: fy, origin: o }))
                this.#scaling()
                return this
            }
            Object.seal(Object.assign(this, { factorX: fx, factorY: fy, origin: Point.zero }))
            this.#scaling()
            return this
        }
        Object.seal(Object.assign(this, { factorX: 1, factorY: 1, origin: Point.zero }))
        this.#scaling()
    }

    @is("positiveNumber")
    get factorX() {
        return this.#factorX!
    }
    set factorX(value) {
        this.#factorX = value
        this.#scaling()
    }
    @is("positiveNumber")
    get factorY() {
        return this.#factorY!
    }
    set factorY(value) {
        this.#factorY = value
        this.#scaling()
    }
    @is("point")
    get origin() {
        return this.#origin!
    }
    set origin(value) {
        this.#origin = value
        this.#scaling()
    }

    #scaling() {
        let preTranslation = new Translation(this.#origin!.x, this.#origin!.y),
            postTranslation = new Translation(-this.#origin!.x, -this.#origin!.y)

        this.a = this.#factorX!
        this.d = this.#factorY!

        this.preMultiplySelf(preTranslation)
        this.postMultiplySelf(postTranslation)
    }
    clone() {
        return new Scaling(this.factorX, this.factorY, this.origin)
    }
}

export default Scaling

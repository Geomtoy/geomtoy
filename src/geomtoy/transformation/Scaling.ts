import Matrix from "./Matrix"
import Translation from "./Translation"
import { Coordinate } from "../types"
import utility from "../utility"
import Point from "../Point"
import _ from "lodash"

class Scaling extends Matrix {
    #factorX: number
    #factorY: number
    #origin: Point

    constructor(factorX: number, factorY: number, originX: number, originY: number)
    constructor(factorX: number, factorY: number, originCoordinate: Coordinate)
    constructor(factorX: number, factorY: number, origin: Point)
    constructor(factorX: number, factorY: number)
    constructor()
    constructor(fx?: any, fy?: any, ox?: any, oy?: any) {
        super()
        if (_.isNumber(fx) && _.isNumber(fy)) {
            this.#factorX = fx
            this.#factorY = fy
            if (_.isNumber(ox) && _.isNumber(oy)) {
                this.#origin = new Point(ox, oy)
                this.#scaling()
                return this
            }

            if (utility.type.isCoordinate(ox)) {
                this.#origin = new Point(ox)
                this.#scaling()
                return this
            }

            if (ox instanceof Point) {
                this.#origin = ox
                this.#scaling()
                return this
            }
            this.#origin = Point.zero
            this.#scaling()
            return this
        }
        this.#factorX = 1
        this.#factorY = 1
        this.#origin = Point.zero
        this.#scaling()
    }

    get factorX() {
        return this.#factorX
    }
    set factorX(value) {
        this.#factorX = value
        this.#scaling()
    }
    get factorY() {
        return this.#factorY
    }
    set factorY(value) {
        this.#factorY = value
        this.#scaling()
    }
    get origin() {
        return this.#origin
    }
    set origin(value) {
        this.#origin = value
    }

    #scaling() {
        let preTranslation = new Translation(this.#origin.x, this.#origin.y),
            postTranslation = new Translation(-this.#origin.x, -this.#origin.y)

        this.a = this.#factorX
        this.d = this.#factorY

        this.preMultiplyO(preTranslation)
        this.postMultiplyO(postTranslation)
    }
    clone() {
        return new Scaling(this.#factorX, this.#factorY, this.#origin)
    }
}

export default Scaling

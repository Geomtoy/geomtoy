import Matrix from "./Matrix"
import Translation from "./Translation"
import Point from "../Point"
import { Coordinate } from "../types"
import _ from "lodash"
import utility from "../utility"

class Skewing extends Matrix {
    #angleX: number
    #angleY: number
    #origin: Point

    constructor(angleX: number, angleY: number, originX: number, originY: number)
    constructor(angleX: number, angleY: number, originCoordinate: Coordinate)
    constructor(angleX: number, angleY: number, origin: Point)
    constructor(angleX: number, angleY: number)
    constructor()
    constructor(ax?: any, ay?: any, ox?: any, oy?: any) {
        super()
        if (_.isNumber(ax) && _.isNumber(ay)) {
            this.#angleX = ax
            this.#angleY = ay
            if (_.isNumber(ox) && _.isNumber(oy)) {
                this.#origin = new Point(ox, oy)
                this.#skewing()
                return this
            }

            if (utility.type.isCoordinate(ox)) {
                this.#origin = new Point(ox)
                this.#skewing()
                return this
            }

            if (ox instanceof Point) {
                this.#origin = ox
                this.#skewing()
                return this
            }
            this.#origin = Point.zero
            this.#skewing()
            return this
        }
        this.#angleX = 0
        this.#angleY = 0
        this.#origin = Point.zero
        this.#skewing()
    }

    get angleX() {
        return this.#angleX
    }
    set angleX(value) {
        this.#angleX = value
        this.#skewing()
    }
    get angleY() {
        return this.#angleY
    }
    set angleY(value) {
        this.#angleY = value
        this.#skewing()
    }
    get origin() {
        return this.#origin
    }
    set origin(value) {
        this.#origin = value
        this.#skewing()
    }

    #skewing() {
        let preTranslation = new Translation(this.#origin.x, this.#origin.y),
            postTranslation = new Translation(-this.#origin.x, -this.#origin.y)

        this.b = Math.tan(this.#angleY)
        this.c = Math.tan(this.#angleX)

        this.preMultiplyO(preTranslation)
        this.postMultiplyO(postTranslation)
    }
}

export default Skewing

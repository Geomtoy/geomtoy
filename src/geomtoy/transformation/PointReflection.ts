import Point from "../Point"
import { Coordinate } from "../types"
import _ from "lodash"
import utility from "../utility"
import Matrix from "./Matrix"

class PointReflection extends Matrix {
    #point: Point

    constructor(pointX: number, pointY: number)
    constructor(pointCoordinate: Coordinate)
    constructor(point: Point)
    constructor()
    constructor(px?: any, py?: any) {
        super()
        if (_.isNumber(px) && _.isNumber(py)) {
            this.#point = new Point(px, py)
            this.#pointReflection()
            return this
        }

        if (utility.type.isCoordinate(px)) {
            this.#point = new Point(px)
            this.#pointReflection()
            return this
        }

        if (px instanceof Point) {
            this.#point = px
            this.#pointReflection()
            return this
        }
        this.#point = Point.zero
        this.#pointReflection()
    }

    get point() {
        return this.#point
    }
    set point(value) {
        this.#point = value
        this.#pointReflection()
    }

    static get zero() {
        return new PointReflection()
    }

    #pointReflection() {
        this.a = -1
        this.d = -1
        this.e = 2 * this.#point.x
        this.f = 2 * this.#point.y
    }
}

export default PointReflection

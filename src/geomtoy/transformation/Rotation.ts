import Matrix from "./Matrix"
import Translation from "./Translation"
import Point from "../Point"
import G from "../"
import _ from "lodash"
import utility from "../utility"
import { AnglePositive, Coordinate } from "../types"

class Rotation extends Matrix {
    #angle: number
    #origin: Point

    constructor(angle: number, originX: number, originY: number)
    constructor(angle: number, originCoordinate: Coordinate)
    constructor(angle: number, origin: Point)
    constructor(angle: number)
    constructor()
    constructor(a?: any, ox?: any, oy?: any) {
        super()
        if (_.isNumber(a)) {
            this.#angle = a
            if (_.isNumber(ox) && _.isNumber(oy)) {
                let p = new Point(ox, oy)
                this.#origin = p
                this.#rotation()
                return this
            }

            if (utility.type.isCoordinate(ox)) {
                let p = new Point(ox)
                this.#origin = p
                this.#rotation()
                return this
            }

            if (ox instanceof Point) {
                this.#origin = ox
                this.#rotation()
                return this
            }

            this.#origin = Point.zero
            this.#rotation()
            return this
        }
        this.#angle = 0
        this.#origin = Point.zero
        this.#rotation()
    }

    get angle() {
        return this.#angle
    }
    set angle(value) {
        this.#angle = value
        this.#rotation()
    }
    get origin() {
        return this.#origin
    }
    set origin(value) {
        this.#origin = value
        this.#rotation()
    }

    #rotation() {
        let preTranslation = new Translation(this.#origin.x, this.#origin.y),
            postTranslation = new Translation(-this.#origin.x, -this.#origin.y)

        if (G.options.anglePositive === AnglePositive.Clockwise) {
            this.a = Math.cos(this.#angle)
            this.b = Math.sin(this.#angle)
            this.c = -Math.sin(this.#angle)
            this.d = Math.cos(this.#angle)
            this.e = 0
            this.f = 0
        } else {
            this.a = Math.cos(this.#angle)
            this.b = -Math.sin(this.#angle)
            this.c = Math.sin(this.#angle)
            this.d = Math.cos(this.#angle)
            this.e = 0
            this.f = 0
        }

        this.preMultiplyO(preTranslation)
        this.postMultiplyO(postTranslation)
    }

    clone() {
        return new Rotation(this.#angle, this.#origin)
    }
}

export default Rotation

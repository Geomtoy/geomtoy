import type from "../utility/type"
import Matrix from "./Matrix"
import Translation from "./Translation"
import Point from "../Point"
import { is, sealed } from "../decorator"

@sealed
class Skewing extends Matrix {
    #angleX: number | undefined
    #angleY: number | undefined
    #origin: Point | undefined

    constructor(angleX: number, angleY: number, origin: Point)
    constructor(angleX: number, angleY: number)
    constructor()
    constructor(ax?: any, ay?: any, o?: any) {
        super()
        if (type.isNumber(ax) && type.isNumber(ay)) {
            if (o instanceof Point) {
                Object.seal(Object.assign(this, { angleX: ax, angleY: ay, origin: o }))
                this.#skewing()
                return this
            }
            Object.seal(Object.assign(this, { angleX: ax, angleY: ay, origin: Point.zero }))
            this.#skewing()
            return this
        }
        Object.seal(Object.assign(this, { angleX: 0, angleY: 0, origin: Point.zero }))
        this.#skewing()
    }

    @is("realNumber")
    get angleX() {
        return this.#angleX!
    }
    set angleX(value) {
        this.#angleX = value //(-90,90)
        this.#skewing()
    }
    @is("realNumber")
    get angleY() {
        return this.#angleY!
    }
    set angleY(value) {
        this.#angleY = value  //(-90,90)
        this.#skewing()
    }
    @is("point")
    get origin() {
        return this.#origin!
    }
    set origin(value) {
        this.#origin = value
        this.#skewing()
    }

    #skewing() {
        let preTranslation = new Translation(this.#origin!.x, this.#origin!.y),
            postTranslation = new Translation(-this.#origin!.x, -this.#origin!.y)

        this.b = Math.tan(this.#angleY!)
        this.c = Math.tan(this.#angleX!)

        this.preMultiplySelf(preTranslation)
        this.postMultiplySelf(postTranslation)
    }
    clone() {
        return new Skewing(this.angleX, this.angleY, this.origin)
    }
}

export default Skewing

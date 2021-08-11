import util from "../utility"
import Matrix from "./Matrix"
import { is, sealed } from "../decorator"

@sealed
class Translation extends Matrix {
    #deltaX: number | undefined
    #deltaY: number | undefined

    constructor(deltaX: number, deltaY: number)
    constructor()
    constructor(dx?: any, dy?: any) {
        super()
        if (util.isNumber(dx) && util.isNumber(dy)) {
            Object.assign(this, { deltaX: dx, deltaY: dy })
            this.#translation()
            return this
        }
        Object.assign(this, { deltaX: 0, deltaY: 0 })
        this.#translation()
    }

    @is("realNumber")
    get deltaX() {
        return this.#deltaX!
    }
    set deltaX(value) {
        this.#deltaX = value
        this.#translation()
    }
    @is("realNumber")
    get deltaY() {
        return this.#deltaY!
    }
    set deltaY(value) {
        this.#deltaY = value
        this.#translation()
    }

    #translation() {
        this.e = this.#deltaX!
        this.f = this.#deltaY!
    }
    clone() {
        return new Translation(this.deltaX, this.deltaY)
    }
}

export default Translation

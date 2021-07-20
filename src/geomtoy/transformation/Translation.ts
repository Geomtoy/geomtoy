import Matrix from "./Matrix"
import _ from "lodash"

class Translation extends Matrix {
    #offsetX: number
    #offsetY: number

    constructor(offsetX: number, offsetY: number)
    constructor()
    constructor(dx?: any, dy?: any) {
        super()
        if (_.isNumber(dx) && _.isNumber(dy)) {
            this.#offsetX = dx
            this.#offsetY = dy
            this.#translation()
            return this
        }

        this.#offsetX = 0
        this.#offsetY = 0
        this.#translation()
    }

    get offsetX() {
        return this.#offsetX
    }
    set offsetX(value) {
        this.#offsetX = value
        this.#translation()
    }
    get offsetY() {
        return this.#offsetY
    }
    set offsetY(value) {
        this.#offsetY = value
        this.#translation()
    }

    #translation() {
        this.e = this.#offsetX
        this.f = this.#offsetY
    }
    
    clone() {
        return new Translation(this.#offsetX, this.#offsetY)
    }
}

export default Translation

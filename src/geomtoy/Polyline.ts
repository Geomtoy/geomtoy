import util from "./utility"
import vec2 from "./utility/vec2"

import Point from "./Point"
import Rectangle from "./Rectangle"
import GeomObject from "./base/GeomObject"
import Geomtoy from "."
import math from "./utility/math"
import { is, sealed } from "./decorator"
import coordArray from "./helper/coordinateArray"
import coord from "./helper/coordinate"

const minPointLength = 2
@sealed
class Polyline extends GeomObject {
    #pointCoordinates: Array<[number, number]> = []

    constructor(owner: Geomtoy, pointCoordinates: Array<[number, number]>)
    constructor(owner: Geomtoy, points: Array<Point>)
    constructor(owner: Geomtoy, ...pointCoordinates: Array<[number, number]>)
    constructor(owner: Geomtoy, ...points: Array<Point>)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any) {
        super(o)

        if (util.isArray(util.head(a1))) {
            Object.assign(this, { pointCoordinates: a1 })
        }
        if (util.head(a1) instanceof Point) {
            Object.assign(this, { points: a1 })
        }

        return Object.seal(this)
    }

    @is("pointArray")
    get points() {
        return util.map(this.#pointCoordinates, c => new Point(this.owner, c))
    }
    set points(value) {
        this.#pointCoordinates = util.map(value, p => p.coordinate)
    }

    @is("coordinateArray")
    get pointCoordinates() {
        return this.#pointCoordinates
    }
    set pointCoordinates(value) {
        this.#pointCoordinates = util.map(value, c => coord.copy(c))
    }

    static formingCondition = `There should be at least ${minPointLength} distinct vertices in a \`Polyline\`.`

    isValid(): boolean {
        let cs = this.pointCoordinates,
            l = cs.length
        if (l < minPointLength) return false

        let epsilon = this.owner.getOptions().epsilon,
            uniques: [number, number][] = [[NaN, NaN]],
            valid = false

        util.forEach(cs, c => {
            if (util.every(uniques, uc => !coord.isSameAs(uc, c, epsilon))) uniques.push(c)
            if (uniques.length > minPointLength) {
                valid = true
                return true
            }
        })
        return valid
    }

    getPointCount() {
        return this.pointCoordinates.length
    }
    clone(): GeomObject {
        throw new Error("Method not implemented.")
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
    toArray(): any[] {
        throw new Error("Method not implemented.")
    }
    toObject(): object {
        throw new Error("Method not implemented.")
    }
}

/**
 *
 * @category GeomObject
 */
export default Polyline

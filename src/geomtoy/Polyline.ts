import util from "./utility"
import vec2 from "./utility/vec2"

import Point from "./Point"
import Rectangle from "./Rectangle"
import GeomObject from "./base/GeomObject"
import Geomtoy from "."
import math from "./utility/math"
import { is, sameOwner, sealed } from "./decorator"
import coordArray from "./helper/coordinateArray"
import coord from "./helper/coordinate"

const minPointLength = 2
@sealed
class Polyline extends GeomObject {
    #name = "Polygon"
    #uuid = util.uuid()

    #pointCoordinates: Array<[number, number]> = []

    constructor(owner: Geomtoy, pointCoordinates: Array<[number, number]>)
    constructor(owner: Geomtoy, points: Array<Point>)
    constructor(owner: Geomtoy, ...pointCoordinates: Array<[number, number]>)
    constructor(owner: Geomtoy, ...points: Array<Point>)
    constructor(o: Geomtoy, a1: any) {
        super(o)
        if (util.isArray(a1)) {
            if (util.isCoordinate(util.head(a1))) {
                return Object.seal(Object.assign(this, { pointCoordinates: a1 }))
            }
            if (util.head(a1) instanceof Point) {
                return Object.seal(Object.assign(this, { points: a1 }))
            }
        }
        throw new Error("[G]Arguments can NOT construct a `Polyline`.")
    }
    get name() {
        return this.#name
    }
    get uuid() {
        return this.#uuid
    }

    @sameOwner
    @is("pointArray")
    get points() {
        return util.map(this.#pointCoordinates, c => new Point(this.owner, c))
    }
    set points(value) {
        this.#pointCoordinates = util.map(value, p => p.coordinate)
        this.#guard()
    }

    @is("coordinateArray")
    get pointCoordinates() {
        return this.#pointCoordinates
    }
    set pointCoordinates(value) {
        this.#pointCoordinates = util.map(value, c => coord.copy(c))
        this.#guard()
    }

    #guard() {
        let epsilon = this.owner.getOptions().epsilon,
            count = this.getPointCount()
        if (count < minPointLength) {
            throw new Error(`[G]The point count of a \`Polyline\` should be at least ${minPointLength}.`)
        }
        if (util.uniqWith(this.pointCoordinates, (i, j) => coord.isSameAs(i, j, epsilon)).length !== count) {
            throw new Error(`[G]The points of a \`Polyline\` should be distinct.`)
        }
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

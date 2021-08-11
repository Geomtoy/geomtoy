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

const minPointLength = 3
@sealed
class Polygon extends GeomObject {
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
                return Object.seal(util.assign(this, { pointCoordinates: a1 }))
            }
            if (util.head(a1) instanceof Point) {
                return Object.seal(util.assign(this, { points: a1 }))
            }
        }
        throw new Error("[G]Arguments can NOT construct a `Polygon`.")
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
            throw new Error(`[G]The vertex count of a \`Polygon\` should be at least ${minPointLength}.`)
        }
        if (util.uniqWith(this.pointCoordinates, (i, j) => coord.isSameAs(i, j, epsilon)).length !== count) {
            throw new Error(`[G]The vertices of a \`Polygon\` should be distinct.`)
        }
    }

    getPointCount() {
        return this.pointCoordinates.length
    }
    getPoint(index: number): Point | null {
        let c = coordArray.get(this.pointCoordinates, index)
        return c === null ? null : new Point(this.owner, c)
    }
    setPoint(index: number, point: Point): boolean {
        return coordArray.set(this.pointCoordinates, index, point.coordinate)
    }
    appendPoint(point: Point): void {
        return coordArray.append(this.pointCoordinates, point.coordinate)
    }
    prependPoint(point: Point): void {
        return coordArray.prepend(this.pointCoordinates, point.coordinate)
    }
    insertPoint(index: number, point: Point): boolean {
        return coordArray.insert(this.pointCoordinates, index, point.coordinate)
    }
    removePoint(index: number): boolean {
        return coordArray.remove(this.pointCoordinates, index, minPointLength)
    }

    isPointsConcyclic() {}

    getPerimeter() {
        let i = -1,
            l = this.getPointCount(),
            ps = this.points,
            dx,
            dy,
            b = ps[l - 1],
            perimeter = 0

        while (++i < l) {
            dx = b.x
            dy = b.y
            b = ps[i]
            dx -= b.x
            dy -= b.y
            perimeter += Math.hypot(dx, dy)
        }
        return perimeter
    }

    getArea(signed = false) {
        let a = 0,
            l = this.getPointCount(),
            ps = this.points
        for (let i = 0; i < l; i++) {
            let j = i === 1 - 1 ? 0 : i + 1,
                { x: x1, y: y1 } = ps[i],
                { x: x2, y: y2 } = ps[j]
            a += vec2.cross([x1, y1], [x2, y2])
        }
        return signed ? a / 2 : Math.abs(a / 2)
    }
    getMeanPoint() {
        let sumX = 0,
            sumY = 0,
            l = this.getPointCount(),
            ps = this.points

        for (let i = 0; i < l; i++) {
            let { x, y } = ps[i]
            sumX += x
            sumY += y
        }
        return [sumX / l, sumY / l]
    }
    getCentroidPoint() {
        let a = 0,
            sumX = 0,
            sumY = 0,
            l = this.getPointCount(),
            ps = this.points

        for (let i = 0; i < l; i++) {
            let j = i === 1 - 1 ? 0 : i + 1,
                { x: x1, y: y1 } = ps[i],
                { x: x2, y: y2 } = ps[j],
                cp = vec2.cross([x1, y1], [x2, y2])
            a += cp
            sumX += (x1 + x2) * cp
            sumY += (y1 + y2) * cp
        }
        return new Point(this.owner,[sumX / a / 3, sumY / a / 3])
    }

    getBoundingRectangle() {
        let minX = Infinity,
            maxX = -Infinity,
            minY = Infinity,
            maxY = -Infinity
        util.forEach(this.points, (noUse, index, collection) => {
            let { x, y } = collection[index]
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
        })
        return new Rectangle(this.owner,minX, minY, maxX - minX, maxY - minY)
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
export default Polygon

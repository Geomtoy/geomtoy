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

const minPointLength = 3
@sealed
class Polygon extends GeomObject {
    #pointCoordinates: Array<[number, number]> = []

    constructor(owner: Geomtoy, pointCoordinates: Array<[number, number]>)
    constructor(owner: Geomtoy, points: Array<Point>)
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

    static formingCondition = `There should be at least ${minPointLength} distinct vertices in a \`Polygon\`.`

    isValid() {
        let cs = this.pointCoordinates,
            l = cs.length
        if (l < minPointLength) return false

        let epsilon = this.owner.getOptions().epsilon,
            uniques: [number, number][] = [[NaN, NaN]]
        return cs.some(c=>{
            if (uniques.every(uc => !coord.isSameAs(uc, c, epsilon))) uniques.push(c)
            if (uniques.length > minPointLength) return true
        })
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
        let p = 0,
            l = this.getPointCount(),
            cs = this.pointCoordinates

        util.forEach(util.range(0,l), index => {
            let c1 = util.nth(cs, index - l)!,
                c2 = util.nth(cs, index - l + 1)!
            p += vec2.magnitude(vec2.from(c1, c2))
        })
        return p
    }

    getArea() {
        let a = 0,
            l = this.getPointCount(),
            cs = this.pointCoordinates

        util.forEach(util.range(0,l), index => {
            let c1 = util.nth(cs, index - l)!,
                c2 = util.nth(cs, index - l + 1)!
            a += vec2.cross(c1, c2)
        })
        a = a / 2
        return Math.abs(a)
    }
    getCentroidPoint() {
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
    getWeightedCentroidPoint() {
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
        return new Point(this.owner, [sumX / a / 3, sumY / a / 3])
    }

    getBoundingRectangle() {
        let minX = math.Infinity,
            maxX = -math.Infinity,
            minY = math.Infinity,
            maxY = -math.Infinity
        util.forEach(this.points, (noUse, index, collection) => {
            let { x, y } = collection[index]
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
        })
        return new Rectangle(this.owner, minX, minY, maxX - minX, maxY - minY)
    }

    isPointOnPolygon(point: Point) {
        let l = this.getPointCount(),
            cs = this.pointCoordinates,
            c = point.coordinate,
            epsilon = this.owner.getOptions().epsilon,
            ret = false
        util.forEach(util.range(0,l), index => {
            if (coord.isSameAs(c, cs[index], epsilon)) {
                ret = true
                return true // `point` is a vertex
            }
            let c1 = util.nth(cs, index - l)!,
                c2 = util.nth(cs, index - l + 1)!
            if (coord.y(c1) > coord.y(c) !== coord.y(c2) > coord.y(c)) {
                let cp = vec2.cross(vec2.from(c1, c), vec2.from(c1, c2))
                if (math.equalTo(cp, 0, epsilon)) {
                    ret = true
                    return true
                }
            }
        })
        return ret
    }
    isPointInsidePolygon(point: Point) {
        let l = this.getPointCount(),
            cs = this.pointCoordinates,
            c = point.coordinate,
            epsilon = this.owner.getOptions().epsilon,
            ret = false
        util.forEach(util.range(0,l), index => {
            let c1 = util.nth(cs, index - l)!,
                c2 = util.nth(cs, index - l + 1)!
            if (coord.y(c1) > coord.y(c) !== coord.y(c2) > coord.y(c)) {
                let cp = vec2.cross(vec2.from(c1, c), vec2.from(c1, c2))
                if (math.lessThan(cp, 0, epsilon) !== coord.y(c2) < coord.y(c1)) {
                    ret = true
                    return true
                }
            }
        })
        return ret
    }

    isPointOutsidePolygon(point: Point) {
        return !this.isPointInsidePolygon(point) && !this.isPointOnPolygon(point)
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

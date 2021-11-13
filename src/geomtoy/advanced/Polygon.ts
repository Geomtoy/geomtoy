import util from "../utility"
import vec2 from "../utility/vec2"

import Point from "../Point"
import Rectangle from "../Rectangle"
import GeomObject from "../base/GeomObject"
import Geomtoy from ".."
import math from "../utility/math"
import { validAndWithSameOwner } from "../decorator"
import assert from "../utility/assertion"
import coordArray from "../utility/coordinateArray"
import coord from "../utility/coordinate"
import { PolygonVertex } from "../types/polygon"

const minPointCount = 3
class Polygon extends GeomObject {
    private _closed = true
    private _vertices: PolygonVertex[] = []

    constructor(owner: Geomtoy, vertices: PolygonVertex[])
    constructor(owner: Geomtoy, points: Point[])
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

    static readonly events = Object.freeze({
        vertexAdded: "vertexAdded",
        vertexChanged: "vertexChanged",
        vertexRemoved: "vertexRemoved"
    })

    get closed() {
        return this._closed
    }
    set closed(value: boolean) {
        this._closed = value
    }

    get vertices() {
        return util.cloneDeep(this._vertices)
    }
    get vertexCount() {
        return this._vertices.length
    }

    get coordinates() {
        return util.cloneDeep(this._coordinates)
    }

    private get _coordinates() {
        return this._vertices.map(v => v.coordinate)
    }

    static formingCondition = `There should be at least ${minPointCount} distinct vertices in a \`Polygon\`.`

    static fromPoints(points: ([number,number] | Point )[]) {
        // isCoordinateArray(value: any, p: string): asserts value is [number, number][] {
        //     if (!(util.isArray(value) && value.every(c => util.isCoordinate(c)))) {
        //         throw new TypeError(`[G]The \`${p}\` should be an array of coordinate.`)
        //     }
        // },
    }

    private _isPolygonVertex(p: any): p is PolygonVertex {
        if (!util.isPlainObject(p)) return false
        if (Object.keys(p).length !== 2) return false
        if (!p.uuid) return false
        if (!util.isCoordinate(p.coordinate)) return false
        return true
    }
    static vertex(point: [number, number] | Point) {
        assert.isCoordinateOrPoint(point, "point")
        const [x, y] = point instanceof Point ? point.coordinate : point
        return { coordinate: [x, y], uuid: util.uuid() }
    }

    isValid() {
        const cs = this._coordinates
        const l = cs.length
        if (l < minPointCount) return false

        const epsilon = this.options_.epsilon
        const uniques: [number, number][] = [[NaN, NaN]]

        return cs.some(c => {
            if (uniques.every(uc => !coord.isSameAs(uc, c, epsilon))) uniques.push(c)
            if (uniques.length > minPointCount) return true
        })
    }
    /**
     * Move polygon `this` by `deltaX` and `deltaY` to get new polygon.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move polygon `this` itself by `deltaX` and `deltaY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        assert.isRealNumber(deltaX, "deltaX")
        assert.isRealNumber(deltaY, "deltaY")
        if (deltaX === 0 && deltaY === 0) return

        this._vertices.forEach((v, i) => {
            v.coordinate = coord.move(v.coordinate, deltaX, deltaY)
            this.trigger([{ eventName: Polygon.events.vertexChanged, uuid: v.uuid, index: i }])
        })
        return this
    }
    /**
     * Move polygon `this` with `distance` along `angle` to get new polygon.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move polygon `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        assert.isRealNumber(angle, "angle")
        assert.isRealNumber(distance, "distance")
        if (distance === 0) return
        this._vertices.forEach((v, i) => {
            v.coordinate = coord.moveAlongAngle(v.coordinate, angle, distance)
            this.trigger([{ eventName: Polygon.events.vertexChanged, uuid: v.uuid, index: i }])
        })
        return this
    }

    getVertex(index: number): PolygonVertex | null {
        assert.isInteger(index, "index")
        assert.comparison(index, "index", "ge", 0)
        const vtx = this._vertices[index]
        return vtx ? util.cloneDeep(vtx) : null
    }
    setVertex(index: number, vertex: PolygonVertex) {
        if (index > this._vertices.length) return false
        if (this._isPolygonVertex(vertex)) throw new Error("[G]The `vertex` is not a `PolygonVertex`.")
        this.trigger([Polygon.events.vertexChanged])
        this._vertices[index] = util.cloneDeep(vertex)
        return true
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
        return coordArray.remove(this.pointCoordinates, index, minPointCount)
    }

    isPointsConcyclic() {}

    isPointOn(){

    }
    isPointOutside() {}

    isPointInside() {
        
    }
 


    getPerimeter() {
        let p = 0,
            l = this.vertexCount,
            cs = this.pointCoordinates

        util.range(0, l).forEach(index => {
            let c1 = util.nth(cs, index - l)!,
                c2 = util.nth(cs, index - l + 1)!
            p += vec2.magnitude(vec2.from(c1, c2))
        })
        return p
    }

    getArea() {
        let a = 0,
            l = this.vertexCount,
            cs = this.pointCoordinates

        util.range(0, l).forEach(index => {
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
            l = this.vertexCount,
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
            l = this.vertexCount,
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
        this.points.forEach((_, index, collection) => {
            let { x, y } = collection[index]
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
        })
        return new Rectangle(this.owner, minX, minY, maxX - minX, maxY - minY)
    }

    isPointOnPolygon(point: Point) {
        let l = this.vertexCount,
            cs = this.pointCoordinates,
            c = point.coordinate,
            epsilon = this.options_.epsilon,
            ret = false
        util.range(0, l).forEach(index => {
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
        let l = this.vertexCount,
            cs = this.pointCoordinates,
            c = point.coordinate,
            epsilon = this.options_.epsilon,
            ret = false
        util.range(0, l).forEach(index => {
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

    clone() {
        return new Polygon(this.owner, this.pointCoordinates)
    }
    copyFrom(from: GeomObject): this {
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

validAndWithSameOwner(Polygon)
/**
 * @category GeomObject
 */
export default Polygon

import Point from "./Point"
import { Coordinate } from "./types"
import Rectangle from "./Rectangle"
import type from "./utility/type"
import util from "./utility"
import vec2 from "./utility/vec2"

class Polygon {
    #points: Array<Point> | undefined

    constructor(points: Array<Point>)
    constructor(points: Array<Coordinate>)
    constructor(...points: Array<Point>)
    constructor(...points: Array<Coordinate>)
    constructor(points: any) {
        if (util.every(points, p => p instanceof Point)) {
            Object.seal(Object.assign(this, { points }))
            return this
        }
        if (util.every(points, type.isCoordinate)) {
            let ps = util.map(points, c => new Point(c))
            Object.seal(Object.assign(this, { points: ps }))
            return this
        }
        throw new Error(`[G]Arguments can NOT construct a polygon.`)
    }
    get points() {
        return this.#points!
    }
    set points(value) {
        this.#points = value
        if (this.points.length < 3) throw new Error(`[G]The \`points\` of a polygon should have at least 3 points.`)
        if (!util.every(this.points, p => p instanceof Point)) throw new Error(`[G]The \`points\` of a polygon should be an array of points.`)
    }
    get pointCount() {
        return this.points.length
    }

    getPoint(index: number): Point | undefined {
        return util.nth(this.points, index)
    }

    isPointsConcyclic() {}

    getPerimeter() {
        let i = -1,
            l = this.pointCount,
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
            l = this.pointCount,
            ps = this.points
        for (let i = 0; i < l; i++) {
            let j = i === 1 - 1 ? 0 : i + 1,
                {x: x1,y: y1 } = ps[i],
                {x: x2,y: y2 } = ps[j]
            a += vec2.cross([x1, y1], [x2, y2])
        }
        return signed ? a / 2 : Math.abs(a / 2)
    }
    getMeanPoint() {
        let sumX = 0,
            sumY = 0,
            l = this.pointCount,
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
            l = this.pointCount,
            ps = this.points

        for (let i = 0; i < l; i++) {
            let j = i === 1 - 1 ? 0 : i + 1,
                {x: x1, y:y1 } = ps[i],
                {x: x2, y:y2 } = ps[j],
                cp = vec2.cross([x1, y1], [x2, y2])
            a += cp
            sumX += (x1 + x2) * cp
            sumY += (y1 + y2) * cp
        }
        return new Point([sumX / a / 3, sumY / a / 3])
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
        return new Rectangle(minX, minY, maxX - minX, maxY - minY)
    }
}

export default Polygon

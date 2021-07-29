import math from "./utility/math"
import util from "./utility"
import angle from "./utility/angle"
import vec2 from "./utility/vec2"
import type from "./utility/type"

import Point from "./Point"
import Circle from "./Circle"
import Line from "./Line"
import Polygon from "./Polygon"
import { sealed, is, compared } from "./decorator"
import { Coordinate } from "./types"

class RegularPolygon {
    #radius: number | undefined
    #centerPoint: Point | undefined
    #number: number | undefined
    #rotation: number | undefined

    constructor(radius: number, centerX: number, centerY: number, number: number, rotation: number)
    constructor(radius: number, centerPosition: Coordinate | Point, number: number, rotation: number)
    constructor(a1: number, a2?: any, a3?: any, a4?: any, a5?: any) {
        if (type.isNumber(a2) && type.isNumber(a3)) {
            let p = new Point(a2, a3)
            if (a5 === undefined) a5 = 0

            return Object.seal(Object.assign(this, { radius: a1, centerPoint: p, number: a4, angle: a5 }))
        }
        if (type.isCoordinate(a2) || a2 instanceof Point) {
            let p = new Point(a2)
            if (a4 === undefined) a4 = 0
            return Object.seal(Object.assign(this, { radius: a1, centerPoint: p, number: a3, angle: a4 }))
        }
        throw new Error(`[G]Arguments can NOT construct a regular polygon.`)
    }

    @is("positiveNumber")
    get radius() {
        return this.#radius!
    }
    set radius(value) {
        this.#radius = value
    }
    @is("point")
    get centerPoint() {
        return this.#centerPoint!
    }
    set centerPoint(value) {
        this.#centerPoint = value
    }
    @compared("ge", 3)
    @is("integer")
    @is("positiveNumber")
    get number() {
        return this.#number!
    }
    set number(value) {
        this.#number = value
    }
    @is("realNumber")
    get rotation() {
        return this.#rotation!
    }
    set rotation(value) {
        this.#rotation = value
    }

    get points() {
        let ps: Array<Point> = []
        util.forEach(util.range(this.number), i => {
            let p = this.centerPoint.walk(((2 * Math.PI) / this.number) * i + this.rotation, this.radius)
            ps.push(p)
        })
        return ps
    }
    get lines() {
        let ps = this.points,
            ls: Array<Line> = []
        util.forEach(ps, (p, index) => {
            ls.push(Line.fromPoints(util.nth(ps, index - this.number)!, util.nth(ps, index - this.number + 1)!))
        })
        return ls
    }

    getApothem() {
        return this.radius * Math.cos(Math.PI / this.number)
    }
    getEdgeLength() {
        return 2 * this.radius * Math.sin(Math.PI / this.number)
    }
}

export default RegularPolygon

import math from "./utility/math"
import util from "./utility"
import angle from "./utility/angle"
import vec2 from "./utility/vec2"

import Point from "./Point"
import Circle from "./Circle"
import Line from "./Line"
import Polygon from "./Polygon"
import {
    sealed,
    validAndWithSameOwner,
    assertIsRealNumber,
    assertIsCoordinate,
    assertIsPoint,
    assertIsPositiveNumber,
    assertIsInteger,
    assertComparison
} from "./decorator"
import { Direction, GraphicsCommand } from "./types"
import GeomObject from "./base/GeomObject"
import { AreaMeasurable } from "./interfaces"
import Transformation from "./transformation"
import Graphics from "./graphics"
import Geomtoy from "."
import coord from "./utility/coordinate"

@sealed
@validAndWithSameOwner
class RegularPolygon extends GeomObject implements AreaMeasurable {
    #radius: number = NaN
    #centerCoordinate: [number, number] = [NaN, NaN]
    #sideCount: number = NaN
    #rotation: number = NaN
    #windingDirection: Direction = "positive"

    constructor(owner: Geomtoy, radius: number, centerX: number, centerY: number, sideCount: number, rotation?: number)
    constructor(owner: Geomtoy, radius: number, centerCoordinate: [number, number], sideCount: number, rotation?: number)
    constructor(owner: Geomtoy, radius: number, centerPosition: Point, sideCount: number, rotation?: number)
    constructor(o: Geomtoy, a1: number, a2?: any, a3?: any, a4?: any, a5?: any) {
        super(o)
        if (util.isNumber(a2)) {
            return Object.seal(Object.assign(this, { radius: a1, centerX: a2, centerY: a3, sideCount: a4, rotation: a5 ?? 0 }))
        }
        if (util.isArray(a2)) {
            return Object.seal(Object.assign(this, { radius: a1, centerCoordinate: a2, sideCount: a3, rotation: a4 ?? 0 }))
        }
        if (a2 instanceof Point) {
            return Object.seal(Object.assign(this, { radius: a1, centerPoint: a2, sideCount: a3, rotation: a4 ?? 0 }))
        }
        throw new Error("[G]Arguments can NOT construct a `RegularPolygon`.")
    }

    get centerX() {
        return coord.x(this.#centerCoordinate)
    }
    set centerX(value) {
        assertIsRealNumber(value, "centerX")
        coord.x(this.#centerCoordinate, value)
    }
    get centerY() {
        return coord.y(this.#centerCoordinate)
    }
    set centerY(value) {
        assertIsRealNumber(value, "centerY")
        coord.y(this.#centerCoordinate, value)
    }
    get centerCoordinate() {
        return this.#centerCoordinate
    }
    set centerCoordinate(value) {
        assertIsCoordinate(value, "centerCoordinate")
        coord.assign(this.#centerCoordinate, value)
    }
    get centerPoint() {
        return new Point(this.owner, this.#centerCoordinate)
    }
    set centerPoint(value) {
        assertIsPoint(value, "centerPoint")
        coord.assign(this.#centerCoordinate, value.coordinate)
    }
    get radius() {
        return this.#radius
    }
    set radius(value) {
        assertIsPositiveNumber(value, "radius")
        this.#radius = value
    }
    get sideCount() {
        return this.#sideCount
    }
    set sideCount(value) {
        assertIsRealNumber(value, "sideCount")
        assertIsInteger(value, "sideCount")
        assertComparison(value, "sideCount", "ge", 3)
        this.#sideCount = value
    }
    get rotation() {
        return this.#rotation
    }
    set rotation(value) {
        assertIsRealNumber(value,"rotation")
        this.#rotation = value
    }

    get apothem() {
        return this.radius * math.cos(Math.PI / this.sideCount)
    }
    get sideLength() {
        return 2 * this.radius * math.sin(Math.PI / this.sideCount)
    }
    get centralAngle() {
        return (2 * Math.PI) / this.sideCount
    }
    get interiorAngle() {
        return Math.PI - (2 * Math.PI) / this.sideCount
    }
    get sumOfInteriorAngle() {
        return Math.PI * (this.sideCount - 2)
    }
    get exteriorAngle() {
        return (2 * Math.PI) / this.sideCount
    }
    get sumOfExteriorAngle() {
        return 2 * Math.PI
    }
    get diagonalCount() {
        let n = this.sideCount
        return (n * (n - 3)) / 2
    }
    isValid() {
        let valid = true
        valid &&= coord.isValid(this.centerCoordinate)
        valid &&= util.isRealNumber(this.radius) && this.radius > 0
        valid &&= util.isInteger(this.sideCount) && this.sideCount >= 3
        return valid
    }
    getWindingDirection() {
        return this.#windingDirection
    }
    setWindingDirection(direction: Direction) {
        this.#windingDirection = direction
    }

    static fromApothemEtc(owner: Geomtoy, apothem: number, centerPoint: Point, sideCount: number, rotation: number = 0) {
        let r = apothem / math.cos(Math.PI / sideCount)
        return new RegularPolygon(owner, r, centerPoint, sideCount, rotation)
    }
    static fromSideLengthEtc(owner: Geomtoy, sideLength: number, centerPoint: Point, sideCount: number, rotation: number = 0) {
        let r = sideLength / math.sin(Math.PI / sideCount) / 2
        return new RegularPolygon(owner, r, centerPoint, sideCount, rotation)
    }

    getPoints() {
        let ps: Array<Point> = []
        util.forEach(util.range(0, this.sideCount), i => {
            let p = this.centerPoint.moveAlongAngle(((2 * Math.PI) / this.sideCount) * i + this.rotation, this.radius)
            ps.push(p)
        })
        return ps
    }
    getLines() {
        let ps = this.getPoints(),
            ls: Array<Line> = []
        util.forEach(util.range(0, this.sideCount), i => {
            ls.push(Line.fromTwoPoints(this.owner, util.nth(ps, i - this.sideCount)!, util.nth(ps, i - this.sideCount + 1)!))
        })
        return ls
    }

    getCircumscribedCircle() {
        return new Circle(this.owner, this.radius, this.centerPoint)
    }
    getInscribedCircle() {
        return new Circle(this.owner, this.apothem, this.centerPoint)
    }

    getPerimeter(): number {
        return this.sideCount * this.sideLength
    }
    getArea(): number {
        let p = this.getPerimeter()
        return (p * this.apothem) / 2
    }
    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    clone() {
        return new RegularPolygon(this.owner, this.radius, this.centerCoordinate, this.sideCount, this.rotation)
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
    toObject(): object {
        throw new Error("Method not implemented.")
    }
    toArray(): any[] {
        throw new Error("Method not implemented.")
    }
    getGraphics(): GraphicsCommand[] {
        const g = new Graphics()
        const ps = this.getPoints()
        g.moveTo(...util.head(ps)?.coordinate!)
        util.forEach(util.range(1, this.sideCount), i => {
            g.lineTo(...ps[i].coordinate)
        })
        g.close()
        return g.commands
    }
}

/**
 * @category GeomObject
 */
export default RegularPolygon

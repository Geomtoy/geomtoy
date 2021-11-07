import math from "./utility/math"
import util from "./utility"
import angle from "./utility/angle"
import vec2 from "./utility/vec2"

import Point from "./Point"
import Circle from "./Circle"
import Line from "./Line"
import Polygon from "./advanced/Polygon"
import { validAndWithSameOwner } from "./decorator"
import assert from "./utility/assertion"
import { Direction, GraphicsCommand } from "./types"
import GeomObject from "./base/GeomObject"
import { AreaMeasurable, Shape } from "./interfaces"
import Transformation from "./transformation"
import Graphics from "./graphics"
import Geomtoy from "."
import coord from "./utility/coordinate"

const regularPolygonMinSideCount = 3
class RegularPolygon extends GeomObject implements Shape, AreaMeasurable {
    private _radius: number = NaN
    private _centerCoordinate: [number, number] = [NaN, NaN]
    private _sideCount: number = NaN
    private _rotation: number = 0
    private _windingDirection: Direction = "positive"

    constructor(owner: Geomtoy, centerX: number, centerY: number, radius: number, sideCount: number, rotation?: number)
    constructor(owner: Geomtoy, centerCoordinate: [number, number], radius: number, sideCount: number, rotation?: number)
    constructor(owner: Geomtoy, centerPoint: Point, radius: number, sideCount: number, rotation?: number)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { centerX: a1, centerY: a2, radius: a3, sideCount: a4, rotation: a5 ?? 0 })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { centerCoordinate: a1, radius: a2, sideCount: a3, rotation: a4 ?? 0 })
        }
        if (a2 instanceof Point) {
            Object.assign(this, { centerPoint: a1, radius: a2, sideCount: a3, rotation: a4 ?? 0 })
        }
        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        centerXChanged: "centerXChanged",
        centerYChanged: "centerYChanged",
        radiusChanged: "radiusChanged",
        sideCountChanged: "sideCountChanged",
        rotationChanged: "rotationChanged"
    })

    private _setCenterX(value: number) {
        this.willTrigger_(coord.x(this._centerCoordinate), value, [RegularPolygon.events.centerXChanged])
        coord.x(this._centerCoordinate, value)
    }
    private _setCenterY(value: number) {
        this.willTrigger_(coord.y(this._centerCoordinate), value, [RegularPolygon.events.centerYChanged])
        coord.y(this._centerCoordinate, value)
    }
    private _setRadius(value: number) {
        this.willTrigger_(this._radius, value, [RegularPolygon.events.radiusChanged])
        this._radius = value
    }
    private _setSideCount(value: number) {
        this.willTrigger_(this._sideCount, value, [RegularPolygon.events.sideCountChanged])
        this._sideCount = value
    }
    private _setRotation(value: number) {
        this.willTrigger_(this._rotation, value, [RegularPolygon.events.rotationChanged])
        this._rotation = value
    }

    get centerX() {
        return coord.x(this._centerCoordinate)
    }
    set centerX(value) {
        assert.isRealNumber(value, "centerX")
        this._setCenterX(value)
    }
    get centerY() {
        return coord.y(this._centerCoordinate)
    }
    set centerY(value) {
        assert.isRealNumber(value, "centerY")
        this._setCenterY(value)
    }
    get centerCoordinate() {
        return coord.clone(this._centerCoordinate)
    }
    set centerCoordinate(value) {
        assert.isCoordinate(value, "centerCoordinate")
        this._setCenterX(coord.x(value))
        this._setCenterY(coord.y(value))
    }
    get centerPoint() {
        return new Point(this.owner, this._centerCoordinate)
    }
    set centerPoint(value) {
        assert.isPoint(value, "centerPoint")
        this._setCenterX(value.x)
        this._setCenterY(value.y)
    }
    get radius() {
        return this._radius
    }
    set radius(value) {
        assert.isPositiveNumber(value, "radius")
        this._setRadius(value)
    }
    get sideCount() {
        return this._sideCount
    }
    set sideCount(value) {
        assert.isInteger(value, "sideCount")
        assert.comparison(value, "sideCount", "ge", regularPolygonMinSideCount)
        this._setSideCount(value)
    }
    get rotation() {
        return this._rotation
    }
    set rotation(value) {
        assert.isRealNumber(value, "rotation")
        this._setRotation(value)
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
    get diagonalCount() {
        let n = this.sideCount
        return (n * (n - 3)) / 2
    }
    isValid() {
        if (!coord.isValid(this._centerCoordinate)) return false
        if (!util.isPositiveNumber(this._radius)) return false
        if (!util.isInteger(this._sideCount || this._sideCount < 3)) return false
        return true
    }
    getWindingDirection() {
        return this._windingDirection
    }
    setWindingDirection(direction: Direction) {
        this._windingDirection = direction
    }

    /**
     * Move regular polygon `this` by `offsetX` and `offsetY` to get new regular polygon.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move regular polygon `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.centerCoordinate = coord.move(this.centerCoordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move regular polygon `this` with `distance` along `angle` to get new regular polygon.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move regular polygon `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.centerCoordinate = coord.moveAlongAngle(this.centerCoordinate, angle, distance)
        return this
    }

    static fromApothemEtc(owner: Geomtoy, apothem: number, centerCoordinate: [number, number], sideCount: number, rotation: number = 0) {
        let r = apothem / math.cos(Math.PI / sideCount)
        return new RegularPolygon(owner, centerCoordinate, r, sideCount, rotation)
    }
    static fromSideLengthEtc(owner: Geomtoy, sideLength: number, centerCoordinate: [number, number], sideCount: number, rotation: number = 0) {
        let r = sideLength / math.sin(Math.PI / sideCount) / 2
        return new RegularPolygon(owner, centerCoordinate, r, sideCount, rotation)
    }

    getPoints() {
        let ps: Point[] = []
        util.range(0, this.sideCount).forEach(index => {
            let p = this.centerPoint.moveAlongAngle(((2 * Math.PI) / this.sideCount) * index + this.rotation, this.radius)
            ps.push(p)
        })
        return ps
    }
    getLines() {
        let ps = this.getPoints(),
            ls: Line[] = []
        util.range(0, this.sideCount).forEach(index => {
            ls.push(Line.fromTwoPoints.bind(this)(this.owner, util.nth(ps, index - this.sideCount)!, util.nth(ps, index - this.sideCount + 1)!))
        })
        return ls
    }

    getCircumscribedCircle() {
        return new Circle(this.owner, this.centerCoordinate, this.radius)
    }
    getInscribedCircle() {
        return new Circle(this.owner, this.centerCoordinate, this.apothem)
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
        return new RegularPolygon(this.owner, this.centerCoordinate, this.radius, this.sideCount, this.rotation)
    }
    copyFrom(regularPolygon: RegularPolygon | null) {
        if (regularPolygon === null) regularPolygon = new RegularPolygon(this.owner)
        this._setCenterX(coord.x(regularPolygon._centerCoordinate))
        this._setCenterY(coord.y(regularPolygon._centerCoordinate))
        this._setRadius(regularPolygon._radius)
        this._setSideCount(regularPolygon._sideCount)
        this._setRotation(regularPolygon._rotation)
        return this
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
        g.moveTo(...util.head(ps)!.coordinate!)
        util.range(1, this.sideCount).forEach(index => {
            g.lineTo(...ps[index].coordinate)
        })
        g.close()
        return g.commands
    }
}

validAndWithSameOwner(RegularPolygon)

/**
 * @category GeomObject
 */
export default RegularPolygon

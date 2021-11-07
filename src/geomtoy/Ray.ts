import vec2 from "./utility/vec2"
import util from "./utility"
import angle from "./utility/angle"
import math from "./utility/math"
import { validAndWithSameOwner } from "./decorator"
import assert from "./utility/assertion"
import Point from "./Point"
import LineSegment from "./LineSegment"
import { GraphicsCommand } from "./types"
import GeomObject from "./base/GeomObject"
import Graphics from "./graphics"
import Transformation from "./transformation"
import Geomtoy from "."
import coord from "./utility/coordinate"
import { Visible } from "./interfaces"
import Line from "./Line"

class Ray extends GeomObject implements Visible {
    private _coordinate: [number, number] = [NaN, NaN]
    private _angle: number = NaN

    constructor(owner: Geomtoy, x: number, y: number, angle: number)
    constructor(owner: Geomtoy, coordinate: [number, number], angle: number)
    constructor(owner: Geomtoy, point: Point, angle: number)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { x: a1, y: a2, angle: a3 })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { coordinate: a1, angle: a2 })
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point: a1, angle: a2 })
        }
        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        xChanged: "xChanged",
        yChanged: "yChanged",
        angleChanged: "angleChanged"
    })

    private _setX(value: number) {
        this.willTrigger_(coord.x(this._coordinate), value, [Ray.events.xChanged])
        coord.x(this._coordinate, value)
    }
    private _setY(value: number) {
        this.willTrigger_(coord.y(this._coordinate), value, [Ray.events.yChanged])
        coord.y(this._coordinate, value)
    }
    private _setAngle(value: number) {
        this.willTrigger_(this._angle, value, [Ray.events.angleChanged])
        this._angle = value
    }

    get x() {
        return coord.x(this._coordinate)
    }
    set x(value) {
        assert.isRealNumber(value, "x")
        this._setX(value)
    }
    get y() {
        return coord.y(this._coordinate)
    }
    set y(value) {
        assert.isRealNumber(value, "y")
        this._setY(value)
    }
    get coordinate() {
        return coord.clone(this._coordinate)
    }
    set coordinate(value) {
        assert.isCoordinate(value, "coordinate")
        this._setX(coord.x(value))
        this._setY(coord.y(value))
    }
    get point() {
        return new Point(this.owner, this._coordinate)
    }
    set point(value) {
        assert.isPoint(value, "point")
        this._setX(value.x)
        this._setY(value.y)
    }
    get angle() {
        return this._angle
    }
    set angle(value) {
        assert.isRealNumber(value, "angle")
        this._setAngle(value)
    }

    isValid(): boolean {
        if (!coord.isValid(this._coordinate)) return false
        if (!util.isRealNumber(this._angle)) return false
        return true
    }

    /**
     * Get the `n` section(equal) rays of the angle which is formed by rays `ray1` and `ray2`.
     * @description
     * If `n` is not integer, return `null`.
     * If `ray1` and `ray2` have different endpoint, return `null`.
     * @param n
     * @param ray1
     * @param ray2
     */
    static getAngleNSectionRaysFromTwoRays(owner: Geomtoy, n: number, ray1: Ray, ray2: Ray): Ray[] | null {
        if (!util.isInteger(n) || n < 2) return null
        if (!ray1.isEndpointSameAs(ray2)) return null
        let a1 = ray1.angle,
            a2 = ray2.angle,
            c = ray1.coordinate,
            d = (a2 - a1) / n,
            ret: Ray[] = []
        util.range(1, n).forEach(index => {
            ret.push(new Ray(owner, c, a1 + d * index))
        })
        return ret
    }

    isSameAs(ray: Ray) {
        const epsilon = this.options_.epsilon
        return coord.isSameAs(this.coordinate, ray.coordinate, epsilon) && math.equalTo(this.angle, ray.angle, epsilon), epsilon
    }
    isEndpointSameAs(ray: Ray) {
        const epsilon = this.options_.epsilon
        return coord.isSameAs(this.coordinate, ray.coordinate, epsilon)
    }

    /**
     * Move ray `this` by `offsetX` and `offsetY` to get new ray.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move ray `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.coordinate = coord.move(this.coordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move ray `this` with `distance` along `angle` to get new ray.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move ray `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.coordinate = coord.moveAlongAngle(this.coordinate, angle, distance)
        return this
    }

    getAngleToRay(ray: Ray) {
        return angle.simplify2(this.angle - ray.angle)
    }

    getUnderlyingLine() {
        return Line.fromPointAndAngle(this.owner, this.point, this.angle)
    }

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    getGraphics(): GraphicsCommand[] {
        throw new Error("Method not implemented.")
    }

    clone() {
        return new Ray(this.owner, this.coordinate, this.angle)
    }
    copyFrom(ray: Ray | null) {
        if (ray === null) ray = new Ray(this.owner)
        this._setX(coord.x(ray._coordinate))
        this._setY(coord.y(ray._coordinate))
        this._setAngle(ray._angle)
        return this
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

validAndWithSameOwner(Ray)
/**
 * @category GeomObject
 */
export default Ray

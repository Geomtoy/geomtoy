import Graphics from "./graphics"
import Point from "./Point"
import Vector from "./Vector"
import util from "./utility"
import { Direction } from "./types"
import { validAndWithSameOwner } from "./decorator"
import assert from "./utility/assertion"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import Geomtoy from "."
import { AreaMeasurable } from "./interfaces"
import coord from "./utility/coordinate"

class Ellipse extends GeomObject implements AreaMeasurable {
    private _centerCoordinate: [number, number] = [NaN, NaN]
    private _radiusX: number = NaN
    private _radiusY: number = NaN
    private _rotation: number = NaN
    private _windingDirection: Direction = "positive"

    constructor(owner: Geomtoy, centerX: number, centerY: number, radiusX: number, radiusY: number, rotation?: number)
    constructor(owner: Geomtoy, centerCoordinate: [number, number], radiusX: number, radiusY: number, rotation?: number)
    constructor(owner: Geomtoy, centerPoint: Point, radiusX: number, radiusY: number, rotation?: number)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { centerX: a1, centerY: a2, radiusX: a3, radiusY: a4, rotation: a5 ?? 0 })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { centerCoordinate: a1, radiusX: a2, radiusY: a3, rotation: a4 ?? 0 })
        }
        if (a1 instanceof Point) {
            Object.assign(this, { centerPoint: a1, radiusX: a2, radiusY: a3, rotation: a4 ?? 0 })
        }
        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        centerXChanged: "centerXChanged",
        centerYChanged: "centerYChanged",
        radiusXChanged: "radiusXChanged",
        radiusYChanged: "radiusYChanged",
        rotationChanged: "rotationChanged"
    })

    private _setCenterX(value: number) {
        this.willTrigger_(coord.x(this._centerCoordinate), value, [Ellipse.events.centerXChanged])
        coord.x(this._centerCoordinate, value)
    }
    private _setCenterY(value: number) {
        this.willTrigger_(coord.y(this._centerCoordinate), value, [Ellipse.events.centerYChanged])
        coord.y(this._centerCoordinate, value)
    }
    private _setRadiusX(value: number) {
        this.willTrigger_(this._radiusX, value, [Ellipse.events.radiusXChanged])
        this._radiusX = value
    }
    private _setRadiusY(value: number) {
        this.willTrigger_(this._radiusY, value, [Ellipse.events.radiusYChanged])
        this._radiusY = value
    }
    private _setRotation(value: number) {
        this.willTrigger_(this._rotation, value, [Ellipse.events.rotationChanged])
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
    get radiusX() {
        return this._radiusX
    }
    set radiusX(value) {
        assert.isPositiveNumber(value, "radiusX")
        this._setRadiusX(value)
    }
    get radiusY() {
        return this._radiusY
    }
    set radiusY(value) {
        assert.isPositiveNumber(value, "radiusY")
        this._setRadiusY(value)
    }
    get rotation() {
        return this._rotation
    }
    set rotation(value) {
        assert.isRealNumber(value, "rotation")
        this._setRotation(value)
    }

    isValid() {
        const [cc, rx, ry] = [this._centerCoordinate, this._radiusX, this._radiusY]
        if (!coord.isValid(cc)) return false
        if (!util.isPositiveNumber(rx)) return false
        if (!util.isPositiveNumber(ry)) return false
        return true
    }

    /**
     * Move ellipse `this` by `offsetX` and `offsetY` to get new ellipse.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move ellipse `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.centerCoordinate = coord.move(this.centerCoordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move ellipse `this` with `distance` along `angle` to get new ellipse.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move ellipse `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.centerCoordinate = coord.moveAlongAngle(this.centerCoordinate, angle, distance)
        return this
    }

    getWindingDirection() {
        return this._windingDirection
    }
    setWindingDirection(direction: Direction) {
        this._windingDirection = direction
    }

    getEccentricity() {}

    clone() {
        return new Ellipse(this.owner, this.centerCoordinate, this.radiusX, this.radiusY, this.rotation)
    }
    copyFrom(ellipse: Ellipse | null) {
        if (ellipse === null) ellipse = new Ellipse(this.owner)
        this._setCenterX(coord.x(ellipse._centerCoordinate))
        this._setCenterY(coord.y(ellipse._centerCoordinate))
        this._setRadiusX(ellipse._radiusX)
        this._setRadiusY(ellipse._radiusY)
        this._setRotation(ellipse._rotation)
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

    getGraphics() {
        const { centerX, centerY, radiusX, radiusY, rotation } = this
        const g = new Graphics()
        g.centerArcTo(centerX, centerY, radiusX, radiusY, rotation, 0, 2 * Math.PI)
        return g.commands
    }

    //https://www.coder.work/article/1220553
    static findTangentLineOfTwoEllipse(ellipse1: Ellipse, ellipse2: Ellipse) {}

    //https://zhuanlan.zhihu.com/p/64550850
    static findTangentLineOfEllipseAndParabola() {}

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    getPerimeter(): number {
        throw new Error("Method not implemented.")
    }
    getArea(): number {
        throw new Error("Method not implemented.")
    }

    getGraphicsAlt() {
        /**
         * @see https://www.tinaja.com/glib/ellipse4.pdf
         */
        const kappa = 0.551784 //or 0.5522848
        const { centerX: cx, centerY: cy, radiusX: rx, radiusY: ry, rotation } = this
        const ox = rx * kappa // x axis control point offset
        const oy = ry * kappa // y axis control point offset

        let g = new Graphics()
        g.moveTo(cx - rx, cy)
            .bezierCurveTo(cx - rx, cy - oy, cx - ox, cy - ry, cx, cy - ry)
            .bezierCurveTo(cx + ox, cy - ry, cx + rx, cy - oy, cx + rx, cy)
            .bezierCurveTo(cx + rx, cy + oy, cx + ox, cy + ry, cx, cy + ry)
            .bezierCurveTo(cx - ox, cy + ry, cx - rx, cy + oy, cx - rx, cy)

        return g.commands
    }
}

validAndWithSameOwner(Ellipse)
/**
 * @category GeomObject
 */
export default Ellipse

import Graphic from "./graphic"
import Point from "./Point"
import Vector from "./Vector"
import util from "./utility"
import { GraphicImplType } from "./types"
import { is, sealed, validAndWithSameOwner } from "./decorator"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import Geomtoy from "."
import { AreaMeasurable } from "./interfaces"
import coord from "./utility/coordinate"

@sealed
@validAndWithSameOwner
class Ellipse extends GeomObject implements AreaMeasurable {
    #centerCoordinate: [number, number] = [NaN, NaN]
    #radiusX: number = NaN
    #radiusY: number = NaN
    #rotation: number = NaN

    constructor(owner: Geomtoy, centerX: number, centerY: number, radiusX: number, radiusY: number, rotation?: number)
    constructor(owner: Geomtoy, centerCoordinate: [number, number], radiusX: number, radiusY: number, rotation?: number)
    constructor(owner: Geomtoy, centerPoint: Point, radiusX: number, radiusY: number, rotation?: number)
    constructor(o: Geomtoy, a1: any, a2: any, a3: any, a4?: any, a5?: any) {
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

    @is("realNumber")
    get centerX() {
        return coord.x(this.#centerCoordinate)
    }
    set centerX(value) {
        coord.x(this.#centerCoordinate, value)
    }
    @is("realNumber")
    get centerY() {
        return coord.y(this.#centerCoordinate)
    }
    set centerY(value) {
        coord.y(this.#centerCoordinate, value)
    }
    @is("coordinate")
    get centerCoordinate() {
        return coord.copy(this.#centerCoordinate)
    }
    set centerCoordinate(value) {
        coord.assign(this.#centerCoordinate, value)
    }
    @is("point")
    get centerPoint() {
        return new Point(this.owner, this.#centerCoordinate)
    }
    set centerPoint(value) {
        coord.assign(this.#centerCoordinate, value.coordinate)
    }
    @is("positiveNumber")
    get radiusX() {
        return this.#radiusX
    }
    set radiusX(value) {
        this.#radiusX = value
    }
    @is("positiveNumber")
    get radiusY() {
        return this.#radiusY
    }
    set radiusY(value) {
        this.#radiusY = value
    }
    @is("realNumber")
    get rotation() {
        return this.#rotation
    }
    set rotation(value) {
        this.#rotation = value
    }

    isValid() {
        let valid = true
        valid &&= coord.isValid(this.centerCoordinate)
        valid &&= util.isRealNumber(this.radiusX) && this.radiusX > 0
        valid &&= util.isRealNumber(this.radiusY) && this.radiusY > 0
        return valid
    }
    
    getEccentricity() {}

    clone(): GeomObject {
        throw new Error("Method not implemented.")
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

    getGraphic(type: GraphicImplType) {
        let x = this.centerPoint.x,
            y = this.centerPoint.y,
            rx = this.radiusX,
            ry = this.radiusY,
            g = new Graphic()
        g.moveTo(0, 0)
            //let graphic decide the start point itself
            .centerArcTo(x, y, rx, ry, 0, 2 * Math.PI, 0)
        return g.valueOf(type)
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

    getGraphicAlt(type: GraphicImplType) {
        /**
         * @see https://www.tinaja.com/glib/ellipse4.pdf
         */
        const kappa = 0.551784 //or 0.5522848
        let x = this.centerPoint.x,
            y = this.centerPoint.y,
            rx = this.radiusX,
            ry = this.radiusY,
            ox = rx * kappa, // x axis control point offset
            oy = ry * kappa // y axis control point offset
        let g = new Graphic()
        g.moveTo(x - rx, y)
            .bezierCurveTo(x - rx, y - oy, x - ox, y - ry, x, y - ry)
            .bezierCurveTo(x + ox, y - ry, x + rx, y - oy, x + rx, y)
            .bezierCurveTo(x + rx, y + oy, x + ox, y + ry, x, y + ry)
            .bezierCurveTo(x - ox, y + ry, x - rx, y + oy, x - rx, y)

        return g.valueOf(type)
    }
}

/**
 *
 * @category GeomObject
 */
export default Ellipse

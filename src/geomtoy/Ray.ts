import vec2 from "./utility/vec2"
import util from "./utility"
import angle from "./utility/angle"
import math from "./utility/math"
import { is, sealed, validAndWithSameOwner } from "./decorator"

import Point from "./Point"
import Segment from "./Segment"
import { CanvasDirective, GraphicImplType, SvgDirective } from "./types"
import GeomObject from "./base/GeomObject"
import Graphic from "./graphic"
import Transformation from "./transformation"
import Geomtoy from "."
import coord from "./helper/coordinate"
import { Visible } from "./interfaces"
import Line from "./Line"

@sealed
@validAndWithSameOwner
class Ray extends GeomObject implements Visible {
    #coordinate: [number, number] = [NaN, NaN]
    #angle: number = NaN

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

    @is("realNumber")
    get x() {
        return coord.x(this.#coordinate)
    }
    set x(value) {
        coord.x(this.#coordinate, value)
    }
    @is("realNumber")
    get y() {
        return coord.y(this.#coordinate)
    }
    set y(value) {
        coord.y(this.#coordinate, value)
    }
    @is("coordinate")
    get coordinate() {
        return coord.copy(this.#coordinate)
    }
    set coordinate(value) {
        coord.assign(this.#coordinate, value)
    }
    @is("point")
    get point() {
        return new Point(this.owner, this.#coordinate)
    }
    set point(value) {
        coord.assign(this.#coordinate, value.coordinate)
    }
    @is("realNumber")
    get angle() {
        return this.#angle
    }
    set angle(value) {
        this.#angle = angle.simplify2(value)
    }

    isValid(): boolean {
        return coord.isValid(this.#coordinate)
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
    static getAngleNSectionRaysFromTwoRays(owner: Geomtoy, n: number, ray1: Ray, ray2: Ray): Array<Ray> | null {
        if (!util.isInteger(n) || n < 2) return null
        if (!ray1.isEndpointSameAs(ray2)) return null
        let a1 = ray1.angle,
            a2 = ray2.angle,
            vertex = ray1.point,
            d = (a2 - a1) / n,
            ret: Array<Ray> = []
        util.forEach(util.range(1, n), i => {
            ret.push(new Ray(owner, vertex, a1 + d * i))
        })
        return ret
    }

    isSameAs(ray: Ray) {
        let epsilon = this.owner.getOptions().epsilon
        return coord.isSameAs(this.coordinate, ray.coordinate, epsilon) && math.equalTo(this.angle, ray.angle, epsilon), epsilon
    }
    isEndpointSameAs(ray: Ray) {
        let epsilon = this.owner.getOptions().epsilon
        return coord.isSameAs(this.coordinate, ray.coordinate, epsilon)
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
    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[] {
        throw new Error("Method not implemented.")
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

export default Ray

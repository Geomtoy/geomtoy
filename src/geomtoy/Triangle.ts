import util from "./utility"

import Point from "./Point"
import Circle from "./Circle"
import GeomObject from "./base/GeomObject"
import { CanvasDirective, GraphicImplType, SvgDirective } from "./types"
import Transformation from "./transformation"

import { is, sameOwner, sealed } from "./decorator"
import Geomtoy from "."
import coord from "./helper/coordinate"

@sealed
class Triangle extends GeomObject {
    #name = "Triangle"
    #uuid = util.uuid()

    #point1Coordinate: [number, number] = [NaN, NaN]
    #point2Coordinate: [number, number] = [NaN, NaN]
    #point3Coordinate: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number, point3X: number, point3Y: number)
    constructor(owner: Geomtoy, point1Coordinate: [number, number], point2Coordinate: [number, number], point3Coordinate: [number, number])
    constructor(owner: Geomtoy, point1: Point, point2: Point, point3: Point)
    constructor(o: Geomtoy, a1: any, a2: any, a3: any, a4?: any, a5?: any, a6?: any) {
        super(o)
        if (util.every([a1, a2, a3, a4, a5, a6], util.isNumber)) {
            return Object.seal(util.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4, point3X: a5, point3Y: a6 }))
        }

        if (util.isCoordinate(a1) && util.isCoordinate(a2) && util.isCoordinate(a3)) {
            return Object.seal(util.assign(this, { point1Coordinate: a1, point2Coordinate: a2, point3Coordinate: a3 }))
        }

        if (a1 instanceof Point && a2 instanceof Point && a3 instanceof Point) {
            return Object.seal(util.assign(this, { point1: a1, point2: a2, point3: a3 }))
        }

        throw new Error("[G]Arguments can NOT construct a `Triangle`.")
    }

    get name() {
        return this.#name
    }
    get uuid() {
        return this.#uuid
    }

    @is("realNumber")
    get point1X() {
        return coord.x(this.#point1Coordinate)
    }
    set point1X(value) {
        coord.x(this.#point1Coordinate, value)
        this.#guard()
    }
    @is("realNumber")
    get point1Y() {
        return coord.y(this.#point1Coordinate)
    }
    set point1Y(value) {
        coord.y(this.#point1Coordinate, value)
        this.#guard()
    }
    @is("coordinate")
    get point1Coordinate() {
        return coord.copy(this.#point1Coordinate)
    }
    set point1Coordinate(value) {
        coord.assign(this.#point1Coordinate, value)
        this.#guard()
    }
    @sameOwner
    @is("point")
    get point1() {
        return new Point(this.owner, this.#point1Coordinate)
    }
    set point1(value) {
        coord.assign(this.#point1Coordinate, value.coordinate)
        this.#guard()
    }
    @is("realNumber")
    get point2X() {
        return coord.x(this.#point2Coordinate)
    }
    set point2X(value) {
        coord.x(this.#point2Coordinate, value)
        this.#guard()
    }
    @is("realNumber")
    get point2Y() {
        return coord.y(this.#point2Coordinate)
    }
    set point2Y(value) {
        coord.y(this.#point2Coordinate, value)
        this.#guard()
    }
    @is("coordinate")
    get point2Coordinate() {
        return coord.copy(this.#point2Coordinate)
    }
    set point2Coordinate(value) {
        coord.assign(this.#point2Coordinate, value)
        this.#guard()
    }
    @sameOwner
    @is("point")
    get point2() {
        return new Point(this.owner, this.#point2Coordinate)
    }
    set point2(value) {
        coord.assign(this.#point2Coordinate, value.coordinate)
        this.#guard()
    }
    @is("realNumber")
    get point3X() {
        return coord.x(this.#point3Coordinate)
    }
    set point3X(value) {
        coord.x(this.#point3Coordinate, value)
        this.#guard()
    }
    @is("realNumber")
    get point3Y() {
        return coord.y(this.#point3Coordinate)
    }
    set point3Y(value) {
        coord.y(this.#point3Coordinate, value)
        this.#guard()
    }
    @is("coordinate")
    get point3Coordinate() {
        return coord.copy(this.#point3Coordinate)
    }
    set point3Coordinate(value) {
        coord.assign(this.#point3Coordinate, value)
        this.#guard()
    }
    @sameOwner
    @is("point")
    get point3() {
        return new Point(this.owner, this.#point3Coordinate)
    }
    set point3(value) {
        coord.assign(this.#point3Coordinate, value.coordinate)
        this.#guard()
    }

    #guard() {
        let epsilon = this.owner.getOptions().epsilon
        if (
            coord.isSameAs(this.point1Coordinate, this.point2Coordinate, epsilon) ||
            coord.isSameAs(this.point1Coordinate, this.point3Coordinate, epsilon) ||
            coord.isSameAs(this.point2Coordinate, this.point3Coordinate, epsilon)
        ) {
            throw new Error("[G]The three vertices of a `Triangle` should be distinct.")
        }
    }

    //内切圆
    getInscribedCircle() {
        let pA = this.point1,
            pB = this.point2,
            pC = this.point3,
            lA = pB.getDistanceBetweenPoint(pC),
            lB = pA.getDistanceBetweenPoint(pC),
            lC = pA.getDistanceBetweenPoint(pB),
            d = lA + lB + lC, //周长
            p = d / 2, //半周长
            s = Math.sqrt(p * (p - lA) * (p - lB) * (p - lC)), //海伦公式
            cx = (lA * pA.x + lB * pB.x + lC * pC.x) / d,
            cy = (lA * pA.y + lB * pB.y + lC * pC.y) / d,
            r = (2 * s) / d
        return new Circle(this.owner,r, cx, cy)
    }
    //旁切圆
    getEscribedCircles() {}
    //外接圆
    getCircumscribedCircle() {}

    getArea(signed = false) {
        let a = 0,
            { x: x1, y: y1 } = this.point1,
            { x: x2, y: y2 } = this.point2,
            { x: x3, y: y3 } = this.point3
        a = x1 * y2 - x1 * y3 + x2 * y3 - x2 * y1 + x3 * y1 - x2 * y2
        return signed ? a : Math.abs(a)
    }
    getCentroidPoint() {
        let { x: x1, y: y1 } = this.point1,
            { x: x2, y: y2 } = this.point2,
            { x: x3, y: y3 } = this.point3,
            x = (x1 + x2 + x3) / 3,
            y = (y1 + y2 + y3) / 3
        return new Point(this.owner,x, y)
    }
    getCircumscribedCircleCenterPoint() {
        let { x: x1, y: y1 } = this.point1,
            { x: x2, y: y2 } = this.point2,
            { x: x3, y: y3 } = this.point3,
            a1 = 2 * (x2 - x1),
            b1 = 2 * (y2 - y1),
            c1 = x2 * x2 + y2 * y2 - x1 * x1 - y1 * y1,
            a2 = 2 * (x3 - x2),
            b2 = 2 * (y3 - y2),
            c2 = x3 * x3 + y3 * y3 - x2 * x2 - y2 * y2,
            x = (c1 * b2 - c2 * b1) / (a1 * b2 - a2 * b1),
            y = (a1 * c2 - a2 * c1) / (a1 * b2 - a2 * b1)

        return new Point(this.owner,x, y)
    }

    getOrthoCenterPoint() {
        let { x: x1, y: y1 } = this.point1,
            { x: x2, y: y2 } = this.point2,
            { x: x3, y: y3 } = this.point3,
            a1 = x2 - x3,
            b1 = y2 - y3,
            c1 = a1 * y1 - b1 * x1,
            a2 = x1 - x3,
            b2 = y1 - y3,
            c2 = a2 * y2 - b2 * x2,
            x = (a1 * c2 - a2 * c1) / (a2 * b1 - a1 * b2),
            y = (b1 * c2 - b2 * c1) / (a2 * b1 - a1 * b2)

        return new Point(this.owner,x, y)
    }

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
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
    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[] {
        throw new Error("Method not implemented.")
    }
}

/**
 * 
 * @category GeomObject
 */
export default Triangle

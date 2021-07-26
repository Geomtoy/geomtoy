import Point from "./Point"
import Circle from "./Circle"
import GeomObject from "./base/GeomObject"
import { CanvasDirective, Coordinate, GraphicImplType, SvgDirective } from "./types"
import Transformation from "./transformation"
import util from "./utility"
import { is, sealed } from "./decorator"

@sealed
class Triangle extends GeomObject {
    #point1: Point | undefined
    #point2: Point | undefined
    #point3: Point | undefined

    constructor(point1Position: Coordinate | Point, point2Position: Coordinate | Point, point3Position: Coordinate | Point) {
        super()
        let a1 = point1Position,
            a2 = point2Position,
            a3 = point3Position

        if ((util.type.isCoordinate(a1) || a1 instanceof Point) && (util.type.isCoordinate(a2) || a2 instanceof Point) && (util.type.isCoordinate(a3) || a3 instanceof Point)) {
            let p1 = new Point(a1),
                p2 = new Point(a2),
                p3 = new Point(a3)

            Object.seal(Object.assign(this, { point1: p1, point2: p2, point3: p3 }))
            return this
        }
        throw new Error(`[G]Arguments can NOT construct a triangle.`)
    }

    @is("point")
    get point1() {
        return this.#point1!
    }
    set point1(value) {
        this.#point1 = value
    }
    @is("point")
    get point2() {
        return this.#point2!
    }
    set point2(value) {
        this.#point2 = value
    }
    @is("point")
    get point3() {
        return this.#point3!
    }
    set point3(value) {
        this.#point3 = value
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
        return new Circle(r, cx, cy)
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
        return new Point(x, y)
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

        return new Point(x, y)
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
            
        return new Point(x, y)
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

export default Triangle

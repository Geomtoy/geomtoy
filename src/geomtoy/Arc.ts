import Vector from "./Vector"
import Point from "./Point"
import Ellipse from "./Ellipse"
import { is } from "./decorator"
import { Coordinate } from "./types"
import util from "./utility"
import _ from "lodash"
import { arcCenterToEndpointParameterization } from "./graphic/helper"

class Arc {
    #centerPoint: Point | undefined
    #startAngle: number | undefined
    #endAngle: number | undefined
    #positive: boolean | undefined

    #radiusX: number | undefined
    #radiusY: number | undefined
    #xAxisRotation: number | undefined

    #point1: Point | undefined
    #point2: Point | undefined
    #largeArcFlag: boolean | undefined
    #sweepFlag: boolean | undefined

    constructor(centerX: number, centerY: number, radiusX: number, radiusY: number, xAxisRotation: number, startAngle: number, endAngle: number, positive: boolean)
    constructor(centerPosition: Coordinate | Point | Vector, radiusX: number, radiusY: number, xAxisRotation: number, startAngle: number, endAngle: number, positive: boolean)
    constructor(a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8?: any) {
        if (_.isNumber(a1) && _.isNumber(a2) && _.isNumber(a3) && _.isNumber(a4) && _.isNumber(a5) && _.isNumber(a6) && _.isNumber(a7) && _.isBoolean(a8)) {
            let cp = new Point(a1, a2)
            this.#centerPoint = cp
            this.#radiusX = a3
            this.#radiusY = a4
            this.#xAxisRotation = a5
            this.#startAngle = a6
            this.#endAngle = a7
            this.#positive = a8
            this.#arcCenterToEndpointParameterization()
            Object.seal(this)
            return this
        }
        if ((util.type.isCoordinate(a1) || a1 instanceof Point || a1 instanceof Vector) && _.isNumber(a2) && _.isNumber(a3) && _.isNumber(a4) && _.isNumber(a5) && _.isNumber(a6) && _.isBoolean(a7)) {
            let cp = new Point(a1)
            this.#centerPoint = cp
            this.#radiusX = a2
            this.#radiusY = a3
            this.#xAxisRotation = a4
            this.#startAngle = a5
            this.#endAngle = a6
            this.#positive = a7
            this.#arcCenterToEndpointParameterization()
            Object.seal(this)
            return this
        }
        throw new Error(`[G]Arguments can NOT construct a arc.`)
    }

    @is("point")
    get centerPoint() {
        return this.#centerPoint!
    }
    set centerPoint(value) {
        this.#centerPoint = value
        this.#arcCenterToEndpointParameterization()
    }
    @is("realNumber")
    get startAngle() {
        return this.#startAngle!
    }
    set startAngle(value) {
        this.#startAngle = value
        this.#guard()
        this.#arcCenterToEndpointParameterization()
    }
    @is("realNumber")
    get endAngle() {
        return this.#endAngle!
    }
    set endAngle(value) {
        this.#endAngle = value
        this.#guard()
        this.#arcCenterToEndpointParameterization()
    }
    @is("boolean")
    get positive() {
        return this.#positive!
    }
    set positive(value) {
        this.#positive = value
        this.#arcCenterToEndpointParameterization()
    }
    @is("positiveNumber")
    get radiusX() {
        return this.#radiusX!
    }
    set radiusX(value) {
        this.#radiusX = value
        this.#arcCenterToEndpointParameterization()
    }
    @is("positiveNumber")
    get radiusY() {
        return this.#radiusY!
    }
    set radiusY(value) {
        this.#radiusY = value
        this.#arcCenterToEndpointParameterization()
    }
    @is("realNumber")
    get xAxisRotation() {
        return this.#xAxisRotation!
    }
    set xAxisRotation(value) {
        this.#xAxisRotation = value
        this.#arcCenterToEndpointParameterization()
    }

    get point1() {
        return this.#point1!
    }
    get point2() {
        return this.#point2!
    }
    get largeArcFlag() {
        return this.#largeArcFlag!
    }
    get sweepFlag() {
        return this.#sweepFlag!
    }
    

    #arcCenterToEndpointParameterization() {
        let cx = this.#centerPoint!.x,
            cy = this.#centerPoint!.y,
            srcRx = this.#radiusX!,
            srcRy = this.#radiusY!,
            startAngle = this.#startAngle!,
            endAngle = this.#endAngle!,
            xAxisRotation = this.#xAxisRotation!,
            anticlockwise = !this.#positive!

        let { x1, y1, x2, y2, rx, ry, largeArcFlag, sweepFlag } = arcCenterToEndpointParameterization({ cx, cy, rx: srcRx, ry: srcRy, startAngle, endAngle, xAxisRotation, anticlockwise })
        this.#point1 = new Point(x1, y1)
        this.#point2 = new Point(x2, y2)
        this.#radiusX = rx
        this.#radiusY = ry
        this.#largeArcFlag = largeArcFlag
        this.#sweepFlag = sweepFlag
    }

    #guard() {
        let deltaAngle = util.angle.simplify(this.#endAngle! - this.#startAngle!)
        if (util.apxEqualsTo(deltaAngle, 0)) {
            throw new Error(
                `[G]The \`startAngle\` and \`endAngle\` of an arc should not be coincide, to keep an arc not full ellipse nor empty ellipse.`
            )
        }
    }

    

    getLength() {
        // if (this.ellipse.radius) {
        //     let pO = this.ellipse.centerPoint
        //     pA = this.p1
        //     ;(pB = this.p2), (aOA = new Vector(pO, pA).angle)
        //     ;(aOB = new Vector(pO, pB).angle), angle

        //     if (this.large) {
        //         angle
        //     }
        // }
    }
}

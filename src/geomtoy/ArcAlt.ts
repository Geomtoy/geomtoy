import math from "./utility/math"
import util from "./utility"
import angle from "./utility/angle"
import vec2 from "./utility/vec2"
import type from "./utility/type"

import Point from "./Point" 
import { is, sealed } from "./decorator"
import { Coordinate } from "./types"
import { arcEndpointToCenterParameterization } from "./graphic/helper"

@sealed
class ArcAlt {
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

    constructor(
        point1X: number,
        point1Y: number,
        point2X: number,
        point2Y: number,
        radiusX: number,
        radiusY: number,
        xAxisRotation: number,
        largeArcFlag: boolean,
        sweepFlag: boolean
    )
    constructor(
        point1Position: Coordinate | Point,
        point2Position: Coordinate | Point,
        radiusX: number,
        radiusY: number,
        xAxisRotation: number,
        largeArcFlag: boolean,
        sweepFlag: boolean
    )
    constructor(a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8?: any, a9?: any) {


        if (type.isNumber(a1) && type.isNumber(a2) && type.isNumber(a3) && type.isNumber(a4) && type.isNumber(a5) && type.isNumber(a6) && type.isNumber(a7) && type.isBoolean(a8) && type.isBoolean(a9)) {
            let p1 = new Point(a1, a2),
                p2 = new Point(a3, a4)
            this.#point1 = p1
            this.#point2 = p2
            this.#radiusX = a5
            this.#radiusY = a6
            this.#xAxisRotation = a7
            this.#largeArcFlag = a8
            this.#sweepFlag = a9
            this.#arcEndpointToCenterParameterization()
            return Object.seal(this) 
        }
        if (
            ((type.isCoordinate(a1) && type.isCoordinate(a2)) || (a1 instanceof Point && a2 instanceof Point)) &&
            type.isNumber(a3) &&
            type.isNumber(a4) &&
            type.isNumber(a5) &&
            type.isBoolean(a6) &&
            type.isBoolean(a7)
        ) {
            let p1 = new Point(a1),
                p2 = new Point(a2)
            this.#point1 = p1
            this.#point2 = p2
            this.#radiusX = a3
            this.#radiusY = a4
            this.#xAxisRotation = a5
            this.#largeArcFlag = a6
            this.#sweepFlag = a7
            this.#arcEndpointToCenterParameterization()
            return Object.seal(this) 
        }

        throw new Error(`[G]Arguments can NOT construct an arc.`)
    }

    @is("positiveNumber")
    get radiusX() {
        return this.#radiusX!
    }
    set radiusX(value) {
        this.#radiusX = value
        this.#arcEndpointToCenterParameterization()
    }
    @is("positiveNumber")
    get radiusY() {
        return this.#radiusY!
    }
    set radiusY(value) {
        this.#radiusY = value
        this.#arcEndpointToCenterParameterization()
    }
    @is("realNumber")
    get xAxisRotation() {
        return this.#xAxisRotation!
    }
    set xAxisRotation(value) {
        this.#xAxisRotation = value
        this.#arcEndpointToCenterParameterization()
    }
    @is("point")
    get point1() {
        return this.#point1!
    }
    set point1(value) {
        this.#point1 = value
        this.#guard()
        this.#arcEndpointToCenterParameterization()
    }
    @is("point")
    get point2() {
        return this.#point2!
    }
    set point2(value) {
        this.#point2 = value
        this.#guard()
        this.#arcEndpointToCenterParameterization()
    }
    @is("boolean")
    get largeArcFlag() {
        return this.#largeArcFlag!
    }
    set largeArcFlag(value) {
        this.#largeArcFlag = value
        this.#arcEndpointToCenterParameterization()
    }
    @is("boolean")
    get sweepFlag() {
        return this.#sweepFlag!
    }
    set sweepFlag(value) {
        this.#sweepFlag = value
        this.#arcEndpointToCenterParameterization()
    }

    get centerPoint() {
        return this.#centerPoint!
    }
    get startAngle() {
        return this.#startAngle!
    }
    get endAngle() {
        return this.#endAngle!
    }
    get positive() {
        return this.#positive!
    }

    #arcEndpointToCenterParameterization() {
        let x1 = this.#point1!.x,
            y1 = this.#point1!.y,
            x2 = this.#point2!.x,
            y2 = this.#point2!.y,
            srcRx = this.#radiusX!,
            srcRy = this.#radiusY!,
            largeArcFlag = this.#largeArcFlag!,
            sweepFlag = this.#sweepFlag!,
            xAxisRotation = this.#xAxisRotation!

        let { cx, cy, rx, ry, startAngle, endAngle, anticlockwise } = arcEndpointToCenterParameterization({
            x1,
            y1,
            x2,
            y2,
            rx: srcRx,
            ry: srcRy,
            largeArcFlag,
            sweepFlag,
            xAxisRotation
        })
        this.#centerPoint = new Point(cx, cy)
        this.#radiusX = rx
        this.#radiusY = ry
        this.#startAngle = startAngle
        this.#endAngle = endAngle
        this.#positive = !anticlockwise
    }

    #guard() {
        if (this.#point1!.isSameAs(this.#point2!)) {
            throw new Error(`[G]The \`point1\` and \`point2\` of an arc should not be the same, to keep an arc not full ellipse nor empty ellipse.`)
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

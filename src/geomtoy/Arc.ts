import Point from "./Point"
import { is, sealed } from "./decorator"
import { CanvasDirective, GraphicDirectiveType, GraphicImplType, SvgDirective } from "./types"
import util from "./utility"
import math from "./utility/math"
import angle from "./utility/angle"
import { arcCenterToEndpointParameterization, arcEndpointToCenterParameterization } from "./graphic/helper"
import Geomtoy from "."
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import Graphic from "./graphic"

@sealed
class Arc extends GeomObject {
    #centerPoint: Point | undefined
    #startAngle: number | undefined
    #endAngle: number | undefined
    #positive: boolean | undefined

    #radiusX: number | undefined
    #radiusY: number | undefined
    #rotation: number | undefined

    //for cache only
    #point1: Point | undefined
    #point2: Point | undefined
    #largeArcFlag: boolean | undefined
    #sweepFlag: boolean | undefined

    constructor(
        owner: Geomtoy,
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        rotation: number,
        startAngle: number,
        endAngle: number,
        positive: boolean
    )
    constructor(
        owner: Geomtoy,
        centerCoordinate: [number, number],
        radiusX: number,
        radiusY: number,
        rotation: number,
        startAngle: number,
        endAngle: number,
        positive: boolean
    )
    constructor(owner: Geomtoy, centerPoint: Point, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, positive: boolean)

    constructor(o: Geomtoy, a1: any, a2: any, a3: any, a4: any, a5: any, a6: any, a7: any, a8?: any) {
        super(o)
        if (
            util.isNumber(a1) &&
            util.isNumber(a2) &&
            util.isNumber(a3) &&
            util.isNumber(a4) &&
            util.isNumber(a5) &&
            util.isNumber(a6) &&
            util.isNumber(a7) &&
            util.isBoolean(a8)
        ) {
            let cp = new Point(o, a1, a2)
            this.#centerPoint = cp
            this.#radiusX = a3
            this.#radiusY = a4
            this.#rotation = a5
            this.#startAngle = a6
            this.#endAngle = a7
            this.#positive = a8
            this.#arcCenterToEndpointParameterization()
            return Object.seal(this)
        }
        if (util.isArray(a1) && util.isNumber(a2) && util.isNumber(a3) && util.isNumber(a4) && util.isNumber(a5) && util.isNumber(a6) && util.isBoolean(a7)) {
            let cp = new Point(o, a1)
            this.#centerPoint = cp
            this.#radiusX = a2
            this.#radiusY = a3
            this.#rotation = a4
            this.#startAngle = a5
            this.#endAngle = a6
            this.#positive = a7
            this.#arcCenterToEndpointParameterization()
            return Object.seal(this)
        }
        if (a1 instanceof Point && util.isNumber(a2) && util.isNumber(a3) && util.isNumber(a4) && util.isNumber(a5) && util.isNumber(a6) && util.isBoolean(a7)) {
            let cp = a1.clone()
            this.#centerPoint = cp
            this.#radiusX = a2
            this.#radiusY = a3
            this.#rotation = a4
            this.#startAngle = a5
            this.#endAngle = a6
            this.#positive = a7
            this.#arcCenterToEndpointParameterization()
            return Object.seal(this)
        }

        throw new Error(`[G]Arguments can NOT construct an arc.`)
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
    get rotation() {
        return this.#rotation!
    }
    set rotation(value) {
        this.#rotation = value
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
            rotation = this.#rotation!,
            anticlockwise = !this.#positive!

        let { x1, y1, x2, y2, rx, ry, largeArcFlag, sweepFlag } = arcCenterToEndpointParameterization({
            cx,
            cy,
            rx: srcRx,
            ry: srcRy,
            startAngle,
            endAngle,
            rotation,
            anticlockwise
        })
        this.#point1 = new Point(x1, y1)
        this.#point2 = new Point(x2, y2)
        this.#radiusX = rx
        this.#radiusY = ry
        this.#largeArcFlag = largeArcFlag
        this.#sweepFlag = sweepFlag
    }

    #guard() {
        let deltaAngle = angle.simplify(this.#endAngle! - this.#startAngle!)
        if (math.equalTo(deltaAngle, 0)) {
            throw new Error(`[G]The \`startAngle\` and \`endAngle\` of an arc should not be coincide, to keep an arc not full ellipse nor empty ellipse.`)
        }
    }

    static fromTwoPointsEtc(point1:Point,point2:Point,radiusX:number,radiusY:number,largeArcFlag:boolean,sweepFlag:boolean,rotation:number){
        let [x1,y1] = point1.coordinate,
            [x2,y2]= point2.coordinate,
        let {} arcEndpointToCenterParameterization(x1,y1,x1)
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
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective> {
        let g= new Graphic()
        if(type === "svg"){
            g.moveTo(this.)
            g.endpointArcTo()

        }else{



        }
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
}

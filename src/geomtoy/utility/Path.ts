import Point from "../Point"
import Angle from "./angle"
// import Matrix from "../transformation/Matrix"

enum Directive {
    //only use:
    M = "moveTo",
    L = "lineTo",
    C = "bezierCurveTo",
    Q = "quadraticBezierCurveTo",
    A = "arcTo",
    Z = "close"
}

export default class Path {
    path: Array<[Directive, ...Array<number | boolean>]>

    constructor() {
        this.path = []
    }

    static D = Directive

    moveTo(p: Point): void
    moveTo(x: number, y: number): void
    moveTo(x: any, y?: any) {
        if (x instanceof Point) {
            x = x.x
            y = x.y
        }
        this.path.push([Directive.M, x, y])
    }

    lineTo(p: Point): void
    lineTo(x: number, y: number): void
    lineTo(x: any, y?: any) {
        if (x instanceof Point) {
            x = x.x
            y = x.y
        }
        this.path.push([Directive.L, x, y])
    }

    close() {
        this.path.push([Directive.Z])
    }

    /**
     * @see https://www.w3.org/TR/SVG2/implnote.html#ArcImplementationNotes
     * @see https://observablehq.com/@awhitty/svg-2-elliptical-arc-to-canvas-path2d
     * @param d
     */
    #arcCenterToEndpointParameterization(d: [Directive, ...Array<number | boolean>]) {


    }
    #arcEndpointToCenterParameterization(x1:number,y1:number,x2:number,y2:number,largeArcFlag:boolean,sweepFlag:boolean,rx:number,ry:number,rotationInDegree:number) {
         let rotation = Angle.degreeToRadian(rotationInDegree),
            cosphi = Math.cos(rotation),
            sinphi = Math.sin(rotation)

            // Matrix



    }

    centerArcTo(cx: number, cy: number, r: number, sa: number, ea: number, anticlockwise: boolean = false) {
        this.path.push([Directive.A, cx, cy, r, sa, ea, anticlockwise])
    }

    endpointArcTo(rx: number, ry: number, rotate: number, largeArcFlag: boolean, sweepFlag: boolean, x: number, y: number) {
        this.path.push([Directive.A, rx, ry, rotate, largeArcFlag, sweepFlag, x, y])
    }

    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void
    bezierCurveTo(cp1: Point, cp2: Point, p: Point): void
    bezierCurveTo(cp1x: any, cp1y: any, cp2x: any, cp2y?: any, x?: any, y?: any) {
        if (cp1x instanceof Point && cp1y instanceof Point && cp2x instanceof Point) {
            cp1x = cp1x.x
            cp2y = cp1x.y
            cp2x = cp1y.x
            cp2y = cp1y.y
            x = cp2x.x
            y = cp2x.y
        }
        this.path.push([Directive.C, cp1x, cp2y, cp2x, cp2y, x, y])
    }

    quadraticBezierCurveTo(cpx: number, cpy: number, x: number, y: number): void
    quadraticBezierCurveTo(cp: Point, p: Point): void
    quadraticBezierCurveTo(cpx: any, cpy: any, x?: any, y?: any) {
        if (cpx instanceof Point && cpy instanceof Point) {
            cpx = cpx.x
            cpy = cpx.y
            x = cpy.x
            y = cpy.y
        }
        this.path.push([Directive.Q, cpx, cpy, x, y])
    }

    valueOf(type: "canvas" | "svg") {
        return this.path
    }
}

import _ from "lodash"
import { GraphicDirectiveType, GraphicImplType, GraphicDirective, SvgDirectiveType, SvgDirective, CanvasDirectiveType, CanvasDirective } from "../types"
import { arcCenterToEndpointParameterization, arcEndpointToCenterParameterization } from "./helper"
import util from "../utility"

export { GraphicDirectiveType }

export default class Graphic {
    directives: Array<GraphicDirective>
    currentX: number
    currentY: number
    startX: number
    startY: number
    constructor() {
        this.directives = []
        this.currentX = 0
        this.currentY = 0
        this.startX = 0
        this.startY = 0
    }

    moveTo(x: number, y: number): Graphic {
        this.currentX = x
        this.currentY = y
        this.startX = x
        this.startY = y
        // prettier-ignore
        this.directives.push({
            type: GraphicDirectiveType.MoveTo,
            x,
            y,
            currentX: x,
            currentY: y
        })
        return this
    }
    lineTo(x: number, y: number): Graphic {
        this.currentX = x
        this.currentY = y
        // prettier-ignore
        this.directives.push({
            type: GraphicDirectiveType.LineTo,
            x,
            y,
            currentX: x,
            currentY: y
        })
        return this
    }
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Graphic {
        this.currentX = x
        this.currentY = y
        // prettier-ignore
        this.directives.push({
            type: GraphicDirectiveType.BezierCurveTo,
            cp1x,
            cp1y,
            cp2x,
            cp2y,
            x,
            y,
            currentX: x,
            currentY: y
        })
        return this
    }
    quadraticBezierCurveTo(cpx: number, cpy: number, x: number, y: number): Graphic {
        this.currentX = x
        this.currentY = y
        // prettier-ignore
        this.directives.push({
            type: GraphicDirectiveType.QuadraticBezierCurveTo,
            cpx,
            cpy,
            x,
            y,
            currentX: x,
            currentY: y
        })
        return this
    }
    centerArcTo(cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number, xAxisRotation: number, anticlockwise: boolean = false): Graphic {
        // prettier-ignore
        let {
            x1,
            y1,
            x2,
            y2,
            rx: correctedRx,
            ry: correctedRy,
            largeArcFlag,
            sweepFlag
        } = arcCenterToEndpointParameterization({ cx, cy, rx, ry, startAngle, endAngle, xAxisRotation, anticlockwise })

        this.currentX = x2
        this.currentX = y2
        this.directives.push({
            type: GraphicDirectiveType.ArcTo,
            cx,
            cy,
            rx: correctedRx,
            ry: correctedRy,
            startAngle,
            endAngle,
            xAxisRotation,
            anticlockwise,
            x1,
            y1,
            x2,
            y2,
            largeArcFlag,
            sweepFlag,
            currentX: x2,
            currentY: y2
        })
        return this
    }
    endpointArcTo(x: number, y: number, rx: number, ry: number, largeArcFlag: boolean, sweepFlag: boolean, xAxisRotation: number): Graphic {
        let x1 = this.currentX,
            y1 = this.currentY,
            x2 = x,
            y2 = y
        // prettier-ignore
        let {
            cx,
            cy,
            rx: correctedRx,
            ry: correctedRy,
            startAngle,
            endAngle,
            anticlockwise
        } = arcEndpointToCenterParameterization({ x1, y1, x2, y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation })

        this.currentX = x2
        this.currentY = y2
        this.directives.push({
            type: GraphicDirectiveType.ArcTo,
            cx,
            cy,
            rx: correctedRx,
            ry: correctedRy,
            startAngle,
            endAngle,
            xAxisRotation,
            anticlockwise,
            x1,
            y1,
            x2,
            y2,
            largeArcFlag,
            sweepFlag,
            currentX: x2,
            currentY: y2
        })
        return this
    }
    close(): Graphic {
        this.currentX = this.startX
        this.currentY = this.startY
        // prettier-ignore
        this.directives.push({ 
            type: GraphicDirectiveType.Close,
            currentX: this.currentX,
            currentY: this.currentY
        })
        return this
    }

    static canvasDirectiveType = CanvasDirectiveType
    static svgDirectiveType = SvgDirectiveType

    valueOf(type: GraphicImplType): Array<SvgDirective | CanvasDirective> {
        let retArray: Array<SvgDirective | CanvasDirective> = []

        if (type === "canvas") {
            _.forEach(this.directives, (d, index, collection) => {
                if (d.type === GraphicDirectiveType.MoveTo) {
                    let { x, y } = d
                    retArray.push({ type: CanvasDirectiveType.MoveTo, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.LineTo) {
                    let { x, y } = d
                    retArray.push({ type: CanvasDirectiveType.LineTo, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.BezierCurveTo) {
                    let { cp1x, cp1y, cp2x, cp2y, x, y } = d
                    retArray.push({ type: CanvasDirectiveType.BezierCurveTo, cp1x, cp1y, cp2x, cp2y, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.QuadraticBezierCurveTo) {
                    let { cpx, cpy, x, y } = d
                    retArray.push({ type: CanvasDirectiveType.QuadraticCurveTo, cpx, cpy, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.ArcTo) {
                    let { x1, y1, cx, cy, rx, ry, startAngle, endAngle, xAxisRotation, anticlockwise } = d
                    let prevDirective = collection[index - 1],
                        { currentX: prevCurrentX, currentY: prevCurrentY } = prevDirective

                    // Adjust the starting point of the arc, although canvas will do the same, we make it explicitly
                    if (x1 !== prevCurrentX || y1 !== prevCurrentY) {
                        if (prevDirective.type !== GraphicDirectiveType.MoveTo) {
                            retArray.push({ type: CanvasDirectiveType.LineTo, x: x1, y: y1 })
                        } else {
                            retArray.push({ type: CanvasDirectiveType.MoveTo, x: x1, y: y1 })
                        }
                    }
                    if (rx === ry && xAxisRotation === 0) {
                        retArray.push({ type: CanvasDirectiveType.Arc, x: cx, y: cy, r: rx, startAngle, endAngle, anticlockwise })
                    } else {
                        retArray.push({ type: CanvasDirectiveType.Ellipse, x: cx, y: cy, rx, ry, startAngle, endAngle, xAxisRotation, anticlockwise })
                    }
                    return
                }
                if (d.type === GraphicDirectiveType.Close) {
                    retArray.push({ type: CanvasDirectiveType.ClosePath })
                }
            })
        }

        if (type === "svg") {
            _.forEach(this.directives, (d, index, collection) => {
                if (d.type === GraphicDirectiveType.MoveTo) {
                    let { x, y } = d
                    retArray.push({ type: SvgDirectiveType.M, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.LineTo) {
                    let { x, y } = d
                    retArray.push({ type: SvgDirectiveType.L, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.BezierCurveTo) {
                    let { cp1x, cp1y, cp2x, cp2y, x, y } = d
                    retArray.push({ type: SvgDirectiveType.C, cp1x, cp1y, cp2x, cp2y, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.QuadraticBezierCurveTo) {
                    let { cpx, cpy, x, y } = d
                    retArray.push({ type: SvgDirectiveType.Q, cpx, cpy, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.ArcTo) {
                    let { x1, y1, x2, y2, rx, ry, cx, cy, largeArcFlag, sweepFlag, xAxisRotation, startAngle, endAngle, anticlockwise } = d
                    let prevDirective = collection[index - 1],
                        { currentX: prevCurrentX, currentY: prevCurrentY } = prevDirective,
                        xAxisRotationInDegree = util.angle.radianToDegree(xAxisRotation)

                    // Adjust the start point of arc
                    if (x1 !== prevCurrentX || y1 !== prevCurrentY) {
                        if (prevDirective.type !== GraphicDirectiveType.MoveTo) {
                            retArray.push({ type: SvgDirectiveType.L, x: x1, y: y1 })
                        } else {
                            retArray.push({ type: SvgDirectiveType.M, x: x1, y: y1 })
                        }
                    }

                    // Solve the svg arc can not draw a full ellipse problem
                    if ((startAngle - endAngle) % (2 * Math.PI) === 0) {
                        let midAngle = (startAngle - endAngle) / 2,
                            midParam = arcCenterToEndpointParameterization({ cx, cy, rx, ry, startAngle, endAngle: midAngle, xAxisRotation, anticlockwise }),
                            endParam = arcCenterToEndpointParameterization({ cx, cy, rx, ry, startAngle: midAngle, endAngle, xAxisRotation, anticlockwise })
                        retArray.push({ type: SvgDirectiveType.A, x: midParam.x2, y: midParam.y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation: xAxisRotationInDegree })
                        retArray.push({ type: SvgDirectiveType.A, x: endParam.x2, y: endParam.y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation: xAxisRotationInDegree })
                    } else {
                        retArray.push({ type: SvgDirectiveType.A, x: x2, y: y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation: xAxisRotationInDegree })
                    }
                    return
                }
                if (d.type === GraphicDirectiveType.Close) {
                    retArray.push({ type: SvgDirectiveType.Z })
                }
            })
        }

        return retArray
    }
}

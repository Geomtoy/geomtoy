import _ from "lodash"
import { GraphicDirectiveType, GraphicImplType, GraphicDirective } from "../types"
import { arcCenterToEndpointParameterization, arcEndpointToCenterParameterization } from "./helper"

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

    moveTo(x: number, y: number): void {
        this.currentX = x
        this.currentY = y
        this.startX = x
        this.startY = y
        // prettier-ignore
        this.directives.push({
            type: GraphicDirectiveType.M,
            x,
            y,
            currentX: x,
            currentY: y
        })
    }
    lineTo(x: number, y: number): void {
        this.currentX = x
        this.currentY = y
        // prettier-ignore
        this.directives.push({
            type: GraphicDirectiveType.L,
            x,
            y,
            currentX: x,
            currentY: y
        })
    }

    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
        this.currentX = x
        this.currentY = y
        // prettier-ignore
        this.directives.push({
            type: GraphicDirectiveType.C,
            cp1x,
            cp1y,
            cp2x,
            cp2y,
            x,
            y,
            currentX: x,
            currentY: y
        })
    }

    quadraticBezierCurveTo(cpx: number, cpy: number, x: number, y: number): void {
        this.currentX = x
        this.currentY = y
        // prettier-ignore
        this.directives.push({
            type: GraphicDirectiveType.Q,
            cpx,
            cpy,
            x,
            y,
            currentX: x,
            currentY: y
        })
    }

    centerArcTo(cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number, xAxisRotation: number, anticlockwise: boolean = false): void {
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
            type: GraphicDirectiveType.A,
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
    }

    endpointArcTo(x: number, y: number, rx: number, ry: number, largeArcFlag: boolean, sweepFlag: boolean, xAxisRotation: number) {
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
            type: GraphicDirectiveType.A,
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
    }

    close() {
        this.currentX = this.startX
        this.currentY = this.startY
        // prettier-ignore
        this.directives.push({ 
            type: GraphicDirectiveType.Z,
            currentX: this.currentX,
            currentY: this.currentY
        })
    }

    static canvasDirectives = {
        moveTo: "moveTo",
        lineTo: "lineTo",
        bezierCurveTo: "bezierCurveTo",
        quadraticCurveTo: "quadraticCurveTo",
        arc: "arc",
        ellipse: "ellipse",
        closePath: "closePath"
    }

    static svgDirectives = {
        M: "M",
        L: "L",
        C: "C",
        Q: "Q",
        A: "A",
        Z: "Z"
    }

    valueOf(type: GraphicImplType): Array<object> {
        let retArray: Array<object> = []

        if (type === GraphicImplType.Canvas) {
            _.forEach(this.directives, (d, index, collection) => {
                if (d.type === GraphicDirectiveType.M) {
                    let { x, y } = d
                    retArray.push({ type: Graphic.canvasDirectives.moveTo, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.L) {
                    let { x, y } = d
                    retArray.push({ type: Graphic.canvasDirectives.lineTo, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.C) {
                    let { cp1x, cp1y, cp2x, cp2y, x, y } = d
                    retArray.push({ type: Graphic.canvasDirectives.bezierCurveTo, cp1x, cp1y, cp2x, cp2y, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.Q) {
                    let { cpx, cpy, x, y } = d
                    retArray.push({ type: Graphic.canvasDirectives.quadraticCurveTo, cpx, cpy, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.A) {
                    let { x1, y1, cx, cy, rx, ry, startAngle, endAngle, xAxisRotation, anticlockwise } = d
                    let prevDirective = collection[index - 1],
                        { currentX: prevCurrentX, currentY: prevCurrentY } = prevDirective

                    // Adjust the starting point of the arc, although canvas will do the same, we make it explicitly
                    if (x1 !== prevCurrentX || y1 !== prevCurrentY) {
                        if (prevDirective.type !== GraphicDirectiveType.M) {
                            retArray.push({ type: Graphic.svgDirectives.L, x: x1, y: y1 })
                        } else {
                            retArray.push({ type: Graphic.svgDirectives.M, x: x1, y: y1 })
                        }
                    }

                    if (rx === ry && xAxisRotation === 0) {
                        retArray.push({ type: Graphic.canvasDirectives.arc, x: cx, y: cy, r: rx, startAngle, endAngle, anticlockwise })
                    } else {
                        retArray.push({ type: Graphic.canvasDirectives.ellipse, x: cx, y: cy, rx, ry, startAngle, endAngle, xAxisRotation, anticlockwise })
                    }
                    return
                }
                if (d.type === GraphicDirectiveType.Z) {
                    retArray.push({ type: Graphic.canvasDirectives.closePath })
                }
            })
        }

        if (type === GraphicImplType.Svg) {
            _.forEach(this.directives, (d, index, collection) => {
                if (d.type === GraphicDirectiveType.M) {
                    let { x, y } = d
                    retArray.push({ type: Graphic.svgDirectives.M, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.L) {
                    let { x, y } = d
                    retArray.push({ type: Graphic.svgDirectives.L, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.C) {
                    let { cp1x, cp1y, cp2x, cp2y, x, y } = d
                    retArray.push({ type: Graphic.svgDirectives.C, cp1x, cp1y, cp2x, cp2y, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.Q) {
                    let { cpx, cpy, x, y } = d
                    retArray.push({ type: Graphic.svgDirectives.Q, cpx, cpy, x, y })
                    return
                }
                if (d.type === GraphicDirectiveType.A) {
                    let { x1, y1, x2, y2, rx, ry, cx, cy, largeArcFlag, sweepFlag, xAxisRotation, startAngle, endAngle, anticlockwise } = d
                    let prevDirective = collection[index - 1],
                        { currentX: prevCurrentX, currentY: prevCurrentY } = prevDirective

                    // Adjust the start point of arc
                    if (x1 !== prevCurrentX || y1 !== prevCurrentY) {
                        if (prevDirective.type !== GraphicDirectiveType.M) {
                            retArray.push({ type: Graphic.svgDirectives.L, x: x1, y: y1 })
                        } else {
                            retArray.push({ type: Graphic.svgDirectives.M, x: x1, y: y1 })
                        }
                    }

                    // Solve the svg arc can not draw a full ellipse problem
                    if ((startAngle - endAngle) % (2 * Math.PI) === 0) {
                        let midAngle = (startAngle - endAngle) / 2
                        let midParam = arcCenterToEndpointParameterization({ cx, cy, rx, ry, startAngle, endAngle: midAngle, xAxisRotation, anticlockwise })
                        let endParam = arcCenterToEndpointParameterization({ cx, cy, rx, ry, startAngle: midAngle, endAngle, xAxisRotation, anticlockwise })
                        retArray.push({ type: Graphic.svgDirectives.A, x: midParam.x2, y: midParam.y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation })
                        retArray.push({ type: Graphic.svgDirectives.A, x: endParam.x2, y: endParam.y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation })
                    } else {
                        retArray.push({ type: Graphic.svgDirectives.A, x: x2, y: y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation })
                    }
                    return
                }
                if (d.type === GraphicDirectiveType.Z) {
                    retArray.push({ type: Graphic.svgDirectives.Z })
                }
            })
        }

        return retArray
    }
}

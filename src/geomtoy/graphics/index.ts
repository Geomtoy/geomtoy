import util from "../utility"
import { GraphicsCommandType, GraphicsImplType, GraphicsCommand, SvgCommandType, SvgCommand, CanvasCommandType, CanvasCommand } from "../types"
import { arcCenterToEndpointParameterization, arcEndpointToCenterParameterization } from "./helper"
import angle from "../utility/angle"

export { GraphicsCommandType }

export default class Graphics {
    commands: Array<GraphicsCommand>
    currentX: number
    currentY: number
    startX: number
    startY: number
    constructor() {
        this.commands = []
        this.currentX = 0
        this.currentY = 0
        this.startX = 0
        this.startY = 0
    }

    moveTo(x: number, y: number): Graphics {
        this.currentX = x
        this.currentY = y
        this.startX = x
        this.startY = y
        // prettier-ignore
        this.commands.push({
            type: GraphicsCommandType.MoveTo,
            x,
            y,
            currentX: x,
            currentY: y
        })
        return this
    }
    lineTo(x: number, y: number): Graphics {
        this.currentX = x
        this.currentY = y
        // prettier-ignore
        this.commands.push({
            type: GraphicsCommandType.LineTo,
            x,
            y,
            currentX: x,
            currentY: y
        })
        return this
    }
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Graphics {
        this.currentX = x
        this.currentY = y
        // prettier-ignore
        this.commands.push({
            type: GraphicsCommandType.BezierCurveTo,
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
    quadraticBezierCurveTo(cpx: number, cpy: number, x: number, y: number): Graphics {
        this.currentX = x
        this.currentY = y
        // prettier-ignore
        this.commands.push({
            type: GraphicsCommandType.QuadraticBezierCurveTo,
            cpx,
            cpy,
            x,
            y,
            currentX: x,
            currentY: y
        })
        return this
    }
    centerArcTo(cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number, xAxisRotation: number, anticlockwise: boolean = false): Graphics {
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
        this.commands.push({
            type: GraphicsCommandType.ArcTo,
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
    endpointArcTo(x: number, y: number, rx: number, ry: number, largeArcFlag: boolean, sweepFlag: boolean, xAxisRotation: number): Graphics {
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
        this.commands.push({
            type: GraphicsCommandType.ArcTo,
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
    close(): Graphics {
        this.currentX = this.startX
        this.currentY = this.startY
        // prettier-ignore
        this.commands.push({ 
            type: GraphicsCommandType.Close,
            currentX: this.currentX,
            currentY: this.currentY
        })
        return this
    }
 
    valueOf(type: GraphicsImplType): Array<SvgCommand | CanvasCommand> {
        let retArray: Array<SvgCommand | CanvasCommand> = []

        if (type === "canvas") {
            this.commands.forEach((cmd, index, collection) => {
                if (cmd.type === GraphicsCommandType.MoveTo) {
                    let { x, y } = cmd
                    retArray.push({ type: CanvasCommandType.MoveTo, x, y })
                    return
                }
                if (cmd.type === GraphicsCommandType.LineTo) {
                    let { x, y } = cmd
                    retArray.push({ type: CanvasCommandType.LineTo, x, y })
                    return
                }
                if (cmd.type === GraphicsCommandType.BezierCurveTo) {
                    let { cp1x, cp1y, cp2x, cp2y, x, y } = cmd
                    retArray.push({ type: CanvasCommandType.BezierCurveTo, cp1x, cp1y, cp2x, cp2y, x, y })
                    return
                }
                if (cmd.type === GraphicsCommandType.QuadraticBezierCurveTo) {
                    let { cpx, cpy, x, y } = cmd
                    retArray.push({ type: CanvasCommandType.QuadraticCurveTo, cpx, cpy, x, y })
                    return
                }
                if (cmd.type === GraphicsCommandType.ArcTo) {
                    let { x1, y1, cx, cy, rx, ry, startAngle, endAngle, xAxisRotation, anticlockwise } = cmd
                    let prevCommand = collection[index - 1],
                        { currentX: prevCurrentX, currentY: prevCurrentY } = prevCommand

                    // Adjust the starting point of the arc, although canvas will do the same, we make it explicitly
                    if (x1 !== prevCurrentX || y1 !== prevCurrentY) {
                        if (prevCommand.type !== GraphicsCommandType.MoveTo) {
                            retArray.push({ type: CanvasCommandType.LineTo, x: x1, y: y1 })
                        } else {
                            prevCommand.x = x1
                            prevCommand.y = y1
                        }
                    }
                    if (rx === ry && xAxisRotation === 0) {
                        retArray.push({ type: CanvasCommandType.Arc, x: cx, y: cy, r: rx, startAngle, endAngle, anticlockwise })
                    } else {
                        retArray.push({ type: CanvasCommandType.Ellipse, x: cx, y: cy, rx, ry, startAngle, endAngle, xAxisRotation, anticlockwise })
                    }
                    return
                }
                if (cmd.type === GraphicsCommandType.Close) {
                    retArray.push({ type: CanvasCommandType.ClosePath })
                }
            })
        }

        if (type === "svg") {
            util.forEach(this.commands, (cmd, index, collection) => {
                if (cmd.type === GraphicsCommandType.MoveTo) {
                    let { x, y } = cmd
                    retArray.push({ type: SvgCommandType.M, x, y })
                    return
                }
                if (cmd.type === GraphicsCommandType.LineTo) {
                    let { x, y } = cmd
                    retArray.push({ type: SvgCommandType.L, x, y })
                    return
                }
                if (cmd.type === GraphicsCommandType.BezierCurveTo) {
                    let { cp1x, cp1y, cp2x, cp2y, x, y } = cmd
                    retArray.push({ type: SvgCommandType.C, cp1x, cp1y, cp2x, cp2y, x, y })
                    return
                }
                if (cmd.type === GraphicsCommandType.QuadraticBezierCurveTo) {
                    let { cpx, cpy, x, y } = cmd
                    retArray.push({ type: SvgCommandType.Q, cpx, cpy, x, y })
                    return
                }
                if (cmd.type === GraphicsCommandType.ArcTo) {
                    let { x1, y1, x2, y2, rx, ry, cx, cy, largeArcFlag, sweepFlag, xAxisRotation, startAngle, endAngle, anticlockwise } = cmd
                    let prevCommand = collection[index - 1],
                        { currentX: prevCurrentX, currentY: prevCurrentY } = prevCommand,
                        xAxisRotationInDegree = angle.radianToDegree(xAxisRotation)

                    // Adjust the start point of arc
                    if (x1 !== prevCurrentX || y1 !== prevCurrentY) {
                        if (prevCommand.type !== GraphicsCommandType.MoveTo) {
                            retArray.push({ type: SvgCommandType.L, x: x1, y: y1 })
                        } else {
                            retArray.push({ type: SvgCommandType.M, x: x1, y: y1 })
                        }
                    }

                    // Solve the svg arc can not draw a full ellipse problem
                    if ((startAngle - endAngle) % (2 * Math.PI) === 0) {
                        let midAngle = (startAngle - endAngle) / 2,
                            midParam = arcCenterToEndpointParameterization({ cx, cy, rx, ry, startAngle, endAngle: midAngle, xAxisRotation, anticlockwise }),
                            endParam = arcCenterToEndpointParameterization({ cx, cy, rx, ry, startAngle: midAngle, endAngle, xAxisRotation, anticlockwise })
                        retArray.push({ type: SvgCommandType.A, x: midParam.x2, y: midParam.y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation: xAxisRotationInDegree })
                        retArray.push({ type: SvgCommandType.A, x: endParam.x2, y: endParam.y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation: xAxisRotationInDegree })
                    } else {
                        retArray.push({ type: SvgCommandType.A, x: x2, y: y2, rx, ry, largeArcFlag, sweepFlag, xAxisRotation: xAxisRotationInDegree })
                    }
                    return
                }
                if (cmd.type === GraphicsCommandType.Close) {
                    retArray.push({ type: SvgCommandType.Z })
                }
            })
        }

        return retArray
    }
}

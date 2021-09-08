import Transformation from "../transformation"
import { GraphicsCommandType, GraphicsCommand, Font } from "../types"
import { arcCenterToEndpointParameterization, arcEndpointToCenterParameterization } from "./helper"

export default class Graphics {
    commands: Array<GraphicsCommand>
    currentXY: [number, number]
    startXY: [number, number]
    constructor() {
        this.commands = []
        this.currentXY = [0, 0]
        this.startXY = [0, 0]
    }

    moveTo(x: number, y: number) {
        this.commands.push({
            type: GraphicsCommandType.MoveTo,
            x,
            y
        })
        this.currentXY = [x, y]
        this.startXY = [x, y]
        return this
    }
    lineTo(x: number, y: number) {
        this.commands.push({
            type: GraphicsCommandType.LineTo,
            x,
            y
        })
        this.currentXY = [x, y]
        return this
    }
    bezierCurveTo(controlPoint1X: number, controlPoint1Y: number, controlPoint2X: number, controlPoint2Y: number, x: number, y: number) {
        this.commands.push({
            type: GraphicsCommandType.BezierCurveTo,
            controlPoint1X,
            controlPoint1Y,
            controlPoint2X,
            controlPoint2Y,
            x,
            y
        })
        this.currentXY = [x, y]
        return this
    }
    quadraticBezierCurveTo(controlPointX: number, controlPointY: number, x: number, y: number) {
        this.commands.push({
            type: GraphicsCommandType.QuadraticBezierCurveTo,
            controlPointX,
            controlPointY,
            x,
            y
        })
        this.currentXY = [x, y]
        return this
    }
    centerArcTo(centerX: number, centerY: number, radiusX: number, radiusY: number, xAxisRotation: number, startAngle: number, endAngle: number, positive: boolean = true) {
        const {
            point1X,
            point1Y,
            point2X,
            point2Y,
            radiusX: correctedRx,
            radiusY: correctedRy,
            largeArcFlag
        } = arcCenterToEndpointParameterization({ centerX, centerY, radiusX, radiusY, startAngle, endAngle, xAxisRotation, anticlockwise: !positive })

        // `Canvas` logic
        if (this.commands.length === 0) {
            // Move to the starting point of the arc, if this `centerArcTo` will be the first command,
            // like `Canvas` implicitly do. We make it explicitly for `SVG`
            this.moveTo(point1X, point1Y)
        } else {
            // Line to the starting point of the arc, if this `centerArcTo` is not the first command,
            // like `Canvas` implicitly do. We make it explicitly for `SVG`
            this.lineTo(point1X, point1Y)
        }
        this.commands.push({
            type: GraphicsCommandType.ArcTo,
            centerX,
            centerY,
            radiusX: correctedRx,
            radiusY: correctedRy,
            startAngle,
            endAngle,
            xAxisRotation,
            positive,
            x: point2X,
            y: point2Y,
            largeArc: largeArcFlag
        })
        this.currentXY = [point2X, point2Y]
        return this
    }
    /**
     * Use endpoint parameterization to draw an arc, like SVG does.
     * Endpoint parameterization can NOT directly draw a full circle/ellipse,
     * we use an approximation of `Math.PI / 1800` when converting the center parameterization to the endpoint parameterization.
     */
    endpointArcTo(radiusX: number, radiusY: number, xAxisRotation: number, largeArc: boolean, positive: boolean, x: number, y: number) {
        const [point1X, point1Y] = this.currentXY
        const [point2X, point2Y] = [x, y]
        // prettier-ignore
        const {
            centerX,
            centerY,
            radiusX: correctedRx,
            radiusY: correctedRy,
            startAngle,
            endAngle
        } = arcEndpointToCenterParameterization({ point1X, point1Y, point2X,point2Y, radiusX, radiusY, largeArcFlag:largeArc, sweepFlag:positive, xAxisRotation })

        this.commands.push({
            type: GraphicsCommandType.ArcTo,
            centerX,
            centerY,
            radiusX: correctedRx,
            radiusY: correctedRy,
            startAngle,
            endAngle,
            xAxisRotation,
            positive,
            x: point2X,
            y: point2Y,
            largeArc
        })
        this.currentXY = [point2X, point2Y]
        return this
    }
    close() {
        this.commands.push({
            type: GraphicsCommandType.Close
        })
        this.currentXY = this.startXY
        return this
    }
    text(x: number, y: number, text: string, font: Font) {
        this.commands.push({
            type: GraphicsCommandType.Text,
            x,
            y,
            text,
            font
        })
        return this
    }
}

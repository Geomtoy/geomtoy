import Transformation from "../transformation"

export type GraphicsImplType = "canvas" | "svg"

export const enum GraphicsCommandType {
    MoveTo = "moveTo",
    LineTo = "lineTo",
    BezierCurveTo = "bezierCurveTo",
    QuadraticBezierCurveTo = "quadraticBezierCurveTo",
    ArcTo = "arcTo",
    Close = "close",
    Text = "text"
}

export type GraphicsCommand =
    | GraphicsMoveToCommand
    | GraphicsLineToCommand
    | GraphicsBezierCurveToCommand
    | GraphicsQuadraticBezierCurveToCommand
    | GraphicsArcToCommand
    | GraphicsCloseCommand
    | GraphicsTextCommand

export type GraphicsTextCommand = {
    type: GraphicsCommandType.Text
    x: number
    y: number
    text: string
    font: Font
}

export type Font = {
    size: number
    family: string
    bold: boolean
    italic: boolean
}
export const defaultFont: Font = {
    size: 16,
    family: "sans-serif",
    bold: false,
    italic: false
}

export type GraphicsMoveToCommand = {
    type: GraphicsCommandType.MoveTo
    x: number
    y: number
}
export type GraphicsLineToCommand = {
    type: GraphicsCommandType.LineTo
    x: number
    y: number
}
export type GraphicsBezierCurveToCommand = {
    type: GraphicsCommandType.BezierCurveTo
    controlPoint1X: number
    controlPoint1Y: number
    controlPoint2X: number
    controlPoint2Y: number
    x: number
    y: number
}
export type GraphicsQuadraticBezierCurveToCommand = {
    type: GraphicsCommandType.QuadraticBezierCurveTo
    controlPointX: number
    controlPointY: number
    x: number
    y: number
}
export type GraphicsArcToCommand = {
    type: GraphicsCommandType.ArcTo
    centerX: number
    centerY: number
    radiusX: number
    radiusY: number
    startAngle: number
    endAngle: number
    xAxisRotation: number
    positive: boolean
    x: number
    y: number
    largeArc: boolean
}
export type GraphicsCloseCommand = {
    type: GraphicsCommandType.Close
}

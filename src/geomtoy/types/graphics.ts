export const enum GraphicsCommandType {
    MoveTo = "moveTo",
    LineTo = "lineTo",
    BezierCurveTo = "bezierCurveTo",
    QuadraticBezierCurveTo = "quadraticBezierCurveTo",
    ArcTo = "arcTo",
    Close = "close",
    Text = "text",
    Image = "image"
}

export type GraphicsCommand =
    | GraphicsMoveToCommand
    | GraphicsLineToCommand
    | GraphicsBezierCurveToCommand
    | GraphicsQuadraticBezierCurveToCommand
    | GraphicsArcToCommand
    | GraphicsCloseCommand
    | GraphicsTextCommand
    | GraphicsImageCommand

export type GraphicsGeometryCommand = GraphicsMoveToCommand | GraphicsLineToCommand | GraphicsBezierCurveToCommand | GraphicsQuadraticBezierCurveToCommand | GraphicsArcToCommand | GraphicsCloseCommand

export type GraphicsImageCommand = {
    type: GraphicsCommandType.Image
    x: number
    y: number
    width: number
    height: number
}

export type GraphicsTextCommand = {
    type: GraphicsCommandType.Text
    x: number
    y: number
    text: string
    fontSize: number
    fontFamily: string
    fontBold: boolean
    fontItalic: boolean
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
    xAxisRotation: number
    startAngle: number
    endAngle: number
    largeArc: boolean
    positive: boolean
    x: number
    y: number
}
export type GraphicsCloseCommand = {
    type: GraphicsCommandType.Close
}

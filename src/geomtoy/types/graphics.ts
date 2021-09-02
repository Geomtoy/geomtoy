export type GraphicsImplType = "canvas" | "svg"

export const enum GraphicsCommandType {
    MoveTo,
    LineTo,
    BezierCurveTo,
    QuadraticBezierCurveTo,
    ArcTo,
    Close
}

export type GraphicsCommand =
    | GraphicsMoveToCommand
    | GraphicsLineToCommand
    | GraphicsBezierCurveToCommand
    | GraphicsQuadraticBezierCurveToCommand
    | GraphicsArcToCommand
    | GraphicsCloseCommand

export type GraphicsMoveToCommand = {
    type: GraphicsCommandType.MoveTo
    x: number
    y: number
    currentX: number
    currentY: number
}
export type GraphicsLineToCommand = {
    type: GraphicsCommandType.LineTo
    x: number
    y: number
    currentX: number
    currentY: number
}
export type GraphicsBezierCurveToCommand = {
    type: GraphicsCommandType.BezierCurveTo
    cp1x: number
    cp1y: number
    cp2x: number
    cp2y: number
    x: number
    y: number
    currentX: number
    currentY: number
}
export type GraphicsQuadraticBezierCurveToCommand = {
    type: GraphicsCommandType.QuadraticBezierCurveTo
    cpx: number
    cpy: number
    x: number
    y: number
    currentX: number
    currentY: number
}
export type GraphicsArcToCommand = {
    type: GraphicsCommandType.ArcTo
    cx: number
    cy: number
    rx: number
    ry: number
    startAngle: number
    endAngle: number
    xAxisRotation: number
    anticlockwise: boolean

    x1: number
    y1: number
    x2: number
    y2: number

    largeArcFlag: boolean
    sweepFlag: boolean
    currentX: number
    currentY: number
}
export type GraphicsCloseCommand = {
    type: GraphicsCommandType.Close
    currentX: number
    currentY: number
}

//#region Svg commands
export const enum SvgCommandType {
    M = "M",
    L = "L",
    C = "C",
    Q = "Q",
    A = "A",
    Z = "Z"
}
export type SvgCommand = SvgMCommand | SvgLCommand | SvgCCommand | SvgQCommand | SvgACommand | SvgZCommand

export type SvgMCommand = {
    type: SvgCommandType.M
    x: number
    y: number
}
export type SvgLCommand = {
    type: SvgCommandType.L
    x: number
    y: number
}
export type SvgCCommand = {
    type: SvgCommandType.C
    x: number
    y: number
    cp1x: number
    cp1y: number
    cp2x: number
    cp2y: number
}
export type SvgQCommand = {
    type: SvgCommandType.Q
    x: number
    y: number
    cpx: number
    cpy: number
}
export type SvgACommand = {
    type: SvgCommandType.A
    x: number
    y: number
    rx: number
    ry: number
    largeArcFlag: boolean
    sweepFlag: boolean
    xAxisRotation: number
}
export type SvgZCommand = {
    type: SvgCommandType.Z
}
//#endregion

//#region Canvas commands
export const enum CanvasCommandType {
    MoveTo = "moveTo",
    LineTo = "lineTo",
    BezierCurveTo = "bezierCurveTo",
    QuadraticCurveTo = "quadraticCurveTo",
    Arc = "arc",
    Ellipse = "ellipse",
    ClosePath = "closePath"
}
export type CanvasCommand =
    | CanvasMoveToCommand
    | CanvasLineToCommand
    | CanvasBezierCurveToCommand
    | CanvasQuadraticCurveToCommand
    | CanvasArcCommand
    | CanvasEllipseCommand
    | CanvasClosePathCommand

export type CanvasMoveToCommand = {
    type: CanvasCommandType.MoveTo
    x: number
    y: number
}
export type CanvasLineToCommand = {
    type: CanvasCommandType.LineTo
    x: number
    y: number
}
export type CanvasBezierCurveToCommand = {
    type: CanvasCommandType.BezierCurveTo
    x: number
    y: number
    cp1x: number
    cp1y: number
    cp2x: number
    cp2y: number
}
export type CanvasQuadraticCurveToCommand = {
    type: CanvasCommandType.QuadraticCurveTo
    x: number
    y: number
    cpx: number
    cpy: number
}
export type CanvasArcCommand = {
    type: CanvasCommandType.Arc
    x: number
    y: number
    r: number
    startAngle: number
    endAngle: number
    anticlockwise: boolean
}
export type CanvasEllipseCommand = {
    type: CanvasCommandType.Ellipse
    x: number
    y: number
    rx: number
    ry: number
    startAngle: number
    endAngle: number
    xAxisRotation: number
    anticlockwise: boolean
}
export type CanvasClosePathCommand = {
    type: CanvasCommandType.ClosePath
}
//#endregion

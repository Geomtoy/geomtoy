export type GraphicImplType = "canvas" | "svg"

export const enum GraphicDirectiveType {
    MoveTo,
    LineTo,
    BezierCurveTo,
    QuadraticBezierCurveTo,
    ArcTo,
    Close
}

export type GraphicDirective = GraphicMoveToDirective | GraphicLineToDirective | GraphicBezierCurveToDirective | GraphicQuadraticBezierCurveToDirective | GraphicArcToDirective | GraphicCloseDirective

export type GraphicMoveToDirective = {
    type: GraphicDirectiveType.MoveTo
    x: number
    y: number
    currentX: number
    currentY: number
}
export type GraphicLineToDirective = {
    type: GraphicDirectiveType.LineTo
    x: number
    y: number
    currentX: number
    currentY: number
}
export type GraphicBezierCurveToDirective = {
    type: GraphicDirectiveType.BezierCurveTo
    cp1x: number
    cp1y: number
    cp2x: number
    cp2y: number
    x: number
    y: number
    currentX: number
    currentY: number
}
export type GraphicQuadraticBezierCurveToDirective = {
    type: GraphicDirectiveType.QuadraticBezierCurveTo
    cpx: number
    cpy: number
    x: number
    y: number
    currentX: number
    currentY: number
}
export type GraphicArcToDirective = {
    type: GraphicDirectiveType.ArcTo
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
export type GraphicCloseDirective = {
    type: GraphicDirectiveType.Close
    currentX: number
    currentY: number
}

//#region Svg directives
export const enum SvgDirectiveType {
    M = "M",
    L = "L",
    C = "C",
    Q = "Q",
    A = "A",
    Z = "Z"
}
export type SvgDirective = SvgMDirective | SvgLDirective | SvgCDirective | SvgQDirective | SvgADirective | SvgZDirective

export type SvgMDirective = {
    type: SvgDirectiveType.M
    x: number
    y: number
}
export type SvgLDirective = {
    type: SvgDirectiveType.L
    x: number
    y: number
}
export type SvgCDirective = {
    type: SvgDirectiveType.C
    x: number
    y: number
    cp1x: number
    cp1y: number
    cp2x: number
    cp2y: number
}
export type SvgQDirective = {
    type: SvgDirectiveType.Q
    x: number
    y: number
    cpx: number
    cpy: number
}
export type SvgADirective = {
    type: SvgDirectiveType.A
    x: number
    y: number
    rx: number
    ry: number
    largeArcFlag: boolean
    sweepFlag: boolean
    xAxisRotation: number
}
export type SvgZDirective = {
    type: SvgDirectiveType.Z
}
//#endregion

//#region Canvas directives
export const enum CanvasDirectiveType {
    MoveTo = "moveTo",
    LineTo = "lineTo",
    BezierCurveTo = "bezierCurveTo",
    QuadraticCurveTo = "quadraticCurveTo",
    Arc = "arc",
    Ellipse = "ellipse",
    ClosePath = "closePath"
}
export type CanvasDirective =
    | CanvasMoveToDirective
    | CanvasLineToDirective
    | CanvasBezierCurveToDirective
    | CanvasQuadraticCurveToDirective
    | CanvasArcDirective
    | CanvasEllipseDirective
    | CanvasClosePathDirective

export type CanvasMoveToDirective = {
    type: CanvasDirectiveType.MoveTo
    x: number
    y: number
}
export type CanvasLineToDirective = {
    type: CanvasDirectiveType.LineTo
    x: number
    y: number
}
export type CanvasBezierCurveToDirective = {
    type: CanvasDirectiveType.BezierCurveTo
    x: number
    y: number
    cp1x: number
    cp1y: number
    cp2x: number
    cp2y: number
}
export type CanvasQuadraticCurveToDirective = {
    type: CanvasDirectiveType.QuadraticCurveTo
    x: number
    y: number
    cpx: number
    cpy: number
}
export type CanvasArcDirective = {
    type: CanvasDirectiveType.Arc
    x: number
    y: number
    r: number
    startAngle: number
    endAngle: number
    anticlockwise: boolean
}
export type CanvasEllipseDirective = {
    type: CanvasDirectiveType.Ellipse
    x: number
    y: number
    rx: number
    ry: number
    startAngle: number
    endAngle: number
    xAxisRotation: number
    anticlockwise: boolean
}
export type CanvasClosePathDirective = {
    type: CanvasDirectiveType.ClosePath
}
//#endregion

export type PathCommand = PathMoveToCommand | PathLineToCommand | PathBezierCurveToCommand | PathQuadraticBezierCurveToCommand | PathArcToCommand

export const enum PathCommandType {
    MoveTo = "M",
    LineTo = "L",
    BezierCurveTo = "C",
    QuadraticBezierCurveTo = "Q",
    ArcTo = "A"
}

export type PathMoveToCommand = {
    type: PathCommandType.MoveTo
    coordinate: [number, number]
    uuid: string
}
export type PathLineToCommand = {
    type: PathCommandType.LineTo
    coordinate: [number, number]
    uuid: string
}
export type PathBezierCurveToCommand = {
    type: PathCommandType.BezierCurveTo
    controlPoint1Coordinate: [number, number]
    controlPoint2Coordinate: [number, number]
    coordinate: [number, number]
    uuid: string
}
export type PathQuadraticBezierCurveToCommand = {
    type: PathCommandType.QuadraticBezierCurveTo
    controlPointCoordinate: [number, number]
    coordinate: [number, number]
    uuid: string
}
export type PathArcToCommand = {
    type: PathCommandType.ArcTo
    radiusX: number
    radiusY: number
    xAxisRotation: number
    largeArc: boolean
    positive: boolean
    coordinate: [number, number]
    uuid: string
}

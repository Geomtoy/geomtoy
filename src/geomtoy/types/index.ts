export type Coordinate = [x: number, y: number]
export enum AnglePositive {
    Clockwise,
    Anticlockwise
}

export enum GraphicDirectiveType {
    M = "moveTo",
    L = "lineTo",
    C = "bezierCurveTo",
    Q = "quadraticBezierCurveTo",
    A = "arcTo",
    Z = "close"
}
export enum GraphicImplType {
    Canvas,
    Svg
}

export type GraphicDirective =
    | GraphicMoveToDirective
    | GraphicLineToDirective
    | GraphicBezierCurveToDirective
    | GraphicQuadraticBezierCurveToDirective
    | GraphicArcToDirective
    | GraphicCloseDirective

// prettier-ignore
export type GraphicMoveToDirective = {
    type: GraphicDirectiveType.M,
    x: number,
    y: number,
    currentX:number,
    currentY:number
}
export interface SvgMoveToDirective{
    
}


// prettier-ignore
export type GraphicLineToDirective = {
    type: GraphicDirectiveType.L,
    x: number,
    y: number,
    currentX:number,
    currentY:number
}
// prettier-ignore
export type GraphicBezierCurveToDirective = {
    type: GraphicDirectiveType.C,
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
    currentX:number,
    currentY:number
}
// prettier-ignore
export type GraphicQuadraticBezierCurveToDirective = {
    type: GraphicDirectiveType.Q,
    cpx: number,
    cpy: number,
    x: number,
    y: number,
    currentX:number,
    currentY:number
}
// prettier-ignore
export type GraphicArcToDirective = {
    type: GraphicDirectiveType.A
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

// prettier-ignore
// export type GraphicCenterArcToDirective = {
//     type: GraphicDirectiveType.A,
//     x: number,
//     y: number,
//     rx: number,
//     ry: number,
//     startAngle: number,
//     endAngle: number,
//     xAxisRotation: number,
//     anticlockwise: boolean,
//     currentX:number,
//     currentY:number
// }
// // prettier-ignore
// export type GraphicEndpointArcToDirective = {
//     type: GraphicDirectiveType.A,
//     x: number,
//     y: number,
//     rx: number,
//     ry: number,
//     largeArcFlag: boolean,
//     sweepFlag: boolean,
//     xAxisRotation: number,
//     currentX:number,
//     currentY:number
// }
// prettier-ignore
export type GraphicCloseDirective = {
    type: GraphicDirectiveType.Z,
    currentX:number,
    currentY:number
}

export declare type Coordinate = [x: number, y: number];
export declare enum AnglePositive {
    Clockwise = 0,
    Anticlockwise = 1
}
export declare enum GraphicDirectiveType {
    M = "moveTo",
    L = "lineTo",
    C = "bezierCurveTo",
    Q = "quadraticBezierCurveTo",
    A = "arcTo",
    Z = "close"
}
export declare enum GraphicImplType {
    Canvas = 0,
    Svg = 1
}
export declare type GraphicDirective = GraphicMoveToDirective | GraphicLineToDirective | GraphicBezierCurveToDirective | GraphicQuadraticBezierCurveToDirective | GraphicArcToDirective | GraphicCloseDirective;
export declare type GraphicMoveToDirective = {
    type: GraphicDirectiveType.M;
    x: number;
    y: number;
    currentX: number;
    currentY: number;
};
export interface SvgMoveToDirective {
}
export declare type GraphicLineToDirective = {
    type: GraphicDirectiveType.L;
    x: number;
    y: number;
    currentX: number;
    currentY: number;
};
export declare type GraphicBezierCurveToDirective = {
    type: GraphicDirectiveType.C;
    cp1x: number;
    cp1y: number;
    cp2x: number;
    cp2y: number;
    x: number;
    y: number;
    currentX: number;
    currentY: number;
};
export declare type GraphicQuadraticBezierCurveToDirective = {
    type: GraphicDirectiveType.Q;
    cpx: number;
    cpy: number;
    x: number;
    y: number;
    currentX: number;
    currentY: number;
};
export declare type GraphicArcToDirective = {
    type: GraphicDirectiveType.A;
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    startAngle: number;
    endAngle: number;
    xAxisRotation: number;
    anticlockwise: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    largeArcFlag: boolean;
    sweepFlag: boolean;
    currentX: number;
    currentY: number;
};
export declare type GraphicCloseDirective = {
    type: GraphicDirectiveType.Z;
    currentX: number;
    currentY: number;
};

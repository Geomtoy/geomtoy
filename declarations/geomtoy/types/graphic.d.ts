export declare type GraphicImplType = "canvas" | "svg";
export declare enum GraphicDirectiveType {
    MoveTo = 0,
    LineTo = 1,
    BezierCurveTo = 2,
    QuadraticBezierCurveTo = 3,
    ArcTo = 4,
    Close = 5
}
export declare type GraphicDirective = GraphicMoveToDirective | GraphicLineToDirective | GraphicBezierCurveToDirective | GraphicQuadraticBezierCurveToDirective | GraphicArcToDirective | GraphicCloseDirective;
export declare type GraphicMoveToDirective = {
    type: GraphicDirectiveType.MoveTo;
    x: number;
    y: number;
    currentX: number;
    currentY: number;
};
export declare type GraphicLineToDirective = {
    type: GraphicDirectiveType.LineTo;
    x: number;
    y: number;
    currentX: number;
    currentY: number;
};
export declare type GraphicBezierCurveToDirective = {
    type: GraphicDirectiveType.BezierCurveTo;
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
    type: GraphicDirectiveType.QuadraticBezierCurveTo;
    cpx: number;
    cpy: number;
    x: number;
    y: number;
    currentX: number;
    currentY: number;
};
export declare type GraphicArcToDirective = {
    type: GraphicDirectiveType.ArcTo;
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
    type: GraphicDirectiveType.Close;
    currentX: number;
    currentY: number;
};
export declare enum SvgDirectiveType {
    M = "M",
    L = "L",
    C = "C",
    Q = "Q",
    A = "A",
    Z = "Z"
}
export declare type SvgDirective = SvgMDirective | SvgLDirective | SvgCDirective | SvgQDirective | SvgADirective | SvgZDirective;
export declare type SvgMDirective = {
    type: SvgDirectiveType.M;
    x: number;
    y: number;
};
export declare type SvgLDirective = {
    type: SvgDirectiveType.L;
    x: number;
    y: number;
};
export declare type SvgCDirective = {
    type: SvgDirectiveType.C;
    x: number;
    y: number;
    cp1x: number;
    cp1y: number;
    cp2x: number;
    cp2y: number;
};
export declare type SvgQDirective = {
    type: SvgDirectiveType.Q;
    x: number;
    y: number;
    cpx: number;
    cpy: number;
};
export declare type SvgADirective = {
    type: SvgDirectiveType.A;
    x: number;
    y: number;
    rx: number;
    ry: number;
    largeArcFlag: boolean;
    sweepFlag: boolean;
    xAxisRotation: number;
};
export declare type SvgZDirective = {
    type: SvgDirectiveType.Z;
};
export declare enum CanvasDirectiveType {
    MoveTo = "moveTo",
    LineTo = "lineTo",
    BezierCurveTo = "bezierCurveTo",
    QuadraticCurveTo = "quadraticCurveTo",
    Arc = "arc",
    Ellipse = "ellipse",
    ClosePath = "closePath"
}
export declare type CanvasDirective = CanvasMoveToDirective | CanvasLineToDirective | CanvasBezierCurveToDirective | CanvasQuadraticCurveToDirective | CanvasArcDirective | CanvasEllipseDirective | CanvasClosePathDirective;
export declare type CanvasMoveToDirective = {
    type: CanvasDirectiveType.MoveTo;
    x: number;
    y: number;
};
export declare type CanvasLineToDirective = {
    type: CanvasDirectiveType.LineTo;
    x: number;
    y: number;
};
export declare type CanvasBezierCurveToDirective = {
    type: CanvasDirectiveType.BezierCurveTo;
    x: number;
    y: number;
    cp1x: number;
    cp1y: number;
    cp2x: number;
    cp2y: number;
};
export declare type CanvasQuadraticCurveToDirective = {
    type: CanvasDirectiveType.QuadraticCurveTo;
    x: number;
    y: number;
    cpx: number;
    cpy: number;
};
export declare type CanvasArcDirective = {
    type: CanvasDirectiveType.Arc;
    x: number;
    y: number;
    r: number;
    startAngle: number;
    endAngle: number;
    anticlockwise: boolean;
};
export declare type CanvasEllipseDirective = {
    type: CanvasDirectiveType.Ellipse;
    x: number;
    y: number;
    rx: number;
    ry: number;
    startAngle: number;
    endAngle: number;
    xAxisRotation: number;
    anticlockwise: boolean;
};
export declare type CanvasClosePathDirective = {
    type: CanvasDirectiveType.ClosePath;
};

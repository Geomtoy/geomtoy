import { GraphicDirectiveType, GraphicImplType, GraphicDirective } from "../types";
export { GraphicDirectiveType };
export default class Graphic {
    directives: Array<GraphicDirective>;
    currentX: number;
    currentY: number;
    startX: number;
    startY: number;
    constructor();
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    quadraticBezierCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    centerArcTo(cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number, xAxisRotation: number, anticlockwise?: boolean): void;
    endpointArcTo(x: number, y: number, rx: number, ry: number, largeArcFlag: boolean, sweepFlag: boolean, xAxisRotation: number): void;
    close(): void;
    static canvasDirectives: {
        moveTo: string;
        lineTo: string;
        bezierCurveTo: string;
        quadraticCurveTo: string;
        arc: string;
        ellipse: string;
        closePath: string;
    };
    static svgDirectives: {
        M: string;
        L: string;
        C: string;
        Q: string;
        A: string;
        Z: string;
    };
    valueOf(type: GraphicImplType): Array<object>;
}

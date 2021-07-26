import { GraphicDirectiveType, GraphicImplType, GraphicDirective, SvgDirectiveType, SvgDirective, CanvasDirectiveType, CanvasDirective } from "../types";
export { GraphicDirectiveType };
export default class Graphic {
    directives: Array<GraphicDirective>;
    currentX: number;
    currentY: number;
    startX: number;
    startY: number;
    constructor();
    moveTo(x: number, y: number): Graphic;
    lineTo(x: number, y: number): Graphic;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): Graphic;
    quadraticBezierCurveTo(cpx: number, cpy: number, x: number, y: number): Graphic;
    centerArcTo(cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number, xAxisRotation: number, anticlockwise?: boolean): Graphic;
    endpointArcTo(x: number, y: number, rx: number, ry: number, largeArcFlag: boolean, sweepFlag: boolean, xAxisRotation: number): Graphic;
    close(): Graphic;
    static canvasDirectiveType: typeof CanvasDirectiveType;
    static svgDirectiveType: typeof SvgDirectiveType;
    valueOf(type: GraphicImplType): Array<SvgDirective | CanvasDirective>;
}

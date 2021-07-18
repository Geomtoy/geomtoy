import Point from "../Point";
declare enum Directive {
    M = "moveTo",
    L = "lineTo",
    C = "bezierCurveTo",
    Q = "quadraticBezierCurveTo",
    A = "arcTo",
    Z = "close"
}
export default class Path {
    #private;
    path: Array<[Directive, ...Array<number | boolean>]>;
    constructor();
    static D: typeof Directive;
    moveTo(p: Point): void;
    moveTo(x: number, y: number): void;
    lineTo(p: Point): void;
    lineTo(x: number, y: number): void;
    close(): void;
    centerArcTo(cx: number, cy: number, r: number, sa: number, ea: number, anticlockwise?: boolean): void;
    endpointArcTo(rx: number, ry: number, rotate: number, largeArcFlag: boolean, sweepFlag: boolean, x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    bezierCurveTo(cp1: Point, cp2: Point, p: Point): void;
    quadraticBezierCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    quadraticBezierCurveTo(cp: Point, p: Point): void;
    valueOf(type: "canvas" | "svg"): [Directive, ...(number | boolean)[]][];
}
export {};

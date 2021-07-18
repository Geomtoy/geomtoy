export default Rectangle;
declare class Rectangle {
    static fromPoints(p1: any, p2: any): Rectangle;
    static standardize(rect: any): Rectangle | undefined;
    static "__#1@#standardize"(_new: any, rect: any): Rectangle | undefined;
    static pad(rect: any, s: any): Rectangle | undefined;
    /**
     *
     * @param {Boolean} _new
     * @param {Rectangle} rect
     * @param {Size} s
     * @returns {Rectangle | undefined}
     */
    static "__#1@#pad"(_new: boolean, rect: Rectangle, s: Size): Rectangle | undefined;
    static "__#1@#scale"(): void;
    static "__#1@#translate"(): void;
    static "__#1@#rotate"(): void;
    static "__#1@#inflate"(): void;
    constructor(x: any, y: any, w: any, h: any, r: any);
    x: any;
    y: any;
    width: any;
    height: any;
    rotation: any;
    set size(arg: Size);
    get size(): Size;
    set origin(arg: Point);
    get origin(): Point;
    get p1(): Point;
    get p2(): Point;
    get p3(): Point;
    get p4(): Point;
    standardize(): Rectangle;
    pad(s: any): Rectangle;
}
import Size from "./Size";
import Point from "./Point";

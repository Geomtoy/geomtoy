import Point from "../Point";
import Line from "../Line";
import Matrix from "./Matrix";
declare class Transformation {
    #private;
    get(): Matrix;
    set(transformation: Matrix): void;
    translate(deltaX: number, deltaY: number): this;
    rotate(angle: number, origin: Point): this;
    scale(factorX: number, factorY: number, origin: Point): this;
    skew(angleX: number, angleY: number, origin: Point): this;
    lineReflect(line: Line): this;
    pointReflect(point: Point): this;
    transform(a: number, b: number, c: number, d: number, e: number, f: number): this;
}
export default Transformation;

import Point from "../Point";
import { Coordinate } from "../types";
import Matrix from "./Matrix";
declare class PointReflection extends Matrix {
    #private;
    constructor(pointX: number, pointY: number);
    constructor(pointCoordinate: Coordinate);
    constructor(point: Point);
    constructor();
    get point(): Point;
    set point(value: Point);
    static get zero(): PointReflection;
}
export default PointReflection;

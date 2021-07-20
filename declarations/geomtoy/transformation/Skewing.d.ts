import Matrix from "./Matrix";
import Point from "../Point";
import { Coordinate } from "../types";
declare class Skewing extends Matrix {
    #private;
    constructor(angleX: number, angleY: number, originX: number, originY: number);
    constructor(angleX: number, angleY: number, originCoordinate: Coordinate);
    constructor(angleX: number, angleY: number, origin: Point);
    constructor(angleX: number, angleY: number);
    constructor();
    get angleX(): number;
    set angleX(value: number);
    get angleY(): number;
    set angleY(value: number);
    get origin(): Point;
    set origin(value: Point);
}
export default Skewing;

import Matrix from "./Matrix";
import Point from "../Point";
import { Coordinate } from "../types";
declare class Skewing extends Matrix {
    angleX: number;
    angleY: number;
    constructor(angleX: number, angleY: number, originX: number, originY: number);
    constructor(angleX: number, angleY: number, originCoordinate: Coordinate);
    constructor(angleX: number, angleY: number, origin: Point);
    constructor(angleX: number, angleY: number);
    constructor();
}
export default Skewing;

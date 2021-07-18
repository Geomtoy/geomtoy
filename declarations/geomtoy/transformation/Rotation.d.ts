import Matrix from "./Matrix";
import Point from "../Point";
import { Coordinate } from "../types";
declare class Rotation extends Matrix {
    #private;
    constructor(angle: number, originX: number, originY: number);
    constructor(angle: number, originCoordinate: Coordinate);
    constructor(angle: number, origin: Point);
    constructor(angle: number);
    constructor();
    get angle(): number;
    set angle(value: number);
    get origin(): Point;
    set origin(value: Point);
    clone(): Rotation;
}
export default Rotation;

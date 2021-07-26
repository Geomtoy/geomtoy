import Matrix from "./Matrix";
import Point from "../Point";
declare class Rotation extends Matrix {
    #private;
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

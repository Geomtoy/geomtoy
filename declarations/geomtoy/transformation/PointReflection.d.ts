import Point from "../Point";
import Matrix from "./Matrix";
declare class PointReflection extends Matrix {
    #private;
    constructor(point: Point);
    constructor();
    get point(): Point;
    set point(value: Point);
    clone(): PointReflection;
}
export default PointReflection;

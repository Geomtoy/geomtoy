import Matrix from "./Matrix";
import Point from "../Point";
declare class Scaling extends Matrix {
    #private;
    constructor(factorX: number, factorY: number, origin: Point);
    constructor(factorX: number, factorY: number);
    constructor();
    get factorX(): number;
    set factorX(value: number);
    get factorY(): number;
    set factorY(value: number);
    get origin(): Point;
    set origin(value: Point);
    clone(): Scaling;
}
export default Scaling;

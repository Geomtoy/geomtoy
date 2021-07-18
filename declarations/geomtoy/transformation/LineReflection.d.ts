import Line from "../Line";
import Matrix from "./Matrix";
declare class LineReflection extends Matrix {
    #private;
    constructor(a: number, b: number, c: number);
    constructor(line: Line);
    constructor();
    get line(): Line;
    set line(value: Line);
    static get yAxis(): LineReflection;
    static get xAxis(): LineReflection;
    static get yEqPositiveX(): LineReflection;
    static get yEqNegativeX(): LineReflection;
}
export default LineReflection;

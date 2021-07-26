import Matrix from "./Matrix";
import Line from "../Line";
declare class LineReflection extends Matrix {
    #private;
    constructor(line: Line);
    get line(): Line;
    set line(value: Line);
    static get yAxis(): LineReflection;
    static get xAxis(): LineReflection;
    static get yEqPositiveX(): LineReflection;
    static get yEqNegativeX(): LineReflection;
    clone(): LineReflection;
}
export default LineReflection;

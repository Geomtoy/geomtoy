import Matrix from "./Matrix";
import Line from "../Line";
declare class LineReflection extends Matrix {
    #private;
    constructor(line: Line);
    get line(): Line;
    set line(value: Line);
    clone(): LineReflection;
}
export default LineReflection;

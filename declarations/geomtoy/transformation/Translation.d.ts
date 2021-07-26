import Matrix from "./Matrix";
declare class Translation extends Matrix {
    #private;
    constructor(deltaX: number, deltaY: number);
    constructor();
    get deltaX(): number;
    set deltaX(value: number);
    get deltaY(): number;
    set deltaY(value: number);
    clone(): Translation;
}
export default Translation;

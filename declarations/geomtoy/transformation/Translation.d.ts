import Matrix from "./Matrix";
declare class Translation extends Matrix {
    #private;
    constructor(offsetX: number, offsetY: number);
    constructor();
    get offsetX(): number;
    set offsetX(value: number);
    get offsetY(): number;
    set offsetY(value: number);
    clone(): Translation;
}
export default Translation;

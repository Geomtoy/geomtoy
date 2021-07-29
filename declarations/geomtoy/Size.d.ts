export default Size;
declare class Size {
    static fromPoints(p1: any, p2: any): Size;
    static isSize(s: any): boolean;
    static zero(): Size;
    static fromPoint(p: any): Size;
    static standardize(s: any): Size;
    static add(s1: any, s2: any): Size;
    static translate(s1: any, s2: any): Size;
    static subtract(s1: any, s2: any): Size;
    static multiply(s: any, n: any): Size;
    static scale(s: any, n: any): Size;
    static divide(s: any, n: any): Size;
    constructor(w: any, h: any);
    width: any;
    height: any;
    isZeroSize(): boolean;
    isEqualTo(s: any): any;
    standardize(): Size;
    keepAspectRadioAndFit(size: any, keepInside?: boolean): Size;
    add(s: any): Size;
    translate(s: any): Size;
    subtract(s: any): Size;
    multiply(n: any): Size;
    scale(n: any): Size;
    divide(n: any): Size;
    toArray(): any[];
    toObject(): {
        width: any;
        height: any;
    };
    toString(): string;
}

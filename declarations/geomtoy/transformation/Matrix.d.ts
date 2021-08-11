import LineReflection from "./LineReflection";
import PointReflection from "./PointReflection";
import Rotation from "./Rotation";
import Scaling from "./Scaling";
import Skewing from "./Skewing";
import Translation from "./Translation";
declare class Matrix {
    #private;
    constructor(a: number, b: number, c: number, d: number, e: number, f: number);
    constructor(m: Matrix);
    constructor(m: Translation);
    constructor(m: Rotation);
    constructor(m: Scaling);
    constructor(m: Skewing);
    constructor(m: LineReflection);
    constructor(m: PointReflection);
    constructor();
    get a(): number;
    set a(value: number);
    get b(): number;
    set b(value: number);
    get c(): number;
    set c(value: number);
    get d(): number;
    set d(value: number);
    get e(): number;
    set e(value: number);
    get f(): number;
    set f(value: number);
    isSameAs(matrix: Matrix): boolean;
    static get identity(): Matrix;
    isIdentity(): boolean;
    resetToIdentity(): void;
    preMultiply(matrix: Matrix): Matrix;
    preMultiplySelf(matrix: Matrix): this;
    postMultiply(matrix: Matrix): Matrix;
    postMultiplySelf(matrix: Matrix): this;
    decompose(): {
        rotation: number | undefined;
        scaleX: number;
        scaleY: number;
        skewX: number | undefined;
        skewY: number | undefined;
        translateX: number;
        translateY: number;
    };
    static multiply(matrix1: Matrix, matrix2: Matrix): {
        a: number;
        b: number;
        c: number;
        d: number;
        e: number;
        f: number;
    };
    transformCoordinate(coordinate: [number, number]): [number, number];
    /**
     * Convert the coordinate corresponding to the identity matrix (in the initial state without transformation)
     * to the coordinate with the current transformation,
     * and the visual position of the coordinate will not change
     * @param {[number,number]} coordinate
     * @returns {[number,number]}
     */
    beforeTransformed(coordinate: [number, number]): [number, number];
    /**
     * Convert the coordinate with the current transformation
     * to the coordinate corresponding to the identity matrix (in the initial state without transformation),
     * and the visual position of the coordinate will not change
     * @param {[number,number]} coordinate
     * @returns {[number,number]}
     */
    afterTransformed(coordinate: [number, number]): [number, number];
    /**
     * Find the determinant of a matrix
     * @returns {number}
     */
    determinant(): number;
    /**
     * Find the inverse of a matrix
     * @returns {Matrix | boolean}
     */
    inverse(): Matrix | boolean;
    inverseSelf(): Matrix | boolean;
    clone(): Matrix;
    toString(): string;
}
export default Matrix;

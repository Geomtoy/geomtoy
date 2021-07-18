import Point from "../Point";
import LineReflection from "./LineReflection";
import PointReflection from "./PointReflection";
import Rotation from "./Rotation";
import Scaling from "./Scaling";
import Skewing from "./Skewing";
import Translation from "./Translation";
declare class Matrix {
    #private;
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    constructor(a: number, b: number, c: number, d: number, e: number, f: number);
    constructor(m: Matrix);
    constructor(m: LineReflection);
    constructor(m: PointReflection);
    constructor(m: Translation);
    constructor(m: Rotation);
    constructor(m: Scaling);
    constructor(m: Skewing);
    constructor();
    isSameAs(m: Matrix): boolean;
    static get identity(): Matrix;
    isIdentity(): boolean;
    preMultiply(m: Matrix): Matrix;
    preMultiplyO(m: Matrix): this;
    postMultiply(m: Matrix): Matrix;
    postMultiplyO(m: Matrix): this;
    static matrixTransformPoint(matrix: Matrix, p: Point): Point;
    getPointBeforeMatrixTransformed(p: Point): Point;
    getPointAfterMatrixTransformed(p: Point): Point;
    /**
     * 求矩阵的行列式
     * @returns {number}
     */
    determinant(): number;
    /**
     * 求矩阵的逆矩阵
     * @returns {Matrix | boolean}
     */
    inverse(): Matrix | boolean;
    clone(): Matrix;
    toString(): string;
}
export default Matrix;

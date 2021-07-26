import Point from "../Point";
import LineReflection from "./LineReflection";
import PointReflection from "./PointReflection";
import Rotation from "./Rotation";
import Scaling from "./Scaling";
import Skewing from "./Skewing";
import Translation from "./Translation";
import { Coordinate } from "../types";
import Vector from "../Vector";
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
    preMultiply(matrix: Matrix): Matrix;
    preMultiplySelf(matrix: Matrix): this;
    postMultiply(matrix: Matrix): Matrix;
    postMultiplySelf(matrix: Matrix): this;
    decompose(matrix: Matrix): {
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
    transformCoordinate(coordinate: Coordinate): Coordinate;
    transformPoint(point: Point): Point;
    transformVector(vector: Vector): Vector;
    /**
     * Convert the point corresponding to the identity matrix (in the initial state without transformation)
     * to the point with the current transformation,
     * and the actual position of the point will not change
     * @param point
     * @returns
     */
    pointBeforeTransformed(point: Point): Point;
    /**
     * Convert the point with the current transformation
     * to the point corresponding to the identity matrix (in the initial state without transformation),
     * and the actual position of the point will not change
     * @param point
     * @returns
     */
    pointAfterTransformed(point: Point): Point;
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

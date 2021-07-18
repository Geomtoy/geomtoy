import Point from "./Point";
import Segment from "./Segment";
import { Coordinate } from "./types";
declare class Vector {
    x: number;
    y: number;
    initial: Point;
    constructor(x: number, y: number);
    constructor(x1: number, y1: number, x2: number, y2: number);
    constructor(coordinate: Coordinate);
    constructor(initialCoordinate: Coordinate, terminalCoordinate: Coordinate);
    constructor(point: Point);
    constructor(initialPoint: Point, terminalPoint: Point);
    constructor(initialPoint: Point, terminalCoordinate: Coordinate);
    constructor(initialCoordinate: Coordinate, terminalPoint: Point);
    constructor(vector: Vector);
    constructor();
    /**
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2}
     */
    get angle(): number;
    static fromPoint(point: Point): Vector;
    static fromPoints(initialPoint: Point, terminalPoint: Point): Vector;
    static fromAngleAndLength(angle: number, length: number): Vector;
    static fromSegment(segment: Segment, reverse?: boolean): Vector;
    static get zero(): Vector;
    isZero(): boolean;
    isSameAs(v: Vector): boolean;
    isSameDirectionAs(v: Vector): boolean;
    isSameLengthAs(v: Vector): boolean;
    /**
     * `向量this`的长度（模）
     * @returns {Number}
     */
    getLength(): number;
    /**
     * `向量this`相对于x轴正方向V(1, 0)的逆时针旋转角度，零向量没有方向，故没有旋转角度
     * @returns {number | null}
     */
    getRotationAngle(): number | null;
    /**
     * `向量this`相对于x轴正方向V(1, 0)的夹角，零向量没有方向，故没有夹角
     * @returns {number | null}
     */
    getIncludedAngle(): number | null;
    /**
     * 两个向量之间的逆时针旋转角度，即从`向量this`，需要逆时针旋转多少角度才能与`向量v`方向相同
     * @param {Vector} v
     * @returns {number | null}
     */
    getRotationAngleBetween(v: Vector): number | null;
    /**
     * 两个向量之间的夹角，记作theta，0 <= theta <= Math.PI
     * @description 可以区分0和Math.PI，即可以区分出同向和反向
     * @param {Vector} v
     * @returns {number | null}
     */
    getIncludedAngleBetween(v: Vector): number | null;
    /**
     * `向量this`与`向量v`的点乘
     * @summary V1(x1, y1) · V2(x2, y2) = x1 * x2 + y1 * y2
     * @param {Vector} v
     * @returns {number}
     */
    dotProduct(v: Vector): number;
    /**
     * `向量this`与`向量v`的叉乘（不考虑叉乘之后得到的向量方向）
     * @summary V1(x1, y1) × V2(x2, y2) = x1 * y2 – y1 * x2
     * @param {*} v
     * @returns {number}
     */
    crossProduct(v: Vector): number;
    normalize(): Vector;
    add(v: Vector): Vector;
    subtract(v: Vector): Vector;
    multiply(n: number): Vector;
    reverse(): Vector;
    rotate(angle: number): Vector;
    clone(): Vector;
}
export default Vector;

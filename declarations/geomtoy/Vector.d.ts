import Point from "./Point";
import Segment from "./Segment";
import { Coordinate } from "./types";
declare class Vector {
    #private;
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
     * 向量角度
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2}
     */
    get angle(): number;
    /**
     * 向量长度（模）
     * @returns {number}
     */
    get length(): number;
    static fromPoint(point: Point): Vector;
    static fromPoints(initialPoint: Point, terminalPoint: Point): Vector;
    static fromAngleAndLength(angle: number, length: number): Vector;
    static fromSegment(segment: Segment, reverse?: boolean): Vector;
    static get zero(): Vector;
    isZero(): boolean;
    isSameAs(v: Vector): boolean;
    isSameAngleAs(v: Vector): boolean;
    isSameLengthAs(v: Vector): boolean;
    /**
     * `向量this`到`向量v`的角差，记作theta，(-Math.PI, Math.PI]
     * angle本身已经处理了顺时针/逆时针正角的问题
     * @param {Vector} v
     * @returns {number}
     */
    angleBetween(v: Vector): number;
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

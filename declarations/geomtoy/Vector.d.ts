import Point from "./Point";
import Segment from "./Segment";
import { CanvasDirective, Coordinate, GraphicImplType, SvgDirective } from "./types";
import GeomObject from "./base/GeomObject";
import Transformation from "./transformation";
declare class Vector extends GeomObject {
    #private;
    constructor(x: number, y: number);
    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number);
    constructor(position: Coordinate | Point | Vector);
    constructor(point1Position: Coordinate | Point | Vector, point2Position: Coordinate | Point | Vector);
    constructor();
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    /**
     * Initial point of vector `this`, usually `Point.zero`
     */
    get point1(): Point;
    set point1(value: Point);
    /**
     * Terminal point of vector `this`
     */
    get point2(): Point;
    /**
     * The angle of vector `this`
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2}
     */
    get angle(): number;
    /**
     * The magnitude of vector `this`
     * @returns {number}
     */
    get magnitude(): number;
    static get zero(): Vector;
    static fromPoint(point: Point): Vector;
    static fromPoints(point1: Point, point2: Point): Vector;
    static fromAngleAndMagnitude(angle: number, magnitude: number): Vector;
    static fromSegment(segment: Segment, reverse?: boolean): Vector;
    /**
     * Whether vector `this` is `Vector.zero`
     * @returns {boolean}
     */
    isZero(): boolean;
    /**
     * Whether vector `this` is the same as vector `vector`
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs(vector: Vector): boolean;
    /**
     * Whether the angle of vector `this` is the same as vector `vector`
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAngleAs(vector: Vector): boolean;
    isSameMagnitudeAs(vector: Vector): boolean;
    /**
     * `向量this`到`向量v`的角差，记作theta，(-Math.PI, Math.PI]
     * angle本身已经处理了顺时针/逆时针正角的问题
     * @param {Vector} v
     * @returns {number}
     */
    angleTo(vector: Vector): number;
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
    scalarMultiply(scalar: number): Vector;
    reverse(): Vector;
    rotate(angle: number): Vector;
    clone(): Vector;
    getCoordinate(): Coordinate;
    apply(transformation: Transformation): Vector;
    /**
     * Get graphic object of `this`
     * @param {GraphicImplType} type
     * @returns {Array<SvgDirective | CanvasDirective>}
     */
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective>;
    toArray(): never[];
    toObject(): {};
    toString(): string;
}
export default Vector;

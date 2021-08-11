import Point from "./Point";
import Line from "./Line";
import GeomObject from "./base/GeomObject";
import Transformation from "./transformation";
import { GraphicImplType, SvgDirective, CanvasDirective } from "./types";
import Geomtoy from ".";
declare class Segment extends GeomObject {
    #private;
    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number);
    constructor(owner: Geomtoy, point1Coordinate: [number, number], point2Coordinate: [number, number]);
    constructor(owner: Geomtoy, point1: Point, point2: Point);
    get name(): string;
    get uuid(): string;
    get point1X(): number;
    set point1X(value: number);
    get point1Y(): number;
    set point1Y(value: number);
    get point1Coordinate(): [number, number];
    set point1Coordinate(value: [number, number]);
    get point1(): Point;
    set point1(value: Point);
    get point2X(): number;
    set point2X(value: number);
    get point2Y(): number;
    set point2Y(value: number);
    get point2Coordinate(): [number, number];
    set point2Coordinate(value: [number, number]);
    get point2(): Point;
    set point2(value: Point);
    /**
     * Get the angle of segment `this`, treated as a vector from `point1` to `point2`, the result is in the interval `(-Math.PI, Math.PI]`.
     */
    get angle(): number;
    /**
     * Get the length of segment `this`.
     */
    get length(): number;
    static fromPoints(owner: Geomtoy, point1: Point, point2: Point): Segment;
    isSameAs(segment: Segment): boolean;
    isSameAs2(segment: Segment): boolean;
    getPerpendicularlyBisectingLine(): void;
    getIntersectionPointWithLine(line: Line): Point | null;
    /**
     * Whether segment `this` is perpendicular to segment `segment`, regardless of whether they intersect.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isPerpendicularWithSegment(segment: Segment): boolean;
    /**
     * Whether segment `this` is parallel to segment `segment`, regardless of whether they are collinear or even the same.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isParallelToSegment(segment: Segment): boolean;
    /**
     * `线段this`与`线段s`是否共线，无论是否相接乃至相同
     * @param {Segment} segment
     * @returns {boolean}
     */
    isCollinearToSegment(segment: Segment): boolean;
    /**
     * `线段this`与`线段s`是否相接，即有且只有一个端点被共用(若两个共用则相同)，无论夹角为多少
     * @param {Segment} segment
     * @returns {boolean | Point} 接点
     */
    isJointedWithSegment(segment: Segment): boolean;
    getJointPointWithSegment(segment: Segment): Point | null;
    isOverlappedWithSegment(segment: Segment): boolean;
    getOverlapSegmentWithSegment(segment: Segment): Segment | null;
    isIntersectedWithSegment(segment: Segment): boolean;
    getIntersectionPointWithSegment(segment: Segment): Point | null;
    getMiddlePoint(): Point;
    /**
     * Get the lerping(**lerp** here means **linear interpolation and extrapolation**) point of segment `this`.
     * @description
     * - When the `weight` is in the interval `[0, 1]`, it is interpolation:
     *      - If "weight=0", return `point1`.
     *      - If "weight=1", return `point2`.
     *      - If "0<weight<1", return a point between `point1` and `point2`.
     * - When the `weight` is in the interval `(-Infinity, 0)` and `(1, Infinity)`, it is extrapolation:
     *      - If "weight<0", return a point exterior of `point1`.
     *      - If "weight>1", return a point exterior of `point2`.
     * @param {number} weight
     * @returns {Point}
     */
    getLerpingPoint(weight: number): Point;
    /**
     * Get the lerping ratio `weight` lerped by line `line `.
     * @description
     * - When `line` is parallel to `this`, return `NaN`.
     * - When `line` is intersected with `this`, return a number in the interval `[0, 1]`:
     *      - If `line` passes through `point1`, return 0.
     *      - If `line` passes through `point2`, return 1.
     * - When `line` is not parallel to and not intersected with `this`, return a number in the interval `(-Infinity, 0)` and `(1, Infinity)`.
     * @param {Line} line
     * @returns {number}
     */
    getLerpingRatioByLine(line: Line): number;
    /**
     * Get the division point of segment `this`.
     * @description
     * - When `lambda` is equal to -1, return `null`.
     * - When `lambda` is in the interval `[0, Infinity]`, return a internal division point, a point between `point1` and `point2`:
     *      - If "lambda=0", return `point1`.
     *      - If "lambda=Infinity", return `point2`.
     * - When `lambda` is in the interval `(-Infinity, -1)` and `(-1, 0)`, return a external division point:
     *      - If "-1<lambda<0", return a point exterior of `point1`.
     *      - If "lambda<-1", return a point exterior of `point2`.
     *
     * @param {number} lambda
     * @returns {Point}
     */
    getDivisionPoint(lambda: number): Point | null;
    /**
     * Get the division ratio `lambda` divided by line `line `.
     * @description
     * - When `line` is parallel to `this`, return `NaN`.
     * - When `line` is intersected with `this`, return a number in the interval `[0, Infinity]`:
     *      - If `line` passes through `point1`, return 0.
     *      - If `line` passes through `point2`, return `Infinity`.
     * - When `line` is not parallel to and not intersected with `this`, return a number in the interval `(-Infinity, -1)` and `(-1, 0)`.
     * @param {Line} line
     * @returns {number}
     */
    getDivisionRatioByLine(line: Line): number;
    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[];
    toArray(): number[];
    toObject(): {
        p1x: number;
        p1y: number;
        p2x: number;
        p2y: number;
    };
    toString(): string;
    apply(transformation: Transformation): GeomObject;
    clone(): GeomObject;
}
export default Segment;

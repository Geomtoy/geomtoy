import Point from "./Point";
import Segment from "./Segment";
import Rectangle from "./Rectangle";
import Circle from "./Circle";
import GeomObject from "./base/GeomObject";
import { GraphicImplType } from "./types";
import Transformation from "./transformation";
import Vector from "./Vector";
declare class Line extends GeomObject {
    #private;
    constructor(a: number, b: number, c: number);
    constructor(line: Line);
    get a(): number;
    set a(value: number);
    get b(): number;
    set b(value: number);
    get c(): number;
    set c(value: number);
    isSameAs(line: Line): boolean;
    /**
     * Determine a line from two points `point1` and `point2`.
     * @param {Point} point1
     * @param {Point} point2
     * @returns {Line}
     */
    static fromPoints(point1: Point, point2: Point): Line;
    /**
     * Get the line where the `segment` lies.
     * @param {Segment} segment
     * @returns {Line}
     */
    static fromSegment(segment: Segment): Line;
    static fromPointAndAngle(point: Point, angle: number): Line;
    static fromPointAndSlope(point: Point, slope: number): void;
    static fromVector(vector: Vector): Line;
    static fromIntercepts(interceptX: number, interceptY: number): void;
    static fromSlopeAndInterceptX(slope: number, interceptX: number): void;
    static fromSlopeAndInterceptY(slope: number, interceptY: number): void;
    /**
     * `直线this`的斜率
     * @returns {number}
     */
    getSlope(): number;
    /**
     * `直线this`的截距
     * @returns {number}
     */
    getInterceptY(): number;
    /**
     *
     * @returns {number}
     */
    getInterceptX(): number;
    getRandomPointOnLine(): void;
    isIntersectedWithCircle(circle: Circle): boolean;
    getIntersectionPointsWithCircle(circle: Circle): Point[] | null;
    isIntersectedWithLine(line: Line): boolean;
    getIntersectionPointWithLine(line: Line): Point | null;
    isIntersectedWithSegment(segment: Segment): boolean;
    getIntersectionPointWithSegment(segment: Segment): Point | null;
    isIntersectedWithRectangle(rectangle: Rectangle): boolean;
    getIntersectionPointWithRectangle(rectangle: Rectangle): true | null;
    getNormalLineAtPoint(): void;
    /**
     * 过`直线this`上一点`点point`的垂线
     * @param {Point} point
     * @returns {Line}
     */
    getPerpendicularLineWithPointOn(point: Point): Line | null;
    /**
     * `直线this`外一点`点point`到`直线this`的垂点（垂足）
     * @param {Line} l
     * @returns {Point | null}
     */
    getPerpendicularPointWithPointNotOn(point: Point): Point | null;
    /**
     * `直线this`与`直线line`是否平行（包括重合）
     * @param {Line} line
     * @returns
     */
    isParallelToLine(line: Line): boolean;
    /**
     * 若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回null
     * @param {Line} line
     * @returns {number | null}
     */
    getDistanceToParallelLine(line: Line): number | null;
    apply(transformation: Transformation): GeomObject;
    getGraphic(type: GraphicImplType): (import("./types").SvgDirective | import("./types").CanvasDirective)[];
    flatten(): this;
    clone(): Line;
    toArray(): number[];
    toObject(): {
        a: number;
        b: number;
        c: number;
    };
    toString(): string;
}
export default Line;

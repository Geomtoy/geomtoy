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
    static fromVector(vector: Vector): Line;
    static fromVector2(vector: Vector): Line;
    static fromPointAndVector(point: Point, vector: Vector): Line;
    static fromPointAndSlope(point: Point, slope: number): Line;
    static fromPointAndAngle(point: Point, angle: number): Line;
    static fromIntercepts(interceptX: number, interceptY: number): Line;
    static fromSlopeAndInterceptX(slope: number, interceptX: number): Line;
    static fromSlopeAndInterceptY(slope: number, interceptY: number): Line;
    /**
     * Whether line `this` is parallel(including identical) to line `line`
     * @summary
     * If two lines "a1x+b1y+c1=0" and "a2x+b2y+c2=0" are parallel(including identical) then
     * "k1=-(a1/b1)" and "k2=-(a2/b2)", "k1=k2", "a1b2=b1a2"
     * @param {Line} line
     * @returns
     */
    isParallelToLine(line: Line): boolean;
    /**
     * Whether line `this` is perpendicular to line `line`
     * @summary
     * If two lines "a1x+b1y+c1=0" and "a2x+b2y+c2=0" are perpendicular then
     * "k1=-(a1/b1)" and "k2=-(a2/b2)", "k1k2=-1", "a1a2=-b1b2"
     * @param {Line} line
     * @returns
     */
    isPerpendicularToLine(line: Line): boolean;
    simple(): void;
    simpleSelf(): void;
    /**
     * Get the slope of line `this`
     * @summary
     * If "b=0", line `this` is "ax+c=0". It is perpendicular to the x-axis, the slope is `NaN` or `Infinity`
     * @returns {number}
     */
    getSlope(): number;
    /**
     * Get the intercept on the y-axis of line `this`
     * @summary
     * If "b=0", line `this` is "ax+c=0". It is perpendicular to the x-axis, the intercept on the y-axis is `NaN` or `Infinity`
     * @returns {number}
     */
    getInterceptY(): number;
    /**
     * Get the intercept on the x-axis of line `this`
     * @summary
     * If "a=0", line `this` is "by+c=0". It is perpendicular to the y-axis, the intercept on the x-axis is `NaN` or `Infinity`
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

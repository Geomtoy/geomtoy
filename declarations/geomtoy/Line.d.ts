export default Line;
declare class Line {
    /**
     * 从`点point1`,`点point2`两个点确定一条直线
     * @param {Point} point1
     * @param {Point} point2
     * @returns this
     */
    static "__#72280@#fromPoints"(point1: Point, point2: Point): Line;
    static fromPoints(point1: any, point2: any): Line;
    static fromPointAndAngle(point: any, angle: any): void;
    static fromSegment(segment: any): Line;
    constructor(a: any, b: any, c: any);
    a: any;
    b: any;
    c: any;
    /**
     * `直线this`的斜率
     * @returns {Number}
     */
    getSlope(): number;
    /**
     * `直线this`的截距
     * @returns {Number}
     */
    getInterceptY(): number;
    getInterceptX(): number | null;
    getRandomPointOnLine(): Point;
    isIntersectedWithCircle(circle: any): boolean;
    getIntersectionPointsWithCircle(circle: any): true | Point[] | null;
    isIntersectedWithLine(line: any): boolean;
    getIntersectionPointWithLine(line: any): true | Point | null;
    isIntersectedWithSegment(segment: any): boolean;
    getIntersectionPointWithSegment(segment: any): true | Point | null;
    isIntersectedWithRectangle(rectangle: any): boolean;
    getIntersectionPointWithRectangle(rectangle: any): true | Point[] | null;
    getNormalLineAtPoint(): void;
    /**
     * 过`直线this`上一点`点point`的垂线
     * @param {Point} point
     * @returns {Line}
     */
    getPerpendicularLineWithPointOn(point: Point): Line;
    /**
     * `直线this`外一点`点point`到`直线this`的垂点（垂足）
     * @param {Line} l
     * @returns {Point | null}
     */
    getPerpendicularPointWithPointNotOn(point: any): Point | null;
    /**
     * `直线this`与`直线line`是否平行（包括重合）
     * @param {Line} line
     * @returns
     */
    isParallelToLine(line: Line): boolean;
    /**
     * 若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回null
     * @param {Line} line
     * @returns {Number | null}
     */
    getDistanceToParallelLine(line: Line): number | null;
    getGraphic(type: any): object[];
    clone(): Line;
    toArray(): any[];
    toObject(): {
        a: any;
        b: any;
        c: any;
    };
    toString(): string;
    #private;
}
import Point from "./Point";

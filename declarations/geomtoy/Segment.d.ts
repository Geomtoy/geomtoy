import Point from "./Point";
import Line from "./Line";
import GeomObject from "./base/GeomObject";
import Transformation from "./transformation";
import { GraphicImplType, SvgDirective, CanvasDirective, Coordinate } from "./types";
declare class Segment extends GeomObject {
    #private;
    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number);
    constructor(point1Position: Coordinate | Point, point2Position: Coordinate | Point);
    get point1(): Point;
    set point1(value: Point);
    get point2(): Point;
    set point2(value: Point);
    static fromPoints(point1: Point, point2: Point): Segment;
    isSameAs(segment: Segment): boolean;
    getIntersectionPointWithLine(line: Line): Point | null;
    /**
     * Whether segment `this` is perpendicular to segment `segment`,
     * regardless of whether they intersect,
     * the angle between them is `Math.PI / 2`
     * @param {Segment} segment
     * @returns {boolean}
     */
    isPerpendicularWithSegment(segment: Segment): boolean;
    /**
     * Whether segment `this` is parallel to segment `segment`,
     * regardless of whether they are collinear or even the same,
     * the angle between them is `0` or `Math.PI`
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
     * 获得从线段起点开始的lambda定比分点P
     * @description 当P为内分点时，lambda > 0；当P为外分点时，lambda < 0 && lambda !== -1；当P与A重合时，lambda === 0,当P与B重合时，lambda===1
     * @param {number} lambda
     * @returns {Point}
     */
    getInterpolatePoint(lambda: number): Point;
    /**
     * `直线l`分线段成两部分之间的比例
     * @param {Line} l
     * @returns {number}
     */
    getDivisionRatioByLine(l: Line): number;
    /**
     * `线段this`与x轴正方向的夹角，范围[-Math.PI, Math.PI]
     * @returns {number}
     */
    getAngle(): number;
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

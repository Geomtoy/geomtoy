export default Segment;
declare class Segment {
    static fromPoints(p1: any, p2: any): Segment;
    constructor(x1: any, y1: any, x2: any, y2: any);
    p1: any;
    p2: any;
    /**
     * `线段this`与`线段s`是否相同
     * @param {Segment} s
     * @returns {Boolean}
     */
    isSameAs(s: Segment): boolean;
    /**
     * `线段this`与`线段s`是否垂直，无论是否相交，夹角为Math.PI / 2
     * @param {Segment} s
     * @returns {Boolean}
     */
    isPerpendicularToSegment(s: Segment): boolean;
    /**
     * `线段this`与`线段s`是否平行，无论是否共线乃至相同，夹角为0或者Math.PI
     * @param {Segment} s
     * @returns {Boolean}
     */
    isParallelToSegment(s: Segment): boolean;
    /**
     * `线段this`与`线段s`是否共线，无论是否相接乃至相同
     * @param {Segment} s
     * @returns {Boolean}
     */
    isCollinearWithSegment(s: Segment): boolean;
    isJointedWithSegment(s: any): boolean;
    getJointPointWithSegment(s: any): true | Point | null;
    isOverlappedWithSegment(s: any): boolean;
    getOverlapSegmentWithSegment(s: any): true | Segment | null;
    isIntersectedWithSegment(segment: any): boolean;
    getIntersectionPointWithSegment(segment: any): true | Point | null;
    getMiddlePoint(): Point;
    /**
     * 获得从线段起点开始的lambda定比分点P
     * @description 当P为内分点时，lambda > 0；当P为外分点时，lambda < 0 && lambda !== -1；当P与A重合时，lambda === 0,当P与B重合时，lambda===1
     * @param {Number} lambda
     * @returns {Point}
     */
    getInterpolatePoint(lambda: number): Point;
    /**
     * `直线l`分线段成两部分之间的比例
     * @param {Line} l
     * @returns {Number}
     */
    getDivisionRatioByLine(l: Line): number;
    /**
     * `线段this`与x轴正方向的夹角，范围[-Math.PI, Math.PI]
     * @param {*} p
     * @returns
     */
    getAngle: () => number;
    getIntersectionPointWithLine(l: any): void;
    toArray(): any[];
    toObject(): {
        p1x: any;
        p1y: any;
        p2x: any;
        p2y: any;
    };
    toString(): string;
    #private;
}
import Point from "./Point";
import Line from "./Line";

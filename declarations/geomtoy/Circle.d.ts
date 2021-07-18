export default Circle;
declare class Circle {
    /**
     * 获取`圆circle1`和`圆circle2`的公切线信息
     * @param {circle} circle1
     * @param {circle} circle2
     * @returns {Array<Object> | null}
     */
    static getCommonTangentDataOfTwoCircles(circle1: any, circle2: any): Array<Object> | null;
    /**
     * 过不在两圆`圆circle1`和`圆circle2`上的一点`点point`，求两圆的公切圆
     * @param {*} circle1
     * @param {*} circle2
     * @param {*} point
     * @returns {Array<Circle>}
     */
    static getCommonTangentCirclesOfTwoCirclesThroughPointNotOn(circle1: any, circle2: any, point: any): Array<Circle>;
    constructor(radius: any, cx: any, cy: any);
    radius: any;
    cx: any;
    cy: any;
    get centerPoint(): Point;
    isSameAs(circle: any): boolean;
    /**
     * 获得圆上某个角度的点
     * @param {Number} angle
     * @returns
     */
    getPointAtAngle(angle: number): Point;
    /**
     * 若`点point`在`圆this`上，则求过`点point`的`圆this`的切线
     * @param {Point} point
     * @returns {Line | null}
     */
    getTangentLineAtPoint(point: Point): Line | null;
    getPerimeter(): number;
    getArcLengthBetween(p1: any, p2: any, clockwise?: boolean): number | null;
    getArcAngleBetween(p1: any, p2: any, clockwise?: boolean): number | null;
    /**
     * 若`点point`在`圆this`外，则求过`点point`的`圆this`的切线，一共有两个
     * @param {Point} point
     * @returns {Object | null}
     */
    getTangleDataWithPointOutside(point: Point): Object | null;
    /**
     * `圆point`和`圆this`是否相切（内切、外切）
     * @param {*} circle
     * @returns {Boolean}
     */
    isTangentWithCircle(circle: any): boolean;
    isInternallyTangentWithCircle(circle: any): boolean;
    isExternallyTangentWithCircle(circle: any): boolean;
    getInternallyTangentDataWithCircle(circle: any): {
        point: Point;
        line: Line | null;
    } | null;
    getExternallyTangentDataWithCircle(circle: any): {
        point: Point;
        line: Line | null;
    } | null;
    /**
     * `圆this`是否在`圆circle`的内部，被circle包含
     * @param {Circle} circle
     * @returns {Boolean}
     */
    isInsideCircle(circle: Circle): boolean;
    /**
     * `圆this`是否在`圆circle`的外部，包含circle
     * @param {Circle} circle
     * @returns
     */
    isOutsideCircle(circle: Circle): boolean;
    isIntersectedWithCircle(circle: any): boolean;
    getIntersectionPointsWithCircle(circle: any): Point[] | null;
    /**
     * 是否与`圆this`正交，过其中一交点分别作两圆的切线，两切线夹角（圆的交角）为直角
     * @param {circle} circle
     */
    isOrthogonalWithCircle(circle: any): void;
    getInscribedRegularPolygon(number: any, angle?: number): RegularPolygon;
    toArray(): any[];
    toObject(): {
        radius: any;
        cx: any;
        cy: any;
    };
    toString(): string;
}
import Point from "./Point";
import Line from "./Line";
import RegularPolygon from "./RegularPolygon";

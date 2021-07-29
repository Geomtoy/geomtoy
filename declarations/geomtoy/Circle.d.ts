import Point from "./Point";
import Line from "./Line";
import RegularPolygon from "./RegularPolygon";
import { CanvasDirective, Coordinate, GraphicImplType, SvgDirective } from "./types";
import GeomObject from "./base/GeomObject";
import Transformation from "./transformation";
declare class Circle extends GeomObject {
    #private;
    constructor(radius: number, centerX: number, centerY: number);
    constructor(radius: number, centerPosition: Coordinate | Point);
    get radius(): number;
    set radius(value: number);
    get cx(): number;
    set cx(value: number);
    get cy(): number;
    set cy(value: number);
    get centerPoint(): Point;
    set centerPoint(value: Point);
    isSameAs(circle: Circle): boolean;
    isConcentricWithCircle(circle: Circle): boolean;
    isIntersectedWithCircle(circle: Circle): boolean;
    isInternallyTangentWithCircle(circle: Circle): boolean;
    isExternallyTangentWithCircle(circle: Circle): boolean;
    isTangentWithCircle(circle: Circle): boolean;
    isWrappingOutsideCircle(circle: Circle): boolean;
    isWrappedInsideCircle(circle: Circle): boolean;
    isSeparatedFromCircle(circle: Circle): boolean;
    getEccentricity(): number;
    getPerimeter(): number;
    getArea(): number;
    getPointAtAngle(angle: number): Point;
    getAngleOfPoint(point: Point): number;
    getArcAngleBetweenPoints(point1: Point, point2: Point, positive?: boolean): number;
    getArcLengthBetweenPoints(point1: Point, point2: Point, positive?: boolean): number;
    /**
     * 若`点point`在`圆this`上，则求过`点point`的`圆this`的切线
     * @param {Point} point
     * @returns {Line | null}
     */
    getTangentLineAtPoint(point: Point): Line | null;
    getTangentLineAtAngle(angle: number): Line;
    /**
     * 若`点point`在`圆this`外，则求过`点point`的`圆this`的切线，一共有两个
     * @param {Point} point
     * @returns {object | null}
     */
    getTangleLineDataWithPointOutside(point: Point): object | null;
    getInternallyTangentDataWithCircle(circle: Circle): object;
    getExternallyTangentDataWithCircle(circle: Circle): {
        point: Point;
        line: Line | null;
    } | null;
    /**
     * `圆this`是否在`圆circle`的内部，被circle包含
     * @param {Circle} circle
     * @returns {boolean}
     */
    isInsideCircle(circle: Circle): boolean;
    /**
     * `圆this`是否在`圆circle`的外部，包含circle
     * @param {Circle} circle
     * @returns {boolean}
     */
    isOutsideCircle(circle: Circle): boolean;
    getIntersectionPointsWithCircle(circle: Circle): Point[] | null;
    /**
     * 是否与`圆this`正交，过其中一交点分别作两圆的切线，两切线夹角（圆的交角）为直角
     * @param {Circle} circle
     * @returns {boolean}
     */
    isOrthogonalWithCircle(circle: Circle): boolean;
    /**
     * 获取`圆circle1`和`圆circle2`的公切线信息
     * @param {circle} circle1
     * @param {circle} circle2
     * @returns {Array<object> | null}
     */
    static getCommonTangentDataOfTwoCircles(circle1: Circle, circle2: Circle): {
        line: any;
        points: any[];
    }[] | null;
    /**
     * 过不在两圆`circle1`和`circle2`上的一点`point`，求两圆的公切圆
     * @param {Circle} circle1
     * @param {Circle} circle2
     * @param {Point} point
     * @returns {Array<Circle> | null}
     */
    static getCommonTangentCirclesOfTwoCirclesThroughPointNotOn(circle1: Circle, circle2: Circle, point: Point): Array<Circle> | null;
    getInscribedRegularPolygon(sideCount: number, angle?: number): RegularPolygon;
    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[];
    apply(transformation: Transformation): GeomObject;
    clone(): Circle;
    toArray(): number[];
    toObject(): {
        radius: number;
        cx: number;
        cy: number;
    };
    toString(): string;
}
export default Circle;

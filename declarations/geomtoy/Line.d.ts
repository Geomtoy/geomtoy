import Point from "./Point";
import Segment from "./Segment";
import Circle from "./Circle";
import GeomObject from "./base/GeomObject";
import { CanvasDirective, GraphicImplType, SvgDirective } from "./types";
import Transformation from "./transformation";
import Vector from "./Vector";
import Geomtoy from ".";
import Polygon from "./Polygon";
declare class Line extends GeomObject {
    #private;
    constructor(owner: Geomtoy, a: number, b: number, c: number);
    get name(): string;
    get uuid(): string;
    get a(): number;
    set a(value: number);
    get b(): number;
    set b(value: number);
    get c(): number;
    set c(value: number);
    /**
     * The angle between line `this` and the positive x-axis, the result is in the interval `(-Math.PI / 2, Math.PI / 2]`.
     */
    get angle(): number;
    /**
     * The slope of line `this`, the result is in the interval `(-Infinity, Infinity]`.
     * @description
     * If "b=0", line `this` is perpendicular to the x-axis, the slope is `Infinity`.
     */
    get slope(): number;
    /**
     * The y-intercept of line `this`, the result is in the interval `(-Infinity, Infinity]`.
     * @description
     * If "b=0", line `this` is perpendicular to the x-axis, the y-intercept is `Infinity`.
     */
    get yIntercept(): number;
    /**
     * The x-intercept of line `this`, the result is in the interval `(-Infinity, Infinity]`.
     * @description
     * If "a=0", line `this` is perpendicular to the y-axis, the x-intercept is `Infinity`.
     */
    get xIntercept(): number;
    /**
     * Whether line `this` is the same as line `line`.
     * @param {Line} line
     * @returns {boolean}
     */
    isSameAs(line: Line): boolean;
    static yAxis(owner: Geomtoy): Line;
    static xAxis(owner: Geomtoy): Line;
    static yEqualPositiveX(owner: Geomtoy): Line;
    static yEqualNegativeX(owner: Geomtoy): Line;
    /**
     * Determine a line from two points `point1` and `point2`.
     * @param {Point} point1
     * @param {Point} point2
     * @returns {Line}
     */
    static fromPoints(owner: Geomtoy, point1: Point, point2: Point): Line;
    /**
     * Determine a line from segment `segment`, it is the underlying line of the segment.
     * @param {Segment} segment
     * @returns {Line}
     */
    static fromSegment(owner: Geomtoy, segment: Segment): Line;
    /**
     * Determine a line from vector `vector` with initial point set to `Point.zero()`.
     * @param {Vector} vector
     * @returns {Line}
     */
    static fromVector(owner: Geomtoy, vector: Vector): Line;
    /**
     * Determine a line from vector `vector` base on the initial and terminal point of it.
     * @param {Vector} vector
     * @returns {Line}
     */
    static fromVector2(owner: Geomtoy, vector: Vector): Line;
    /**
     * Determine a line from point `point` and vector `vector`.
     * @param {Point} point
     * @param {Vector} vector
     * @returns {Line}
     */
    static fromPointAndVector(owner: Geomtoy, point: Point, vector: Vector): Line;
    /**
     * Determine a line from point `point` and slope `slope`.
     * @param {Point} point
     * @param {number} slope
     * @returns {Line}
     */
    static fromPointAndSlope(owner: Geomtoy, point: Point, slope: number): Line;
    /**
     * Determine a line from point `point` and angle `angle`.
     * @param {Point} point
     * @param {number} angle
     * @returns {Line}
     */
    static fromPointAndAngle(owner: Geomtoy, point: Point, angle: number): Line;
    /**
     * Determine a line from x-intercept `xIntercept` and y-intercept `yIntercept`.
     * @param {number} xIntercept
     * @param {number} yIntercept
     * @returns {Line}
     */
    static fromIntercepts(owner: Geomtoy, xIntercept: number, yIntercept: number): Line;
    /**
     * Determine a line from slope `slope` and x-intercept `xIntercept`.
     * @param {number} slope
     * @param {number} xIntercept
     * @returns {Line}
     */
    static fromSlopeAndXIntercept(owner: Geomtoy, slope: number, xIntercept: number): Line;
    /**
     * Determine a line from slope `slope` and y-intercept `yIntercept`.
     * @param {number} slope
     * @param {number} yIntercept
     * @returns {Line}
     */
    static fromSlopeAndYIntercept(owner: Geomtoy, slope: number, yIntercept: number): Line;
    /**
     * Simplify line `this`, convert `b` to 1, if "b=0", convert `a` to 1.
     * @returns {Line}
     */
    simplify(): Line;
    simplifySelf(): this;
    /**
     * Get the point on line `this` where y is equal to `y`.
     * @param {number} y
     * @returns {Point | null}
     */
    getPointWhereYEqualTo(y: number): Point | null;
    /**
     * Get the point on line `this` where x is equal to `x`.
     * @param {number} x
     * @returns {Point | null}
     */
    getPointWhereXEqualTo(x: number): Point | null;
    /**
     * Whether line `this` is parallel(including identical) to line `line`.
     * @param {Line} line
     * @returns {boolean}
     */
    isParallelToLine(line: Line): boolean;
    /**
     * Whether line `this` is perpendicular to line `line`.
     * @param {Line} line
     * @returns {boolean}
     */
    isPerpendicularToLine(line: Line): boolean;
    /**
     * Whether line `this` is intersected with line `line`.
     * @param {Line} line
     * @returns {boolean}
     */
    isIntersectedWithLine(line: Line): boolean;
    /**
     * Get the intersection point with line `line`.
     * @param {Line} line
     * @returns {Point | null}
     */
    getIntersectionPointWithLine(line: Line): Point | null;
    /**
     * Whether line `this` is intersected with circle `circle`.
     * @param {Circle} circle
     * @returns {boolean}
     */
    isIntersectedWithCircle(circle: Circle): boolean;
    /**
     * Get the intersection points of line `this` and circle `circle`.
     * @param {Circle} circle
     * @returns {[Point, Point] | null}
     */
    getIntersectionPointsWithCircle(circle: Circle): [Point, Point] | null;
    /**
     * Whether line `this` is tangent to circle `circle`.
     * @param {Circle} circle
     * @returns {boolean}
     */
    isTangentToCircle(circle: Circle): boolean;
    /**
     * Get the tangency point of line `this` and circle `circle`.
     * @param {Circle} circle
     * @returns {Point | null}
     */
    getTangencyPointToCircle(circle: Circle): Point | null;
    /**
     * Whether line `this` is separated from circle `circle`.
     * @param {Circle} circle
     * @returns {boolean}
     */
    isSeparatedFromCircle(circle: Circle): boolean;
    /**
     * Whether line `this` is parallel to segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isParallelToSegment(segment: Segment): boolean;
    /**
     * Whether line `this` is perpendicular to segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isPerpendicularToSegment(segment: Segment): boolean;
    /**
     * Whether line `this` is collinear with segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isCollinearWithSegment(segment: Segment): boolean;
    /**
     * Whether line `this` is separated from segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isSeparatedFromSegment(segment: Segment): boolean;
    /**
     * Whether line `this` is intersected with segment `segment`.
     * @param {Segment} segment
     * @returns {boolean}
     */
    isIntersectedWithSegment(segment: Segment): boolean;
    /**
     * Get the intersection point of line `this` and segment `segment`
     * @param {Segment} segment
     * @returns {Point | null}
     */
    getIntersectionPointWithSegment(segment: Segment): Point | null;
    isIntersectedWithPolygon(polygon: Polygon): boolean;
    getIntersectionPointWithPolygon(polygon: Polygon): true | null;
    /**
     * Find the perpendicular line of line `this` from point `point`.
     * @param {Point} point
     * @returns {Line}
     */
    getPerpendicularLineFromPoint(point: Point): Line;
    /**
     * Find the perpendicular point(the foot of the perpendicular) on line `this` from point `point`.
     * @description
     * If point `point` is on line `line`, return itself(cloned).
     * If point `point` is not on line `line`, return the perpendicular point.
     * @param {Point} point
     * @returns {Point}
     */
    getPerpendicularPointFromPoint(point: Point): Point;
    /**
     * 若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回null
     * @param {Line} line
     * @returns {number}
     */
    getDistanceToParallelLine(line: Line): number;
    /**
     * Get graphic object of `this`
     * @param {GraphicImplType} type
     * @returns {Array<SvgDirective | CanvasDirective>}
     */
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective>;
    apply(transformation: Transformation): GeomObject;
    clone(): Line;
    toString(): string;
    toArray(): number[];
    toObject(): {
        a: number;
        b: number;
        c: number;
    };
}
export default Line;

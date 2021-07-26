import Vector from "./Vector";
import Segment from "./Segment";
import Line from "./Line";
import Circle from "./Circle";
import GeomObject from "./base/GeomObject";
import { Coordinate, GraphicImplType, RsPointToCircle, RsPointToLine, RsPointToSegment, CanvasDirective, SvgDirective } from "./types";
import Transformation from "./transformation";
declare class Point extends GeomObject {
    #private;
    constructor(x: number, y: number);
    constructor(position: Coordinate | Point | Vector);
    constructor();
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    static get zero(): Point;
    /**
     * Return a point from a coordinate
     * @param {Coordinate} coordinate
     * @returns {Point}
     */
    static fromCoordinate(coordinate: Coordinate): Point;
    /**
     * Return a point from a vector
     * @param {Vector} vector
     * @returns {Point}
     */
    static fromVector(vector: Vector): Point;
    /**
     * Whether point `this` is `Point.zero`
     * @returns {boolean}
     */
    isZero(): boolean;
    /**
     * Whether point `this` is the same as point `point`
     * @param {Point} point
     * @returns {boolean}
     */
    isSameAs(point: Point): boolean;
    /**
     * Get coordinate from point `this`
     * @returns {Coordinate}
     */
    getCoordinate(): Coordinate;
    /**
     * Walk point `this` with a `distance` towards the direction of the `angle`
     * @param {number} angle
     * @param {number} distance
     * @returns {Point}
     */
    walk(angle: number, distance: number): Point;
    walkSelf(angle: number, distance: number): this;
    /**
     * Move point `this` by the offset
     * @param {number} offsetX
     * @param {number} offsetY
     * @returns {Point}
     */
    move(offsetX: number, offsetY: number): Point;
    moveSelf(offsetX: number, offsetY: number): this;
    /**
     * Get the distance between point `this` and point `point`
     * @param {Point} point
     * @returns {number}
     */
    getDistanceBetweenPoint(point: Point): number;
    /**
     * Get the distance square between point `this` and point `point`
     * @param {Point} point
     * @returns {number}
     */
    getDistanceSquareFromPoint(point: Point): number;
    /**
     * Get the distance between point `this` and line `line`
     * @param {Line} line
     * @returns {number}
     */
    getDistanceBetweenLine(line: Line): number;
    /**
     * Get the signed distance between point `this` and line `line`
     * @param {Line} line
     * @returns {number}
     */
    getSignedDistanceBetweenLine(line: Line): number;
    /**
     * Whether point `this` is inside an imaginary rectangle with diagonals of point `point1` and point `point2`,
     * the coordinate of point `this` will not be greater than the maximum value of point `point1` and point `point2`,
     * nor less than the minimum value
     * @param {Point} point1
     * @param {Point} point2
     * @param {boolean} allowedOn Can it be on the rectangle, in other words, can it be equal to the maximum or minimum value
     * @returns {boolean}
     */
    isBetweenPoints(point1: Point, point2: Point, allowedOn?: boolean): boolean;
    /**
     * Get the relationship of point `this` to line `line`
     * @param {Line} line
     * @returns {RsPointToLine}
     */
    getRelationshipToLine(line: Line): RsPointToLine;
    /**
     * Whether point `this` is an endpoint of segment `segment`
     * @param {Segment} segment
     * @returns {boolean}
     */
    isEndpointOfSegment(segment: Segment): boolean;
    /**
     * Get the relationship of point `this` to segment `segment`
     * @param {Segment} s
     * @returns {RsPointToSegment}
     */
    getRelationshipToSegment(segment: Segment): RsPointToSegment;
    /**
     * Get the relationship of point `this` to circle `circle`
     * @param {Circle} circle
     * @returns {RsPointToCircle}
     */
    getRelationshipToCircle(circle: Circle): RsPointToCircle;
    /**
     * Get graphic object of `this`
     * @param {GraphicImplType} type
     * @returns {Array<SvgDirective | CanvasDirective>}
     */
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective>;
    /**
     * apply the transformation
     * @returns {Point}
     */
    apply(t: Transformation): Point;
    clone(): Point;
    toArray(): number[];
    toObject(): {
        x: number;
        y: number;
    };
    toString(): string;
}
export default Point;

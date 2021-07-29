import Vector from "./Vector";
import Segment from "./Segment";
import Line from "./Line";
import Circle from "./Circle";
import GeomObject from "./base/GeomObject";
import { Coordinate, GraphicImplType, CanvasDirective, SvgDirective } from "./types";
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
    getSquaredDistanceFromPoint(point: Point): number;
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
     * Whether point `this` is lying on the same line determined by points `point1` and `point2` and point `this` is between points `point1` and `point2`
     * @param {Point} point1
     * @param {Point} point2
     * @param {boolean} allowEqual Allow point `this` to be equal to point `point1` or `point2`
     * @returns {boolean}
     */
    isBetweenPoints(point1: Point, point2: Point, allowEqual?: boolean): boolean;
    isOutsideRectangle(): void;
    isInsideRectangle(): void;
    isOnRectangle(): void;
    isOnLine(line: Line): boolean;
    isEndpointOfSegment(segment: Segment): boolean;
    isOnSegmentLyingLine(segment: Segment): boolean;
    isOnSegment(segment: Segment): boolean;
    isOnCircle(circle: Circle): boolean;
    isInsideCircle(circle: Circle): boolean;
    isOutsideCircle(circle: Circle): boolean;
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

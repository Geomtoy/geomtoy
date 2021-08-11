import Geomtoy from ".";
import GeomObject from "./base/GeomObject";
import Vector from "./Vector";
import Segment from "./Segment";
import Line from "./Line";
import Circle from "./Circle";
import Transformation from "./transformation";
import { GraphicImplType, CanvasDirective, SvgDirective } from "./types";
import { Visible } from "./interfaces";
declare class Point extends GeomObject implements Visible {
    #private;
    constructor(owner: Geomtoy, x: number, y: number);
    constructor(owner: Geomtoy, position: [number, number]);
    get name(): string;
    get uuid(): string;
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get coordinate(): [number, number];
    set coordinate(value: [number, number]);
    static zero(owner: Geomtoy): Point;
    /**
     * Determine a point from a coordinate.
     * @param {[number, number]} coordinate
     * @returns {Point}
     */
    static fromCoordinate(owner: Geomtoy, coordinate: [number, number]): Point;
    /**
     * Determine a point from vector `vector`.
     * @param {Vector} vector
     * @returns {Point}
     */
    static fromVector(owner: Geomtoy, vector: Vector): Point;
    /**
     * Whether point `this` is `Point.zero()`.
     * @returns {boolean}
     */
    isZero(): boolean;
    /**
     * Whether point `this` is the same as point `point`.
     * @param {Point} point
     * @returns {boolean}
     */
    isSameAs(point: Point): boolean;
    /**
     * Move point `this` by offsets `offsetX` and `offsetY`.
     * @param {number} offsetX
     * @param {number} offsetY
     * @returns {Point}
     */
    move(offsetX: number, offsetY: number): Point;
    moveSelf(offsetX: number, offsetY: number): this;
    /**
     * Move point `this` with distance `distance` along angle `angle`.
     * @param {number} angle
     * @param {number} distance
     * @returns {Point}
     */
    moveAlongAngle(angle: number, distance: number): Point;
    moveAlongAngleSelf(angle: number, distance: number): this;
    /**
     * Get the distance between point `this` and point `point`.
     * @param {Point} point
     * @returns {number}
     */
    getDistanceBetweenPoint(point: Point): number;
    /**
     * Get the distance square between point `this` and point `point`.
     * @param {Point} point
     * @returns {number}
     */
    getSquaredDistanceBetweenPoint(point: Point): number;
    /**
     * Get the distance between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getDistanceBetweenLine(line: Line): number;
    /**
     * Get the signed distance between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getSignedDistanceBetweenLine(line: Line): number;
    /**
     * Get the distance square between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getSquaredDistanceBetweenLine(line: Line): number;
    /**
     * Get the distance between point `this` and segment `segment`.
     * @param {Segment} segment
     * @returns {number}
     */
    getDistanceBetweenSegment(segment: Segment): number;
    /**
     * Get the signed distance between point `this` and segment `segment`.
     * @param {Segment} segment
     * @returns {number}
     */
    getSignedDistanceBetweenSegment(segment: Segment): number;
    /**
     * Get the distance square between point `this` and segment `segment`
     * @param {Segment} segment
     * @returns {number}
     */
    getSquaredDistanceBetweenSegment(segment: Segment): number;
    /**
     * Whether point `this` is on the same line determined by points `point1` and `point2`,
     * and point `this` is between points `point1` and `point2`
     * @param {Point} point1
     * @param {Point} point2
     * @param {boolean} allowEqual Allow point `this` to be equal to point `point1` or `point2`
     * @returns {boolean}
     */
    isBetweenPoints(point1: Point, point2: Point, allowEqual?: boolean): boolean;
    isOutsidePolygon(): void;
    isInsidePolygon(): void;
    isOnPolygon(): void;
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
    apply(transformation: Transformation): Point;
    clone(): Point;
    toString(): string;
    toArray(): number[];
    toObject(): {
        x: number;
        y: number;
    };
}
export default Point;

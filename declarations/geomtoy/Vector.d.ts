import Point from "./Point";
import Segment from "./Segment";
import { CanvasDirective, GraphicImplType, SvgDirective } from "./types";
import GeomObject from "./base/GeomObject";
import Transformation from "./transformation";
import Geomtoy from ".";
declare class Vector extends GeomObject {
    #private;
    constructor(owner: Geomtoy, x: number, y: number);
    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number);
    constructor(owner: Geomtoy, coordinate: [number, number]);
    constructor(owner: Geomtoy, point1Coordinate: [number, number], point2Coordinate: [number, number]);
    constructor(owner: Geomtoy, point: Point);
    constructor(owner: Geomtoy, point1: Point, point2: Point);
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get coordinate(): [number, number];
    set coordinate(value: [number, number]);
    get point(): Point;
    set point(value: Point);
    get point1X(): number;
    set point1X(value: number);
    get point1Y(): number;
    set point1Y(value: number);
    get point1Coordinate(): [number, number];
    set point1Coordinate(value: [number, number]);
    get point1(): Point;
    set point1(value: Point);
    get point2X(): number;
    set point2X(value: number);
    get point2Y(): number;
    set point2Y(value: number);
    get point2Coordinate(): [number, number];
    set point2Coordinate(value: [number, number]);
    get point2(): Point;
    set point2(value: Point);
    /**
     * Get the angle of vector `this`, the result is in the interval `(-Math.PI, Math.PI]`.
     */
    get angle(): number;
    /**
     * Get the magnitude of vector `this`.
     */
    get magnitude(): number;
    static zero(owner: Geomtoy): Vector;
    static fromPoint(owner: Geomtoy, point: Point): Vector;
    static fromPoints(owner: Geomtoy, point1: Point, point2: Point): Vector;
    static fromAngleAndMagnitude(owner: Geomtoy, angle: number, magnitude: number): Vector;
    static fromSegment(owner: Geomtoy, segment: Segment, reverse?: boolean): Vector;
    /**
     * Whether vector `this` is `Vector.zero()`
     * @returns {boolean}
     */
    isZero(): boolean;
    /**
     * Whether vector `this` is the same as vector `vector`, if they are all initialized from `Point.zero`
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs(vector: Vector): boolean;
    /**
     * Whether vector `this` is the same as vector `vector`, including the initial point
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs2(vector: Vector): boolean;
    /**
     * Whether the angle of vector `this` is the same as vector `vector`
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAngleAs(vector: Vector): boolean;
    isSameMagnitudeAs(vector: Vector): boolean;
    /**
     * Angle from vector `this` to vector `vector`, in the interval `(-Math.PI, Math.PI]`
     * @param {Vector} vector
     * @returns {number}
     */
    angleTo(vector: Vector): number;
    simplify(): void;
    simplifySelf(): void;
    dotProduct(vector: Vector): number;
    crossProduct(vector: Vector): number;
    normalize(): Vector;
    add(vector: Vector): Vector;
    subtract(vector: Vector): Vector;
    scalarMultiply(scalar: number): Vector;
    negative(): Vector;
    rotate(angle: number): Vector;
    clone(): Vector;
    apply(transformation: Transformation): Vector;
    /**
     * Get graphic object of `this`
     * @param {GraphicImplType} type
     * @returns {Array<SvgDirective | CanvasDirective>}
     */
    getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective>;
    toArray(): never[];
    toObject(): {};
    toString(): string;
}
export default Vector;

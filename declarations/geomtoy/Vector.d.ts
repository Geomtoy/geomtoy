import Point from "./Point";
import Segment from "./Segment";
import { CanvasDirective, Coordinate, GraphicImplType, SvgDirective } from "./types";
import GeomObject from "./base/GeomObject";
import Transformation from "./transformation";
declare class Vector extends GeomObject {
    #private;
    constructor(x: number, y: number);
    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number);
    constructor(position: Coordinate | Point | Vector);
    constructor(point1Position: Coordinate | Point | Vector, point2Position: Coordinate | Point | Vector);
    constructor();
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    /**
     * Initial point of vector `this`, usually `Point.zero`
     */
    get point1(): Point;
    set point1(value: Point);
    /**
     * Terminal point of vector `this`
     */
    get point2(): Point;
    get angle(): number;
    get magnitude(): number;
    static get zero(): Vector;
    static fromPoint(point: Point): Vector;
    static fromPoints(point1: Point, point2: Point): Vector;
    static fromAngleAndMagnitude(angle: number, magnitude: number): Vector;
    static fromSegment(segment: Segment, reverse?: boolean): Vector;
    /**
     * Whether vector `this` is `Vector.zero`
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
     * Angle from vector `this` to vector `vector`, in "(-Math.PI,Math.PI]"
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
    getCoordinate(): Coordinate;
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

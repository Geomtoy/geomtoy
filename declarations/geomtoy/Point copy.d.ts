import Vector from "./Vector";
import Segment from "./Segment";
import GeomObject from "./base/GeomObject";
import { Coordinate, GraphicImplType, RsPointToSegment } from "./types";
declare const Point_base: (abstract new (...args: any[]) => {
    [x: string]: any;
    translate(offsetX: number, offsetY: number): any;
    translateSelf(offsetX: number, offsetY: number): any;
    rotate(angle: number, origin: import("./Point").default): any;
    rotateSelf(angle: number, origin: import("./Point").default): any;
    scale(factorX: number, factorY: number, origin: import("./Point").default): any;
    scaleSelf(factorX: number, factorY: number, origin: import("./Point").default): any;
    skew(angleX: number, angleY: number, origin: import("./Point").default): any;
    skewSelf(angleX: number, angleY: number, origin: import("./Point").default): any;
    lineReflect(line: import("./Line").default): any;
    lineReflectSelf(line: import("./Line").default): any;
    pointReflect(point: import("./Point").default): any;
    pointReflectSelf(point: import("./Point").default): any;
    transform(matrix: import("./transformation/Matrix").default): any;
    transformSelf(matrix: import("./transformation/Matrix").default): any;
    normalize(): any;
    normalizeSelf(): any;
    getCoordinate(): Coordinate;
}) & typeof GeomObject;
declare class Point extends Point_base {
    #private;
    constructor(x: number, y: number);
    constructor(coordinate: Coordinate);
    constructor(point: Point);
    constructor(vector: Vector);
    constructor();
    set x(value: number);
    get x(): number;
    set y(value: number);
    get y(): number;
    static get zero(): Point;
    /**
     * Get a point from a coordinate
     * @param {Coordinate} coordinate
     * @returns {Point}
     */
    static fromCoordinate(coordinate: Coordinate): Point;
    /**
     * Get a point from a vector
     * @param {Vector} vector
     * @returns {Point}
     */
    static fromVector(vector: Vector): Point;
    /**
     * Is point `this` the same as point `point`
     * @param {Point} point
     * @returns {boolean}
     */
    isSameAs(point: Point): boolean;
    /**
     * Walk a distance towards a certain angle without transformation
     * @param {number} angle
     * @param {number} distance
     * @returns {Point}
     */
    walk(angle: number, distance: number): Point;
    walkSelf(angle: number, distance: number): Point;
    /**
     * Move without transformation
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
     * Judge whether point `this` is inside the imaginary rectangle with the diagonals of point `point1` and point `point2`,
     * the coordinate of point `this` will not be greater than the maximum value of point `point1` and point `point2`,
     * nor less than the minimum value
     * @param {Point} point1
     * @param {Point} point2
     * @param {boolean} allowedOn Can it be on the rectangle, in other words, can it be equal to the maximum or minimum value
     * @returns {boolean}
     */
    isBetweenPoints(point1: Point, point2: Point, allowedOn?: boolean): boolean;
    /**
     * Get the relationship of point `this` to segment `segment`
     * @param {Segment} s
     * @returns {RsPointToSegment}
     */
    getRelationshipToSegment(segment: Segment): RsPointToSegment;
    getGraphic(type: GraphicImplType): object[];
    clone(): Point;
    toArray(): number[];
    toObject(): {
        x: number;
        y: number;
    };
    toString(): string;
}
export default Point;

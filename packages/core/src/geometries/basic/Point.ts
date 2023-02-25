import { Assert, Box, Coordinates, Maths, Type, Utility, Vector2 } from "@geomtoy/util";
import { optioner } from "../../geomtoy";
import { validGeometry } from "../../misc/decor-geometry";

import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import Graphics from "../../graphics";
import PointGraphics from "../../helper/PointGraphics";
import { stated } from "../../misc/decor-cache";
import { getCoordinates } from "../../misc/point-like";
import Transformation from "../../transformation";
import type { PointAppearance, ViewportDescriptor } from "../../types";
import Line from "./Line";
import LineSegment from "./LineSegment";
import Ray from "./Ray";
import Vector from "./Vector";

@validGeometry
export default class Point extends Geometry {
    private _x = NaN;
    private _y = NaN;
    appearance: PointAppearance = optioner.options.graphics.point.appearance;

    constructor(x: number, y: number, appearance?: PointAppearance);
    constructor(coordinates: [number, number], appearance?: PointAppearance);
    constructor(coordinates: [number, number], appearance?: PointAppearance);
    constructor(appearance?: PointAppearance);
    constructor(a0?: any, a1?: any, a2?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { x: a0, y: a1, appearance: a2 ?? this.appearance });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { coordinates: a0, appearance: a1 ?? this.appearance });
        }
        if (Type.isString(a0)) {
            Object.assign(this, { appearance: a0 ?? this.appearance });
        }
    }

    static override events = {
        xChanged: "x" as const,
        yChanged: "y" as const
    };

    private _setX(value: number) {
        if (!Utility.isEqualTo(this._x, value)) this.trigger_(new EventSourceObject(this, Point.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.isEqualTo(this._y, value)) this.trigger_(new EventSourceObject(this, Point.events.yChanged));
        this._y = value;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        Assert.isRealNumber(value, "x");
        this._setX(value);
    }
    get y() {
        return this._y;
    }
    set y(value) {
        Assert.isRealNumber(value, "y");
        this._setY(value);
    }
    get coordinates() {
        return [this._x, this._y] as [number, number];
    }
    set coordinates(value) {
        Assert.isCoordinates(value, "coordinates");
        this._setX(Coordinates.x(value));
        this._setY(Coordinates.y(value));
    }

    @stated
    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._x) &&
            !Number.isNaN(this._y)
        );
    }

    move(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        this.coordinates = Vector2.add(this.coordinates, Vector2.from2(angle, distance));
        return this;
    }
    /**
     * Returns a point of `origin` of the coordinate system.
     */
    static origin() {
        return new Point(0, 0);
    }

    static random(box: [number, number, number, number]) {
        const x = Box.x(box) + Maths.random() * Box.width(box);
        const y = Box.y(box) + Maths.random() * Box.height(box);
        return new Point(x, y);
    }
    equalTo(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        return Coordinates.isEqualTo(this.coordinates, c, optioner.options.epsilon);
    }

    /**
     * Whether points `point1`, `point2`, `point3` are collinear.
     * @note
     * If any two of these three point are the same, they will also be considered collinear.
     * @param point1
     * @param point2
     * @param point3
     * @returns
     */
    static isThreePointsCollinear(point1: [number, number] | Point, point2: [number, number] | Point, point3: [number, number] | Point) {
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        const c3 = getCoordinates(point3, "point3");
        const v1 = Vector2.from(c1, c2);
        const v2 = Vector2.from(c1, c3);
        const epsilon = optioner.options.epsilon;
        return Maths.equalTo(Vector2.cross(v1, v2), 0, epsilon);
    }
    static isFourPointsCollinear(point1: [number, number] | Point, point2: [number, number] | Point, point3: [number, number] | Point, point4: [number, number] | Point) {
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        const c3 = getCoordinates(point3, "point3");
        const c4 = getCoordinates(point4, "point4");
        const v1 = Vector2.from(c1, c2);
        const v2 = Vector2.from(c1, c3);
        const v3 = Vector2.from(c1, c4);
        const epsilon = optioner.options.epsilon;
        const cp1 = Vector2.cross(v1, v2);
        const cp2 = Vector2.cross(v1, v3);
        const cp3 = Vector2.cross(v2, v3); // in case when v1 is zero vector.
        return Maths.equalTo(cp1, 0, epsilon) && Maths.equalTo(cp2, 0, epsilon) && Maths.equalTo(cp3, 0, epsilon);
    }

    /**
     * Get the `n` equally dividing rays of the angle which is formed by points `vertex`, `leg1` and `leg2`.
     * @description
     * The angle is generated from `leg1` to `leg2` taking `vertex` as the center of rotation.
     * If `n` is not an integer, return `null`.
     * If any two in `vertex`, `leg1`, `leg2` are the same, return `[]`.
     * @param n
     * @param vertex
     * @param leg1
     * @param leg2
     */
    static getAngleNEquallyDividingRaysFromThreePoints(n: number, vertex: Point, leg1: Point, leg2: Point): Ray[] | null {
        if (!Type.isInteger(n) || n < 2) {
            throw new Error(`[G]\`n\` should be an integer and not less than 2, but we got \`${n}\`.`);
        }

        const [c0, c1, c2] = [vertex.coordinates, leg1.coordinates, leg2.coordinates];
        const epsilon = optioner.options.epsilon;
        if (Coordinates.isEqualTo(c0, c1, epsilon) || Coordinates.isEqualTo(c0, c2, epsilon) || Coordinates.isEqualTo(c1, c2, epsilon)) {
            console.warn("[G]The points `vertex`, `leg1`, `leg2` are the same, there is no angle formed by them.");
            return null;
        }
        const a1 = Vector2.angle(Vector2.from(c0, c1));
        const a2 = Vector2.angle(Vector2.from(c0, c1));
        const d = (a2 - a1) / n;
        return Utility.range(1, n).map(i => new Ray(vertex.coordinates, a1 + d * i));
    }

    //todo
    static isFourPointsConcyclic(point1: Point, point2: Point, point3: Point, point4: Point) {}
    /**
     * Determine a point from vector `vector`.
     * @param vector
     * @returns
     */
    static fromVector(vector: Vector) {
        return new Point(vector.point2Coordinates);
    }

    /**
     * Get the distance between point `this` and point `point`.
     */
    getDistanceBetweenPoint(point: Point): number {
        return Vector2.magnitude(Vector2.from(this.coordinates, point.coordinates));
    }
    /**
     * Get the distance square between point `this` and point `point`.
     */
    getSquaredDistanceBetweenPoint(point: Point): number {
        return Vector2.squaredMagnitude(Vector2.from(this.coordinates, point.coordinates));
    }
    /**
     * Get the distance between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getDistanceBetweenLine(line: Line): number {
        return Maths.abs(this.getSignedDistanceBetweenLine(line));
    }
    /**
     * Get the signed distance between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getSignedDistanceBetweenLine(line: Line): number {
        const [a, b, c] = line.getImplicitFunctionCoefs();
        const { x, y } = this;
        return (a * x + b * y + c) / Maths.hypot(a, b);
    }
    /**
     * Get the distance square between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getSquaredDistanceBetweenLine(line: Line): number {
        const [a, b, c] = line.getImplicitFunctionCoefs();
        const { x, y } = this;
        return (a * x + b * y + c) ** 2 / (a ** 2 + b ** 2);
    }
    /**
     * Get the distance between point `this` and line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     * @returns {number}
     */
    getDistanceBetweenLineSegment(lineSegment: LineSegment): number {
        return Maths.abs(this.getSignedDistanceBetweenLineSegment(lineSegment));
    }
    /**
     * Get the signed distance between point `this` and line segment `lineSegment`.
     * @summary [[include:Matrix.md]]
     * @param {LineSegment} lineSegment
     * @returns {number}
     */
    getSignedDistanceBetweenLineSegment(lineSegment: LineSegment): number {
        const c = this.coordinates;
        const { point1Coordinates: c1, point2Coordinates: c2 } = lineSegment;
        const v12 = Vector2.from(c1, c2);
        const v10 = Vector2.from(c1, c);
        return Vector2.cross(v12, v10) / Vector2.magnitude(Vector2.from(c1, c2));
    }
    /**
     * Get the distance square between point `this` and line segment `lineSegment`
     * @param {LineSegment} lineSegment
     * @returns {number}
     */
    getSquaredDistanceBetweenLineSegment(lineSegment: LineSegment): number {
        const c = this.coordinates;
        const { point1Coordinates: c1, point2Coordinates: c2 } = lineSegment;
        const v12 = Vector2.from(c1, c2);
        const v10 = Vector2.from(c1, c);
        return Vector2.cross(v12, v10) ** 2 / Vector2.squaredMagnitude(Vector2.from(c1, c2));
    }

    /**
     * Whether point `this` is on the same line determined by points `point1` and `point2`,
     * and point `this` is between points `point1` and `point2`
     * @param point1
     * @param point2
     * @param allowEqual Allow point `this` to be equal to point `point1` or `point2`
     * @returns
     */
    isBetweenPoints(point1: [number, number] | Point, point2: [number, number] | Point, allowEqual = true) {
        const c0 = this.coordinates;
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        const epsilon = optioner.options.epsilon;
        if (Coordinates.isEqualTo(c1, c2, epsilon)) {
            console.warn("[G]`point1` and `point2` are the same. `false` will be returned");
            return false;
        }
        const v12 = Vector2.from(c1, c2);
        const v10 = Vector2.from(c1, c0);
        const cp = Vector2.cross(v10, v12);
        const dp = Vector2.dot(v10, v12);
        const sm = Vector2.squaredMagnitude(v12);
        if (allowEqual) {
            return Maths.equalTo(cp, 0, epsilon) && !Maths.lessThan(dp, 0, epsilon) && !Maths.greaterThan(dp, sm, epsilon);
        }
        return Maths.equalTo(cp, 0, epsilon) && Maths.greaterThan(dp, 0, epsilon) && Maths.lessThan(dp, sm, epsilon);
    }

    getGraphics(viewport: ViewportDescriptor) {
        if (!this.initialized()) return new Graphics();

        const g = new Graphics();
        g.concat(new PointGraphics(this.coordinates, this.appearance).getGraphics(viewport));
        return g;
    }

    apply(transformation: Transformation) {
        const nc = transformation.transformCoordinates(this.coordinates);
        return new Point(nc);
    }
    clone() {
        return new Point(this._x, this._y);
    }
    copyFrom(shape: Point | null) {
        if (shape === null) shape = new Point();
        this._setX(shape._x);
        this._setY(shape._y);
        return this;
    }
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `}`
        ].join("\n")
    }
}

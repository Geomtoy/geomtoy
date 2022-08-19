import { Angle, Assert, Type, Vector2, Utility, Coordinates, Maths } from "@geomtoy/util";
import { validGeometry } from "../../misc/decor-valid-geometry";
import ArrowGraphics from "../../helper/ArrowGraphics";

import Geometry from "../../base/Geometry";
import Point from "./Point";
import Line from "./Line";
import Ray from "./Ray";
import LineSegment from "./LineSegment";
import GeometryGraphics from "../../graphics/GeometryGraphics";
import EventObject from "../../event/EventObject";

import type Transformation from "../../transformation";
import type { ViewportDescriptor } from "../../types";
import { optioner } from "../../geomtoy";
import { getCoordinates } from "../../misc/point-like";

@validGeometry
export default class Vector extends Geometry {
    private _x = NaN;
    private _y = NaN;
    private _point1X = 0;
    private _point1Y = 0;

    constructor(x: number, y: number);
    constructor(point1X: number, point1Y: number, x: number, y: number);
    constructor(coordinates: [number, number]);
    constructor(point1Coordinates: [number, number], coordinates: [number, number]);
    constructor(point: Point);
    constructor(point1: Point, point: Point);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any) {
        super();
        if (Type.isNumber(a0)) {
            if (Type.isNumber(a2)) {
                Object.assign(this, { point1X: a0, point1Y: a1, x: a2, y: a3 });
            } else {
                Object.assign(this, { x: a0, y: a1 });
            }
        }
        if (Type.isArray(a0)) {
            if (Type.isArray(a1)) {
                Object.assign(this, { point1Coordinates: a0, coordinates: a1 });
            } else {
                Object.assign(this, { coordinates: a0 });
            }
        }
        if (a0 instanceof Point) {
            if (a1 instanceof Point) {
                Object.assign(this, { point1: a0, point: a1 });
            } else {
                Object.assign(this, { point: a0 });
            }
        }
    }

    get events() {
        return {
            xChanged: "x" as const,
            yChanged: "y" as const,
            point1XChanged: "point1X" as const,
            point1YChanged: "point1Y" as const,
            point2XChanged: "point2X" as const,
            point2YChanged: "point2Y" as const
        };
    }

    private _setX(value: number) {
        if (!Utility.isEqualTo(this._x, value)) {
            this.trigger_(EventObject.simple(this, this.events.xChanged));
            this.trigger_(EventObject.simple(this, this.events.point2XChanged));
        }
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.isEqualTo(this._y, value)) {
            this.trigger_(EventObject.simple(this, this.events.yChanged));
            this.trigger_(EventObject.simple(this, this.events.point2YChanged));
        }
        this._y = value;
    }
    private _setPoint1X(value: number) {
        if (!Utility.isEqualTo(this._point1X, value)) this.trigger_(EventObject.simple(this, this.events.point1XChanged));
        this._point1X = value;
    }
    private _setPoint1Y(value: number) {
        if (!Utility.isEqualTo(this._point1Y, value)) this.trigger_(EventObject.simple(this, this.events.point1YChanged));
        this._point1Y = value;
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
    get point() {
        return new Point(this._x, this._y);
    }
    set point(value) {
        this._setX(value.x);
        this._setY(value.y);
    }
    get point1X() {
        return this._point1X;
    }
    set point1X(value) {
        Assert.isRealNumber(value, "point1X");
        this._setPoint1X(value);
    }
    get point1Y() {
        return this._point1Y;
    }
    set point1Y(value) {
        Assert.isRealNumber(value, "point1Y");
        this._setPoint1Y(value);
    }
    get point1Coordinates() {
        return [this._point1X, this._point1Y] as [number, number];
    }
    set point1Coordinates(value) {
        Assert.isCoordinates(value, "point1Coordinates");
        this._setPoint1X(Coordinates.x(value));
        this._setPoint1Y(Coordinates.y(value));
    }
    get point1() {
        return new Point(this._point1X, this._point1Y);
    }
    set point1(value) {
        this._setPoint1X(value.x);
        this._setPoint1Y(value.y);
    }
    get point2X() {
        return Coordinates.x(this.point1Coordinates) + Coordinates.x(this.coordinates);
    }
    set point2X(value) {
        Assert.isRealNumber(value, "point2X");
        this._setX(value - Coordinates.x(this.point1Coordinates));
    }
    get point2Y() {
        return Coordinates.y(this.point1Coordinates) + Coordinates.y(this.coordinates);
    }
    set point2Y(value) {
        Assert.isRealNumber(value, "point2Y");
        this._setX(value - Coordinates.y(this.point1Coordinates));
    }
    get point2Coordinates() {
        return Vector2.add(this.point1Coordinates, this.coordinates);
    }
    set point2Coordinates(value) {
        Assert.isCoordinates(value, "point2Coordinates");
        const c = Vector2.from(this.point1Coordinates, value);
        this._setX(Coordinates.x(c));
        this._setY(Coordinates.y(c));
    }
    get point2() {
        return new Point(Vector2.add(this.point1Coordinates, this.coordinates));
    }
    set point2(value) {
        const c = Vector2.from(this.point1Coordinates, value.coordinates);
        this._setX(Coordinates.x(c));
        this._setY(Coordinates.y(c));
    }

    /**
     * Get the angle of vector `this`, the result is in the interval `(-math.PI, math.PI]`.
     */
    get angle() {
        return Angle.simplify2(Vector2.angle(this.coordinates));
    }
    /**
     * Get the magnitude of vector `this`.
     */
    get magnitude(): number {
        return Vector2.magnitude(this.coordinates);
    }

    protected initialized_() {
        // prettier-ignore
        return (
            !Number.isNaN(this._x) &&
            !Number.isNaN(this._y)
        );
    }

    move(deltaX: number, deltaY: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, [deltaX, deltaY]);
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, Vector2.from2(angle, distance));
        return this;
    }

    static zero() {
        return new Vector(0, 0);
    }

    static fromAngleAndMagnitude(angle: number, magnitude: number) {
        return new Vector(Vector2.from2(angle, magnitude));
    }

    static fromTwoPoints(point1: [number, number] | Point, point2: [number, number] | Point) {
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        return new Vector(c1, Vector2.from(c1, c2));
    }

    /**
     * Angle from vector `this` to vector `vector`, in the interval `(-math.PI, math.PI]`
     * @param {Vector} vector
     * @returns {number}
     */
    getAngleToVector(vector: Vector): number {
        return Angle.simplify2(this.angle - vector.angle);
    }

    standardize() {
        return this.clone().standardizeSelf();
    }
    standardizeSelf() {
        this.point1Coordinates = [0, 0];
    }

    /**
     * Get the proportion of the vector `this` of point `point`.
     * @description
     * - If `point` is not on the underlying line of `this`, return `NaN`.
     * - If `point` is equal to `point1`, return 0.
     * - If `point` is equal to `point2`, return `Infinity`.
     * - If `point` is between `point1` and `point2`, return a number in $(0,\infty)$.
     * - If `point` is on the exterior of `point1`, return a number in $(-1,0)$.
     * - If `point` is on the exterior of `point2`, return a number in $(-\infty, -1)$.
     * @param point
     */
    getProportionOfPoint(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const epsilon = optioner.options.epsilon;
        const l = this.toLine();
        if (l === null || l.isPointOn(c)) return NaN;

        if (Coordinates.isEqualTo(c, c1, epsilon)) return 0;
        if (Coordinates.isEqualTo(c, c2, epsilon)) return Infinity;

        const v10 = Vector2.from(c1, c);
        const v02 = Vector2.from(c, c2);
        const sign = Vector2.dot(v10, v02) < 0 ? -1 : 1;
        return (sign * Vector2.magnitude(v10)) / Vector2.magnitude(v02);
    }
    /**
     * Get the point at proportion `proportion` of the vector `this`.
     * @description
     * - If `lambda` is -1, return `null`(a point at infinity).
     * - If `lambda` is 0, return `point1`.
     * - If `lambda` is `Infinity`, return `point2`.
     * - If `lambda` is in $(0,\infty)$, return a point on the interior of `point1` and `point2`.
     * - If `lambda` is in $(-1,0)$, return a point on the exterior of `point1`.
     * - If `lambda` is in $(-\infty, -1)$, return a point on the exterior of `point2`.
     * @param lambda
     */
    getPointAtProportion(lambda: number): null | Point {
        if (lambda === -1) return null;
        if (Maths.abs(lambda) === Infinity) return this.point2.clone();
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const c = Vector2.scalarMultiply(Vector2.add(c1, Vector2.scalarMultiply(c2, lambda)), 1 / (1 + lambda));
        return new Point(c);
    }

    toPoint() {
        return new Point(this.coordinates);
    }

    toLine() {
        const epsilon = optioner.options.epsilon;
        if (Coordinates.isEqualTo(this.coordinates, [0, 0], epsilon)) return null;
        return Line.fromTwoPoints(this.point1Coordinates, this.point2Coordinates)!;
    }
    toRay() {
        const epsilon = optioner.options.epsilon;
        if (Coordinates.isEqualTo(this.coordinates, [0, 0], epsilon)) return null;
        return new Ray(this.point1Coordinates, this.angle);
    }
    toLineSegment() {
        const epsilon = optioner.options.epsilon;
        if (Coordinates.isEqualTo(this.coordinates, [0, 0], epsilon)) return null;
        return new LineSegment(this.point1Coordinates, this.point2Coordinates);
    }

    dotProduct(vector: Vector): number {
        return Vector2.dot(this.coordinates, vector.coordinates);
    }
    crossProduct(vector: Vector): number {
        return Vector2.cross(this.coordinates, vector.coordinates);
    }
    normalize(): Vector {
        return new Vector(this.point1Coordinates, Vector2.normalize(this.coordinates));
    }
    add(vector: Vector): Vector {
        return new Vector(this.point1Coordinates, Vector2.add(this.coordinates, vector.coordinates));
    }
    subtract(vector: Vector): Vector {
        return new Vector(this.point1Coordinates, Vector2.subtract(this.coordinates, vector.coordinates));
    }
    scalarMultiply(scalar: number): Vector {
        return new Vector(this.point1Coordinates, Vector2.scalarMultiply(this.coordinates, scalar));
    }
    negative() {
        return new Vector(this.point1Coordinates, Vector2.negative(this.coordinates));
    }
    rotate(angle: number): Vector {
        return new Vector(this.point1Coordinates, Vector2.rotate(this.coordinates, angle));
    }

    apply(transformation: Transformation) {
        const nc = transformation.transformCoordinates(this.coordinates);
        const nc1 = transformation.transformCoordinates(this.point1Coordinates);
        return new Vector(nc1, nc);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new GeometryGraphics();
        if (!this.initialized_()) return g;
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;

        g.moveTo(...c1);
        g.lineTo(...c2);

        const arrowGraphics = new ArrowGraphics(c2, this.angle).getGraphics(viewport);
        g.append(arrowGraphics);
        return g;
    }
    clone() {
        return new Vector(this.point1X, this.point1Y, this.point2X, this.point2Y);
    }
    copyFrom(shape: Vector | null) {
        if (shape === null) shape = new Vector();
        this._setX(shape._x);
        this._setY(shape._y);
        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        return this;
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\tpoint1X: ${this.point1X}`,
            `\tpoint1Y: ${this.point1Y}`,
            `}`
        ].join("\n");
    }
    toArray() {
        return [this.x, this.y, this.point1X, this.point1Y];
    }
    toObject() {
        return {
            x: this.x,
            y: this.y,
            point1X: this.point1X,
            point1Y: this.point1Y
        };
    }
}
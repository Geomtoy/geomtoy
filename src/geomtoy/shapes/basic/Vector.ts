import { validAndWithSameOwner } from "../../decorator";
import assert from "../../utility/assertion";
import util from "../../utility";
import coord from "../../utility/coord";
import vec2 from "../../utility/vec2";
import angle from "../../utility/angle";

import Arrow from "../../helper/Arrow";

import Shape from "../../base/Shape";
import Point from "./Point";
import Line from "./Line";
import Ray from "./Ray";
import LineSegment from "./LineSegment";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../../geomtoy";
import type Transformation from "../../transformation";
import type { TransformableShape, ViewportDescriptor } from "../../types";

class Vector extends Shape implements TransformableShape {
    private _x = NaN;
    private _y = NaN;
    private _point1X = 0;
    private _point1Y = 0;

    constructor(owner: Geomtoy, x: number, y: number);
    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number);
    constructor(owner: Geomtoy, coordinates: [number, number]);
    constructor(owner: Geomtoy, point1Coordinates: [number, number], point2Coordinates: [number, number]);
    constructor(owner: Geomtoy, point: Point);
    constructor(owner: Geomtoy, point1: Point, point2: Point);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any) {
        super(o);
        if (util.isNumber(a1)) {
            if (util.isNumber(a3)) {
                Object.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4 });
            } else {
                Object.assign(this, { x: a1, y: a2 });
            }
        }
        if (util.isArray(a1)) {
            if (util.isArray(a2)) {
                Object.assign(this, { point1Coordinates: a1, point2Coordinates: a2 });
            } else {
                Object.assign(this, { coordinates: a1 });
            }
        }
        if (a1 instanceof Point) {
            if (a2 instanceof Point) {
                Object.assign(this, { point1: a1, point2: a2 });
            } else {
                Object.assign(this, { point: a1 });
            }
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        xChanged: "x" as const,
        yChanged: "y" as const,
        point1XChanged: "point1X" as const,
        point1YChanged: "point1Y" as const,
        point2XChanged: "point2X" as const,
        point2YChanged: "point2Y" as const
    });

    private _setX(value: number) {
        if (!util.isEqualTo(this._x, value)) {
            this.trigger_(EventObject.simple(this, Vector.events.xChanged));
            this.trigger_(EventObject.simple(this, Vector.events.point2XChanged));
        }
        this._x = value;
    }
    private _setY(value: number) {
        if (!util.isEqualTo(this._y, value)) {
            this.trigger_(EventObject.simple(this, Vector.events.yChanged));
            this.trigger_(EventObject.simple(this, Vector.events.point2YChanged));
        }
        this._y = value;
    }
    private _setPoint1X(value: number) {
        if (!util.isEqualTo(this._point1X, value)) this.trigger_(EventObject.simple(this, Vector.events.point1XChanged));
        this._point1X = value;
    }
    private _setPoint1Y(value: number) {
        if (!util.isEqualTo(this._point1Y, value)) this.trigger_(EventObject.simple(this, Vector.events.point1YChanged));
        this._point1Y = value;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        assert.isRealNumber(value, "x");
        this._setX(value);
    }
    get y() {
        return this._y;
    }
    set y(value) {
        assert.isRealNumber(value, "y");
        this._setY(value);
    }
    get coordinates() {
        return [this._x, this._y] as [number, number];
    }
    set coordinates(value) {
        assert.isCoordinates(value, "coordinates");
        this._setX(coord.x(value));
        this._setY(coord.y(value));
    }
    get point() {
        return new Point(this.owner, this._x, this._y);
    }
    set point(value) {
        this._setX(value.x);
        this._setY(value.y);
    }
    get point1X() {
        return this._point1X;
    }
    set point1X(value) {
        assert.isRealNumber(value, "point1X");
        this._setPoint1X(value);
    }
    get point1Y() {
        return this._point1Y;
    }
    set point1Y(value) {
        assert.isRealNumber(value, "point1Y");
        this._setPoint1Y(value);
    }
    get point1Coordinates() {
        return [this._point1X, this._point1Y] as [number, number];
    }
    set point1Coordinates(value) {
        assert.isCoordinates(value, "point1Coordinates");
        this._setPoint1X(coord.x(value));
        this._setPoint1Y(coord.y(value));
    }
    get point1() {
        return new Point(this.owner, this._point1X, this._point1Y);
    }
    set point1(value) {
        this._setPoint1X(value.x);
        this._setPoint1Y(value.y);
    }
    get point2X() {
        return coord.x(this.point1Coordinates) + coord.x(this.coordinates);
    }
    set point2X(value) {
        assert.isRealNumber(value, "point2X");
        this._setX(value - coord.x(this.point1Coordinates));
    }
    get point2Y() {
        return coord.y(this.point1Coordinates) + coord.y(this.coordinates);
    }
    set point2Y(value) {
        assert.isRealNumber(value, "point2Y");
        this._setX(value - coord.y(this.point1Coordinates));
    }
    get point2Coordinates() {
        return vec2.add(this.point1Coordinates, this.coordinates);
    }
    set point2Coordinates(value) {
        assert.isCoordinates(value, "point2Coordinates");
        const c = vec2.from(this.point1Coordinates, value);
        this._setX(coord.x(c));
        this._setY(coord.y(c));
    }
    get point2() {
        return new Point(this.owner, vec2.add(this.point1Coordinates, this.coordinates));
    }
    set point2(value) {
        const c = vec2.from(this.point1Coordinates, value.coordinates);
        this._setX(coord.x(c));
        this._setY(coord.y(c));
    }

    /**
     * Get the angle of vector `this`, the result is in the interval `(-math.PI, math.PI]`.
     */
    get angle() {
        return angle.simplify2(vec2.angle(this.coordinates));
    }
    /**
     * Get the magnitude of vector `this`.
     */
    get magnitude(): number {
        return vec2.magnitude(this.coordinates);
    }

    isValid() {
        if (!coord.isValid(this.coordinates)) return false;
        if (!coord.isValid(this.point1Coordinates)) return false;
        return true;
    }

    static zero(owner: Geomtoy) {
        return new Vector(owner, 0, 0);
    }

    static fromAngleAndMagnitude(owner: Geomtoy, angle: number, magnitude: number): Vector {
        const [x, y] = coord.moveAlongAngle([0, 0], angle, magnitude);
        return new Vector(owner, x, y);
    }
    static fromLineSegment(owner: Geomtoy, lineSegment: LineSegment, reverse = false) {
        return reverse ? new Vector(owner, lineSegment.point2Coordinates, lineSegment.point1Coordinates) : new Vector(owner, lineSegment.point1Coordinates, lineSegment.point2Coordinates);
    }

    /**
     * Whether vector `this` is the same as vector `vector`.
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs(vector: Vector): boolean {
        if (this === vector) return true;
        return coord.isSameAs(this.coordinates, vector.coordinates, this.options_.epsilon);
    }
    /**
     * Whether vector `this` is the same as vector `vector`, including the initial point
     * @param {Vector} vector
     * @returns {boolean}
     */
    isSameAs2(vector: Vector): boolean {
        if (this === vector) return true;
        const epsilon = this.options_.epsilon;
        return coord.isSameAs(this.point1Coordinates, vector.point1Coordinates, epsilon) && this.isSameAs(vector);
    }
    /**
     * Move vector `this` by `deltaX` and `deltaY` to get new vector.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move vector `this` itself by `deltaX` and `deltaY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.point1Coordinates = coord.move(this.point1Coordinates, deltaX, deltaY);
        return this;
    }
    /**
     * Move vector `this` with `distance` along `angle` to get new vector.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move vector `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.point1Coordinates = coord.moveAlongAngle(this.point1Coordinates, angle, distance);
        return this;
    }

    /**
     * Angle from vector `this` to vector `vector`, in the interval `(-math.PI, math.PI]`
     * @param {Vector} vector
     * @returns {number}
     */
    getAngleToVector(vector: Vector): number {
        return angle.simplify2(this.angle - vector.angle);
    }

    standardize() {
        return this.clone().standardizeSelf();
    }
    standardizeSelf() {
        this.point1Coordinates = [0, 0];
    }
    toPoint() {
        return new Point(this.owner, this.coordinates);
    }
    toLine() {
        return Line.fromTwoPoints.bind(this)(this.point1Coordinates, this.point2Coordinates);
    }
    toLineSegment() {
        return new LineSegment(this.owner, this.point1Coordinates, this.point2Coordinates);
    }
    toRay() {
        return new Ray(this.owner, this.point1Coordinates, this.angle);
    }

    dotProduct(vector: Vector): number {
        return vec2.dot(this.coordinates, vector.coordinates);
    }
    crossProduct(vector: Vector): number {
        return vec2.cross(this.coordinates, vector.coordinates);
    }
    normalize(): Vector {
        return new Vector(this.owner, vec2.normalize(this.coordinates));
    }
    add(vector: Vector): Vector {
        return new Vector(this.owner, vec2.add(this.coordinates, vector.coordinates));
    }
    subtract(vector: Vector): Vector {
        return new Vector(this.owner, vec2.subtract(this.coordinates, vector.coordinates));
    }
    scalarMultiply(scalar: number): Vector {
        return new Vector(this.owner, vec2.scalarMultiply(this.coordinates, scalar));
    }
    negative() {
        return new Vector(this.owner, vec2.negative(this.coordinates));
    }
    rotate(angle: number): Vector {
        return new Vector(this.owner, vec2.rotate(this.coordinates, angle));
    }

    apply(transformation: Transformation) {
        let c = transformation.transformCoordinates(this.coordinates);
        return new Vector(this.owner, this.point1Coordinates, c);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new Graphics();
        if (!this.isValid()) return g;
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;

        g.moveTo(...c1);
        g.lineTo(...c2);

        const arrowGraphics = new Arrow(this.owner, c2, this.angle).getGraphics(viewport);
        g.append(arrowGraphics);
        return g;
    }
    clone() {
        return new Vector(this.owner, this.point1X, this.point1Y, this.point2X, this.point2Y);
    }
    copyFrom(shape: Vector | null) {
        if (shape === null) shape = new Vector(this.owner);
        this._setX(shape._x);
        this._setY(shape._y);
        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        return this;
    }
    toString() {
        //prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\tpoint1X: ${this.point1X}`,
            `\tpoint1Y: ${this.point1Y}`,
            `} owned by Geomtoy(${this.owner.uuid})`
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

validAndWithSameOwner(Vector);

export default Vector;

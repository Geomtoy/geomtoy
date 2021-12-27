import { validAndWithSameOwner } from "../../decorator";
import assert from "../../utility/assertion";
import util from "../../utility";
import math from "../../utility/math";
import coord from "../../utility/coord";
import vec2 from "../../utility/vec2";

import { optionerOf } from "../../helper/Optioner";

import Shape from "../../base/Shape";
import Vector from "./Vector";
import Ray from "./Ray";
import LineSegment from "./LineSegment";
import Line from "./Line";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../..";
import type Transformation from "../../transformation";
import type { OwnerCarrier, ViewportDescriptor } from "../../types";

class Point extends Shape {
    private _x = NaN;
    private _y = NaN;

    constructor(owner: Geomtoy, x: number, y: number);
    constructor(owner: Geomtoy, coordinates: [number, number]);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any) {
        super(o);
        if (util.isNumber(a1)) {
            Object.assign(this, { x: a1, y: a2 });
        }
        if (util.isArray(a1)) {
            Object.assign(this, { coordinates: a1 });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        xChanged: "x" as const,
        yChanged: "y" as const
    });

    private _setX(value: number) {
        if (!util.isEqualTo(this._x, value)) this.trigger_(EventObject.simple(this, Point.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!util.isEqualTo(this._y, value)) this.trigger_(EventObject.simple(this, Point.events.yChanged));
        this._y = value;
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

    static zero(this: OwnerCarrier) {
        return new Point(this.owner, 0, 0);
    }

    isValid(): boolean {
        return coord.isValid(this.coordinates);
    }

    /**
     * Whether points `point1`, `point2`, `point3` are collinear.
     * @category Static
     * @param point1
     * @param point2
     * @param point3
     * @returns
     */
    static isThreePointsCollinear(owner: Geomtoy, point1: Point, point2: Point, point3: Point) {
        const [x1, y1] = point1.coordinates;
        const [x2, y2] = point2.coordinates;
        const [x3, y3] = point3.coordinates;
        const d = x1 * y2 + x2 * y3 + x3 * y1 - (x2 * y1 + x3 * y2 + x1 * y3); //cross product shorthand
        const epsilon = optionerOf(owner).options.epsilon;
        return math.equalTo(d, 0, epsilon);
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
    static getAngleNEquallyDividingRaysFromThreePoints(this: OwnerCarrier, n: number, vertex: Point, leg1: Point, leg2: Point): Ray[] | null {
        if (!util.isInteger(n) || n < 2) {
            throw new Error(`[G]\`n\` should be an integer and not less than 2, but we got \`${n}\`.`);
        }

        const [c0, c1, c2] = [vertex.coordinates, leg1.coordinates, leg2.coordinates];
        const epsilon = optionerOf(this.owner).options.epsilon;
        if (coord.isSameAs(c0, c1, epsilon) || coord.isSameAs(c0, c2, epsilon) || coord.isSameAs(c1, c2, epsilon)) {
            console.warn("[G]The points `vertex`, `leg1`, `leg2` are the same, there is no angle formed by them.");
            return null;
        }
        const a1 = vec2.angle(vec2.from(c0, c1));
        const a2 = vec2.angle(vec2.from(c0, c1));
        const d = (a2 - a1) / n;
        return util.range(1, n).map(i => new Ray(this.owner, vertex.coordinates, a1 + d * i));
    }

    //todo
    static isFourPointsConcyclic(this: OwnerCarrier, point1: Point, point2: Point, point3: Point, point4: Point) {}
    /**
     * Determine a point from vector `vector`.
     * @category Static
     * @param vector
     * @returns
     */
    static fromVector(owner: Geomtoy, vector: Vector) {
        return new Point(owner, vector.point2Coordinates);
    }
    /**
     * Whether point `this` is the same as point `point`.
     * @param {Point} point
     * @returns {boolean}
     */
    isSameAs(point: Point): boolean {
        if (point === this) return true;
        return coord.isSameAs(this.coordinates, point.coordinates, this.options_.epsilon);
    }
    /**
     * Move point `this` by `deltaX` and `deltaY` to get new point.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move point `this` itself by `deltaX` and `deltaY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.coordinates = coord.move(this.coordinates, deltaX, deltaY);
        return this;
    }
    /**
     * Move point `this` with `distance` along `angle` to get new point.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move point `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.coordinates = coord.moveAlongAngle(this.coordinates, angle, distance);
        return this;
    }
    /**
     * Get the distance between point `this` and point `point`.
     */
    getDistanceBetweenPoint(point: Point): number {
        return vec2.magnitude(vec2.from(this.coordinates, point.coordinates));
    }
    /**
     * Get the distance square between point `this` and point `point`.
     */
    getSquaredDistanceBetweenPoint(point: Point): number {
        return vec2.squaredMagnitude(vec2.from(this.coordinates, point.coordinates));
    }
    /**
     * Get the distance between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getDistanceBetweenLine(line: Line): number {
        return math.abs(this.getSignedDistanceBetweenLine(line));
    }
    /**
     * Get the signed distance between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getSignedDistanceBetweenLine(line: Line): number {
        const [a, b, c] = line.getGeneralEquationParameters();
        const { x, y } = this;
        return (a * x + b * y + c) / math.hypot(a, b);
    }
    /**
     * Get the distance square between point `this` and line `line`.
     * @param {Line} line
     * @returns {number}
     */
    getSquaredDistanceBetweenLine(line: Line): number {
        const [a, b, c] = line.getGeneralEquationParameters();
        const { x, y } = this;
        return (a * x + b * y + c) ** 2 / (a ** 2 + b ** 2);
    }
    /**
     * Get the distance between point `this` and line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     * @returns {number}
     */
    getDistanceBetweenLineSegment(lineSegment: LineSegment): number {
        return math.abs(this.getSignedDistanceBetweenLineSegment(lineSegment));
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
        const v12 = vec2.from(c1, c2);
        const v10 = vec2.from(c1, c);
        return vec2.cross(v12, v10) / vec2.magnitude(vec2.from(c1, c2));
    }
    /**
     * Get the distance square between point `this` and line segment `lineSegment`
     * @param {LineSegment} lineSegment
     * @returns {number}
     */
    getSquaredDistanceBetweenLineSegment(lineSegment: LineSegment): number {
        const c = this.coordinates;
        const { point1Coordinates: c1, point2Coordinates: c2 } = lineSegment;
        const v12 = vec2.from(c1, c2);
        const v10 = vec2.from(c1, c);
        return vec2.cross(v12, v10) ** 2 / vec2.squaredMagnitude(vec2.from(c1, c2));
    }

    /**
     * Whether point `this` is on the same line determined by points `point1` and `point2`,
     * and point `this` is between points `point1` and `point2`
     * @param point1
     * @param point2
     * @param allowEqual Allow point `this` to be equal to point `point1` or `point2`
     * @returns
     */
    isBetweenPoints(point1: Point, point2: Point, allowEqual: boolean = true): boolean {
        let c0 = this.coordinates,
            c1 = point1.coordinates,
            c2 = point2.coordinates,
            v12 = vec2.from(c1, c2),
            v10 = vec2.from(c1, c0),
            cp = vec2.cross(v12, v10),
            dp = vec2.dot(v12, v10),
            sm = vec2.squaredMagnitude(v12),
            epsilon = this.options_.epsilon;

        if (allowEqual) {
            return math.equalTo(cp, 0, epsilon) && !math.lessThan(dp, 0, epsilon) && !math.greaterThan(dp, sm, epsilon);
        }
        return math.equalTo(cp, 0, epsilon) && math.greaterThan(dp, 0, epsilon) && math.lessThan(dp, sm, epsilon);
    }
    isOnLineSegmentLyingLine(lineSegment: LineSegment): boolean {
        let v1 = vec2.from(lineSegment.point1Coordinates, lineSegment.point2Coordinates),
            v2 = vec2.from(lineSegment.point1Coordinates, this.coordinates),
            epsilon = this.options_.epsilon,
            dp = vec2.dot(v1, v2);
        return math.equalTo(dp, 0, epsilon);
    }

    isOnLineSegment(lineSegment: LineSegment): boolean {
        return this.isBetweenPoints(lineSegment.point1, lineSegment.point2, true);
    }

    getGraphics(viewport:ViewportDescriptor) {
        const g = new Graphics();
        if (!this.isValid()) return g;
        const scale = viewport.density * viewport.zoom;
        const pointSize = this.options_.graphics.pointSize / scale;

        g.centerArcTo(...this.coordinates, pointSize, pointSize, 0, 0, 2 * Math.PI);
        g.close();
        return g;
    }
    /**
     * Apply the transformation
     * @param transformation
     * @returns
     */
    apply(transformation: Transformation) {
        let c = transformation.transformCoordinates(this.coordinates);
        return new Point(this.owner, c);
    }
    clone() {
        return new Point(this.owner, this.x, this.y);
    }
    copyFrom(shape: Point | null) {
        if (shape === null) shape = new Point(this.owner);
        this._setX(shape._x);
        this._setY(shape._y);
        return this;
    }
    toString() {
        //prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [this.x, this.y];
    }
    toObject() {
        return { x: this.x, y: this.y };
    }
}

validAndWithSameOwner(Point);

/**
 * @category Shape
 */
export default Point;

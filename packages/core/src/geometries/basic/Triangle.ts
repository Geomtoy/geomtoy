import { Assert, Coordinates, Maths, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import SealedGeometryArray from "../../collection/SealedGeometryArray";
import EventSourceObject from "../../event/EventSourceObject";
import { eps } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import { Cartesian, Trilinear } from "../../helper/CoordinateSystem";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import { validGeometry } from "../../misc/decor-geometry";
import type Transformation from "../../transformation";
import type { ClosedGeometry, ViewportDescriptor, WindingDirection } from "../../types";
import Path from "../general/Path";
import Polygon from "../general/Polygon";
import Circle from "./Circle";
import Line from "./Line";
import LineSegment from "./LineSegment";
import Point from "./Point";

@validGeometry
export default class Triangle extends Geometry implements ClosedGeometry {
    private _point1X = NaN;
    private _point1Y = NaN;
    private _point2X = NaN;
    private _point2Y = NaN;
    private _point3X = NaN;
    private _point3Y = NaN;

    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number, point3X: number, point3Y: number);
    constructor(point1Coordinates: [number, number], point2Coordinates: [number, number], point3Coordinates: [number, number]);
    constructor(point1: Point, point2: Point, point3: Point);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { point1X: a0, point1Y: a1, point2X: a2, point2Y: a3, point3X: a4, point3Y: a5 });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { point1Coordinates: a0, point2Coordinates: a1, point3Coordinates: a2 });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { point1: a0, point2: a1, point3: a2 });
        }
    }

    static override events = {
        point1XChanged: "point1X" as const,
        point1YChanged: "point1Y" as const,
        point2XChanged: "point2X" as const,
        point2YChanged: "point2Y" as const,
        point3XChanged: "point3X" as const,
        point3YChanged: "point3Y" as const
    };

    private _setPoint1X(value: number) {
        if (!Utility.is(this._point1X, value)) this.trigger_(new EventSourceObject(this, Triangle.events.point1XChanged));
        this._point1X = value;
    }
    private _setPoint1Y(value: number) {
        if (!Utility.is(this._point1Y, value)) this.trigger_(new EventSourceObject(this, Triangle.events.point1YChanged));
        this._point1Y = value;
    }
    private _setPoint2X(value: number) {
        if (!Utility.is(this._point2X, value)) this.trigger_(new EventSourceObject(this, Triangle.events.point2XChanged));
        this._point2X = value;
    }
    private _setPoint2Y(value: number) {
        if (!Utility.is(this._point2Y, value)) this.trigger_(new EventSourceObject(this, Triangle.events.point2YChanged));
        this._point2Y = value;
    }
    private _setPoint3X(value: number) {
        if (!Utility.is(this._point3X, value)) this.trigger_(new EventSourceObject(this, Triangle.events.point3XChanged));
        this._point3X = value;
    }
    private _setPoint3Y(value: number) {
        if (!Utility.is(this._point3Y, value)) this.trigger_(new EventSourceObject(this, Triangle.events.point3YChanged));
        this._point3Y = value;
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
        return this._point2X;
    }
    set point2X(value) {
        Assert.isRealNumber(value, "point2X");
        this._setPoint2X(value);
    }
    get point2Y() {
        return this._point2Y;
    }
    set point2Y(value) {
        Assert.isRealNumber(value, "point2Y");
        this._setPoint2Y(value);
    }
    get point2Coordinates() {
        return [this._point2X, this._point2Y] as [number, number];
    }
    set point2Coordinates(value) {
        Assert.isCoordinates(value, "point2Coordinates");
        this._setPoint2X(Coordinates.x(value));
        this._setPoint2Y(Coordinates.y(value));
    }
    get point2() {
        return new Point(this._point2X, this._point2Y);
    }
    set point2(value) {
        this._setPoint2X(value.x);
        this._setPoint2Y(value.y);
    }
    get point3X() {
        return this._point3X;
    }
    set point3X(value) {
        Assert.isRealNumber(value, "point3X");
        this._setPoint3X(value);
    }
    get point3Y() {
        return this._point3Y;
    }
    set point3Y(value) {
        Assert.isRealNumber(value, "point3Y");
        this._setPoint3Y(value);
    }
    get point3Coordinates() {
        return [this._point3X, this._point3Y] as [number, number];
    }
    set point3Coordinates(value) {
        Assert.isCoordinates(value, "point3Coordinates");
        this._setPoint3X(Coordinates.x(value));
        this._setPoint3Y(Coordinates.y(value));
    }
    get point3() {
        return new Point(this._point3X, this._point3Y);
    }
    set point3(value) {
        this._setPoint3X(value.x);
        this._setPoint3Y(value.y);
    }
    /**
     * Get the length of the opposite side of `point1` which is line segment from `point2` to `point3`.
     */
    get side1Length() {
        return Vector2.magnitude(Vector2.from(this.point2Coordinates, this.point3Coordinates));
    }
    /**
     * Get the length of the opposite side of `point2` which is line segment from `point3` to `point1`.
     */
    get side2Length() {
        return Vector2.magnitude(Vector2.from(this.point3Coordinates, this.point1Coordinates));
    }
    /**
     * Get the length of the opposite side of `point3` which is line segment from `point1` to `point2`.
     */
    get side3Length() {
        return Vector2.magnitude(Vector2.from(this.point1Coordinates, this.point2Coordinates));
    }
    /**
     * Get the `angle1` at `point1`.
     */
    get angle1() {
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        return Maths.abs(Vector2.angleTo(Vector2.from(c1, c2), Vector2.from(c1, c3)));
    }
    /**
     * Get the `angle2` at `point2`.
     */
    get angle2() {
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        return Maths.abs(Vector2.angleTo(Vector2.from(c2, c3), Vector2.from(c2, c1)));
    }
    /**
     * Get the `angle3` at `point3`.
     */
    get angle3() {
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        return Maths.abs(Vector2.angleTo(Vector2.from(c3, c1), Vector2.from(c3, c2)));
    }

    @stated
    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._point1X) &&
            !Number.isNaN(this._point1Y) &&
            !Number.isNaN(this._point2X) &&
            !Number.isNaN(this._point2Y) &&
            !Number.isNaN(this._point3X) &&
            !Number.isNaN(this._point3Y) 
        );
    }

    degenerate(check: false): Point | SealedGeometryArray<[LineSegment, LineSegment, LineSegment]> | SealedGeometryArray<[LineSegment, LineSegment]> | SealedGeometryArray<[LineSegment]> | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        const triangleForming = Maths.greaterThan(Maths.abs(Vector2.cross(Vector2.from(c1, c3), Vector2.from(c1, c2))), 0, eps.vectorEpsilon);

        if (check) return !triangleForming;

        if (triangleForming) return this;

        const lss = [new LineSegment(c1, c2), new LineSegment(c2, c3), new LineSegment(c3, c1)].filter(ls => ls.degenerate(false) instanceof LineSegment);
        if (lss.length === 0) return new Point(c1);
        return new SealedGeometryArray(lss);
    }

    @stated
    getLength() {
        return this.side1Length + this.side2Length + this.side3Length;
    }
    /**
     * Get the winding direction of vertices of triangle `this`.
     */
    getWindingDirection(): WindingDirection {
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        const cp = Vector2.cross(Vector2.from(c1, c2), Vector2.from(c1, c3));
        return cp >= 0 ? 1 : -1;
    }

    static equilateralTriangleFromLineSegment(lineSegment: LineSegment, positive = true) {
        const c1 = lineSegment.point1Coordinates;
        const c2 = lineSegment.point2Coordinates;
        const v3 = Vector2.rotate(Vector2.from(c1, c2), positive ? Maths.PI / 3 : -Maths.PI / 3);
        const c3 = Vector2.add(c1, v3);
        return new Triangle(c1, c2, c3);
    }
    static fromThreeIntersectedLines(lines: Line[]) {}

    move(deltaX: number, deltaY: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, [deltaX, deltaY]);
        this.point2Coordinates = Vector2.add(this.point2Coordinates, [deltaX, deltaY]);
        this.point3Coordinates = Vector2.add(this.point3Coordinates, [deltaX, deltaY]);
        return this;
    }
    /**
     * Get the sides as line segments of triangle `this`.
     */
    getSideLineSegments(): [LineSegment, LineSegment, LineSegment] {
        return [
            new LineSegment(this.point2Coordinates, this.point3Coordinates),
            new LineSegment(this.point3Coordinates, this.point1Coordinates),
            new LineSegment(this.point1Coordinates, this.point2Coordinates)
        ];
    }
    /**
     * Get the altitudes as line segments of triangle `this`.
     */
    getAltitudeLineSegments(): [LineSegment, LineSegment, LineSegment] {
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        const c1p = Vector2.add(c2, Vector2.project(Vector2.from(c2, c1), Vector2.from(c2, c3)));
        const c2p = Vector2.add(c3, Vector2.project(Vector2.from(c3, c2), Vector2.from(c3, c1)));
        const c3p = Vector2.add(c1, Vector2.project(Vector2.from(c1, c3), Vector2.from(c1, c2)));
        return [new LineSegment(c1, c1p), new LineSegment(c2, c2p), new LineSegment(c3, c3p)];
    }
    /**
     * Get the medians as line segments of triangle `this`.
     */
    getMedianLineSegments(): [LineSegment, LineSegment, LineSegment] {
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        const c1p = Vector2.add(Vector2.scalarMultiply(c2, 1 / 2), Vector2.scalarMultiply(c3, 1 / 2));
        const c2p = Vector2.add(Vector2.scalarMultiply(c3, 1 / 2), Vector2.scalarMultiply(c1, 1 / 2));
        const c3p = Vector2.add(Vector2.scalarMultiply(c1, 1 / 2), Vector2.scalarMultiply(c2, 1 / 2));
        return [new LineSegment(c1, c1p), new LineSegment(c2, c2p), new LineSegment(c3, c3p)];
    }
    /**
     * Get the symmedians as line segments of triangle `this`.
     */
    getSymmedianLineSegments() {
        const ls = [this.side1Length, this.side2Length, this.side3Length];
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates];
        return Utility.range(0, 3).map(i => {
            const c0 = cs[i];
            const c1 = cs[(i + 1) % 3];
            const c2 = cs[(i + 2) % 3];
            const ls1 = ls[(i + 1) % 3];
            const ls2 = ls[(i + 2) % 3];
            const ratio = ls2 ** 2 / (ls1 ** 2 + ls2 ** 2);
            const c0p = Vector2.add(c1, Vector2.scalarMultiply(Vector2.from(c1, c2), ratio));
            return new LineSegment(c0, c0p);
        }) as [LineSegment, LineSegment, LineSegment];
    }
    /**
     * Get the angle bisectors as line segments of triangle `this`.
     */
    getAngleBisectingLineSegments(): [LineSegment, LineSegment, LineSegment] {
        const ls = [this.side1Length, this.side2Length, this.side3Length];
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates];
        return Utility.range(0, 3).map(i => {
            const c0 = cs[i];
            const c1 = cs[(i + 1) % 3];
            const c2 = cs[(i + 2) % 3];
            const ls1 = ls[(i + 1) % 3];
            const ls2 = ls[(i + 2) % 3];
            const ratio = ls2 / (ls1 + ls2);
            const c0p = Vector2.add(c1, Vector2.scalarMultiply(Vector2.from(c1, c2), ratio));
            return new LineSegment(c0, c0p);
        }) as [LineSegment, LineSegment, LineSegment];
    }
    /**
     * Get the perpendicular bisectors as line segments of triangle `this`.
     */
    getPerpendicularlyBisectingLineSegments(): [LineSegment, LineSegment, LineSegment] {
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates];
        return Utility.range(0, 3).map(i => {
            const c0 = cs[i];
            const c1 = cs[(i + 1) % 3];
            const c2 = cs[(i + 2) % 3];
            const v0 = Vector2.from(c1, c2);
            const v1 = Vector2.from(c1, c0);
            const v2 = Vector2.from(c2, c0);
            const d0 = Vector2.dot(v0, v0);
            const d1 = Vector2.dot(v1, v0);
            const d2 = Vector2.dot(v2, Vector2.negative(v0));
            const m0 = Vector2.add(Vector2.scalarMultiply(c1, 1 / 2), Vector2.scalarMultiply(c2, 1 / 2));
            let m0p;
            if (d1 >= d0 / 2) {
                const scalar = Vector2.squaredMagnitude(v0) / 2 / d1;
                m0p = Vector2.add(c1, Vector2.scalarMultiply(v1, scalar));
            } else {
                const scalar = Vector2.squaredMagnitude(v0) / 2 / d2;
                m0p = Vector2.add(cs[(i + 2) % 3], Vector2.scalarMultiply(v2, scalar));
            }
            return new LineSegment(m0, m0p);
        }) as [LineSegment, LineSegment, LineSegment];
    }

    /**
     * Whether triangle `this` is congruent with triangle `triangle`.
     * @param triangle
     */
    isCongruentWithTriangle(triangle: Triangle) {
        const [al1, al2, al3] = [this.side1Length, this.side2Length, this.side3Length].sort((a, b) => a - b);
        const [bl1, bl2, bl3] = [triangle.side1Length, triangle.side2Length, triangle.side3Length].sort((a, b) => a - b);
        return Maths.equalTo(al1, bl1, eps.epsilon) && Maths.equalTo(al2, bl2, eps.epsilon) && Maths.equalTo(al3, bl3, eps.epsilon);
    }
    /**
     * Whether triangle `this` is similar with triangle `triangle`.
     * @param triangle
     */
    isSimilarWithTriangle(triangle: Triangle) {
        const [aa1, aa2, aa3] = [this.angle1, this.angle2, this.angle3].sort((a, b) => a - b);
        const [ba1, ba2, ba3] = [triangle.angle1, triangle.angle2, triangle.angle3].sort((a, b) => a - b);
        return Maths.equalTo(aa1, ba1, eps.epsilon) && Maths.equalTo(aa2, ba2, eps.epsilon) && Maths.equalTo(aa3, ba3, eps.epsilon);
    }
    /**
     * Get the similarity ratio of triangles `this` and `triangle`.
     * @description
     * If triangle `this` is not similar with triangle `triangle`, return NaN, otherwise return the similarity ratio `this` over `triangle`.
     * @param triangle
     */
    getSimilarityRatioWithTriangle(triangle: Triangle) {
        if (!this.isSimilarWithTriangle(triangle)) return NaN;
        return this.getPerimeter() / triangle.getPerimeter();
    }

    /**
     * Whether triangle `this` is an acute triangle.
     */
    isAcuteTriangle() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length].sort((a, b) => a - b);
        return Maths.greaterThan(a ** 2 + b ** 2, c ** 2, eps.epsilon);
    }
    /**
     * Whether triangle `this` is a right triangle.
     */
    isRightTriangle() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length].sort((a, b) => a - b);
        return Maths.equalTo(a ** 2 + b ** 2, c ** 2, eps.epsilon);
    }
    /**
     * Whether triangle `this` is an obtuse triangle.
     */
    isObtuseTriangle() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length].sort((a, b) => a - b);
        return Maths.lessThan(a ** 2 + b ** 2, c ** 2, eps.epsilon);
    }
    /**
     * Whether triangle `this` is a scalene triangle(a triangle with no congruent sides).
     */
    isScaleneTriangle() {
        return !Maths.equalTo(this.side1Length, this.side2Length, eps.epsilon) && !Maths.equalTo(this.side1Length, this.side3Length, eps.epsilon);
    }
    /**
     * Whether triangle `this` is an isosceles triangle(a triangle with at least two congruent sides).
     */
    isIsoscelesTriangle() {
        return (
            Maths.equalTo(this.side1Length, this.side2Length, eps.epsilon) ||
            Maths.equalTo(this.side1Length, this.side3Length, eps.epsilon) ||
            Maths.equalTo(this.side2Length, this.side3Length, eps.epsilon)
        );
    }
    /**
     * Whether triangle `this` is an equilateral triangle(a triangle with three congruent sides).
     */
    isEquilateralTriangle() {
        return Maths.equalTo(this.side1Length, this.side2Length, eps.epsilon) && Maths.equalTo(this.side1Length, this.side3Length, eps.epsilon);
    }
    /**
     * Get perimeter of triangle `this`.
     */
    getPerimeter() {
        return this.side1Length + this.side2Length + this.side3Length;
    }
    /**
     * Get area of triangle `this`.
     */
    getArea() {
        const [x1, y1] = this.point1Coordinates;
        const [x2, y2] = this.point2Coordinates;
        const [x3, y3] = this.point3Coordinates;
        const a = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2); //cross product shorthand
        return Maths.abs(a / 2);
    }
    // #region using trilinear
    /**
     * Get the point at the `trilinear` coordinates respect to triangle `this`.
     * @param trilinear
     */
    getPointAtTrilinear(trilinear: [number, number, number]) {
        const t = new Trilinear(trilinear[0], trilinear[1], trilinear[2]);
        const c = t.toCartesian(this.point1Coordinates, this.point2Coordinates, this.point3Coordinates);
        return new Point(c.valueOf());
    }
    /**
     * Get the trilinear coordinates of point `point` respect to triangle `this`.
     * @param point
     */
    getTrilinearOfPoint(point: Point) {
        const c = new Cartesian(...point.coordinates);
        const t = c.toTrilinear(this.point1Coordinates, this.point2Coordinates, this.point3Coordinates);
        return t.valueOf();
    }
    /**
     * Whether point `point` is on triangle `this`.
     * @param point
     */
    isPointOnSideLines(point: Point) {
        const t = this.getTrilinearOfPoint(point);
        return Maths.sign(t[0], eps.epsilon) * Maths.sign(t[1], eps.epsilon) * Maths.sign(t[2], eps.epsilon) === 0;
    }
    isPointOn(point: Point): boolean {
        return true;
    }
    /**
     * Whether point `point` is inside triangle `this`.
     * @param point
     */
    isPointInside(point: Point) {
        const t = this.getTrilinearOfPoint(point);
        return Maths.sign(t[0], eps.epsilon) * Maths.sign(t[1], eps.epsilon) * Maths.sign(t[2], eps.epsilon) === 1;
    }
    /**
     * Whether point `point` is outside triangle `this`.
     * @param point
     */
    isPointOutside(point: Point) {
        const t = this.getTrilinearOfPoint(point);
        return Maths.sign(t[0], eps.epsilon) * Maths.sign(t[1], eps.epsilon) * Maths.sign(t[2], eps.epsilon) === -1;
    }
    /**
     * Get the isogonal conjugate point of point `point` respect to triangle `this`.
     * @param point
     */
    getIsogonalConjugatePointOfPoint(point: Point) {
        if (this.isPointOn(point)) return null;
        const t = this.getTrilinearOfPoint(point);
        const tp: [number, number, number] = [1 / t[0], 1 / t[1], 1 / t[2]];
        return this.getPointAtTrilinear(tp);
    }
    /**
     * Get the isotomic conjugate point of point `point` respect to triangle `this`.
     * @param point
     */
    getIsotomicConjugatePointOfPoint(point: Point) {
        if (this.isPointOn(point)) return null;
        const t = this.getTrilinearOfPoint(point);
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const tp: [number, number, number] = [1 / (a ** 2 * t[0]), 1 / (b ** 2 * t[1]), 1 / (c ** 2 * t[2])];
        return this.getPointAtTrilinear(tp);
    }
    /**
     * Get the centroid point of triangle `this`.
     */
    getCentroidPoint() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const t: [number, number, number] = [b * c, c * a, a * b];
        return this.getPointAtTrilinear(t);
    }
    /**
     * Get the medial triangle of triangle `this`.
     */
    getMedialTriangle() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const t1 = new Trilinear(0, c * a, a * b);
        const t2 = new Trilinear(b * c, 0, a * b);
        const t3 = new Trilinear(b * c, c * a, 0);
        const cc1 = t1.toCartesian(...cs);
        const cc2 = t2.toCartesian(...cs);
        const cc3 = t3.toCartesian(...cs);
        return new Triangle(cc1.valueOf(), cc2.valueOf(), cc3.valueOf());
    }
    /**
     * Get the antimedial triangle of triangle `this`.
     */
    getAntimedialTriangle() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const t1 = new Trilinear(-b * c, c * a, a * b);
        const t2 = new Trilinear(b * c, -c * a, a * b);
        const t3 = new Trilinear(b * c, c * a, -a * b);
        const cc1 = t1.toCartesian(...cs);
        const cc2 = t2.toCartesian(...cs);
        const cc3 = t3.toCartesian(...cs);
        return new Triangle(cc1.valueOf(), cc2.valueOf(), cc3.valueOf());
    }
    /**
     * Get the orthocenter point of triangle `this`.
     */
    getOrthocenterPoint() {
        const [x1, y1] = this.point1Coordinates;
        const [x2, y2] = this.point2Coordinates;
        const [x3, y3] = this.point3Coordinates;
        const a1 = x1 - x2;
        const a2 = x2 - x3;
        const a3 = x3 - x1;
        const b1 = y1 - y2;
        const b2 = y2 - y3;
        const b3 = y3 - y1;
        const d = x1 * b2 + x2 * b3 + x3 * b1;
        const x = (b1 * b2 * b3 - (x1 * x2 * b1 + x2 * x3 * b2 + x3 * x1 * b3)) / d;
        const y = (-a1 * a2 * a3 + (y1 * y2 * a1 + y2 * y3 * a2 + y3 * y1 * a3)) / d;
        return new Point(x, y);

        // const [aa, bb, cc] = [this.angle1, this.angle2, this.angle3];
        // const t: [number, number, number] = [Maths.sec(aa), Maths.sec(bb), Maths.sec(cc)];
        // return this.getPointAtTrilinear(t);
    }
    /**
     * Get the polar circle of triangle `this`.
     * @description
     * If `this` is not obtuse triangle, return null.
     */
    getPolarCircle(): Circle | null {
        if (!this.isObtuseTriangle()) return null;
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const area = this.getArea();
        const r = Maths.sqrt((a * b * c) ** 2 / (4 * area ** 2) - (a ** 2 + b ** 2 + c ** 2) / 2);
        return new Circle(this.getOrthocenterPoint(), r);
    }
    /**
     * Get the orthic triangle of triangle `this`.
     * @description
     * - If triangle `this` is right triangle, return null
     * - Else return the orthic triangle.
     */
    getOrthicTriangle() {
        if (this.isRightTriangle()) return null;
        const [a1, a2, a3] = [this.angle1, this.angle2, this.angle3];
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const t1 = new Trilinear(0, Maths.sec(a2), Maths.sec(a3));
        const t2 = new Trilinear(Maths.sec(a1), 0, Maths.sec(a3));
        const t3 = new Trilinear(Maths.sec(a1), Maths.sec(a2), 0);
        const cc1 = t1.toCartesian(...cs);
        const cc2 = t2.toCartesian(...cs);
        const cc3 = t3.toCartesian(...cs);
        return new Triangle(cc1.valueOf(), cc2.valueOf(), cc3.valueOf());
    }
    /**
     * Get the incenter point of triangle `this` using trilinear.
     */
    getIncenterPointAlt() {
        const t: [number, number, number] = [1, 1, 1];
        return this.getPointAtTrilinear(t);
    }
    /**
     * Get the circumcenter point of triangle `this` using trilinear.
     */
    getCircumcenterPointAlt() {
        const [aa, bb, cc] = [this.angle1, this.angle2, this.angle3];
        const t: [number, number, number] = [Maths.cos(aa), Maths.cos(bb), Maths.cos(cc)];
        return this.getPointAtTrilinear(t);
    }
    /**
     * Get the escenter points of triangle `this`.
     */
    getEscenterPointsAlt(): [Point, Point, Point] {
        const t1: [number, number, number] = [-1, 1, 1];
        const t2: [number, number, number] = [1, -1, 1];
        const t3: [number, number, number] = [1, 1, -1];
        return [this.getPointAtTrilinear(t1), this.getPointAtTrilinear(t2), this.getPointAtTrilinear(t3)];
    }
    /**
     * Get the Nine-point circle center point of triangle `this`.
     */
    getNinePointCenterPoint() {
        // Nine-point center = cos(B-C) : cos(C-A) : cos(A-B)
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const t = new Trilinear(Maths.cos(this.angle2 - this.angle3), Maths.cos(this.angle3 - this.angle1), Maths.cos(this.angle1 - this.angle2));
        const cc = t.toCartesian(...cs);
        return new Point(cc.valueOf());
    }
    /**
     * Get the Nine-point circle of triangle `this`.
     */
    getNinePointCircle() {
        const p = this.getNinePointCenterPoint();
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const area = this.getArea();
        const r = (a * b * c) / (8 * area);
        return new Circle(p.coordinates, r);
    }
    /**
     * Get the Nagel point of triangle `this`.
     */
    getNagelPoint() {
        // Nagel = (b+c-a)/a : (c+a-b)/b : (a+b-c)/c = csc^2(A/2) : csc^2(B/2) : csc^2(C/2)
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const d1 = (-a + b + c) / a;
        const d2 = (a - b + c) / b;
        const d3 = (a + b - c) / c;
        const t = new Trilinear(d1, d2, d3);
        const cc = t.toCartesian(...cs);
        return new Point(cc.valueOf());
    }
    /**
     * Get the Nagel triangle of triangle `this`.
     *
     */
    //todo remove
    // getNagelTriangle() {
    //     const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
    //     let [a1, a2, a3] = [this.angle1, this.angle2, this.angle3],
    //         d1 = a1 / 2,
    //         d2 = a2 / 2,
    //         d3 = a3 / 2,
    //         t1 = new Trilinear(0, Maths.csc(d2) ** 2, Maths.csc(d3) ** 2),
    //         t2 = new Trilinear(Maths.csc(d1) ** 2, 0, Maths.csc(d3) ** 2),
    //         t3 = new Trilinear(Maths.csc(d1) ** 2, Maths.csc(d2) ** 2, 0),
    //         cc1 = t1.toCartesian(...cs),
    //         cc2 = t2.toCartesian(...cs),
    //         cc3 = t3.toCartesian(...cs);
    //     return new Triangle(cc1.valueOf(), cc2.valueOf(), cc3.valueOf());
    // }
    /**
     * Get the Gergonne point of triangle `this`.
     */
    getGergonnePoint() {
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const d1 = (b * c) / (-a + b + c);
        const d2 = (a * c) / (a - b + c);
        const d3 = (a * b) / (a + b - c);
        const t = new Trilinear(d1, d2, d3);
        const cc = t.toCartesian(...cs);
        return new Point(cc.valueOf());
    }
    /**
     * Get the Gergonne triangle of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle_Gergonne_triangle_and_point}
     */
    getGergonneTriangle() {
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const [a1, a2, a3] = [this.angle1, this.angle2, this.angle3];
        const d1 = a1 / 2;
        const d2 = a2 / 2;
        const d3 = a3 / 2;
        const t1 = new Trilinear(0, Maths.sec(d2) ** 2, Maths.sec(d3) ** 2);
        const t2 = new Trilinear(Maths.sec(d1) ** 2, 0, Maths.sec(d3) ** 2);
        const t3 = new Trilinear(Maths.sec(d1) ** 2, Maths.sec(d2) ** 2, 0);
        const cc1 = t1.toCartesian(...cs);
        const cc2 = t2.toCartesian(...cs);
        const cc3 = t3.toCartesian(...cs);
        return new Triangle(cc1.valueOf(), cc2.valueOf(), cc3.valueOf());
    }

    getLemoinePoint() {
        // Lemoine = a : b : c = sinA : sinB : sinC
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const t = new Trilinear(a, b, c);
        const cc = t.toCartesian(...cs);
        return new Point(cc.valueOf());
    }
    getLemoineLine() {
        return new Line(0, 0, 0);
    }
    /**
     * Get the Feuerbach circle of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Feuerbach_point}
     */
    getFeuerbachPoint() {
        // Feuerbach = 1−cos(B−C) : 1−cos(C−A) : 1−cos(A−B)
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const t = new Trilinear(1 - Maths.cos(this.angle2 - this.angle3), 1 - Maths.cos(this.angle3 - this.angle1), 1 - Maths.cos(this.angle1 - this.angle2));
        const cc = t.toCartesian(...cs);
        return new Point(cc.valueOf());
    }
    /**
     * Get the Feuerbach triangle of triangle `this`.
     * @see {@link https://mathworld.wolfram.com/FeuerbachTriangle.html}
     */
    getFeuerbachTriangle() {
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const [a1, a2, a3] = [this.angle1, this.angle2, this.angle3];
        const d1 = (a2 - a3) / 2;
        const d2 = (a3 - a1) / 2;
        const d3 = (a1 - a2) / 2;
        const t1 = new Trilinear(-1 * Maths.sin(d1) ** 2, Maths.cos(d2) ** 2, Maths.cos(d3) ** 2);
        const t2 = new Trilinear(Maths.cos(d1) ** 2, -1 * Maths.sin(d2) ** 2, Maths.cos(d3) ** 2);
        const t3 = new Trilinear(Maths.cos(d1) ** 2, Maths.cos(d2) ** 2, -1 * Maths.sin(d3) ** 2);
        const cc1 = t1.toCartesian(...cs);
        const cc2 = t2.toCartesian(...cs);
        const cc3 = t3.toCartesian(...cs);
        return new Triangle(cc1.valueOf(), cc2.valueOf(), cc3.valueOf());
    }

    /**
     * Get the first Fermat point of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Fermat_point}
     */
    //todo modify
    getFirstFermatPoint() {
        // Fermat1 = csc(A+PI/3) : csc(B+PI/3) : csc(C+PI/3)
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const t = new Trilinear(Maths.csc(this.angle1 + Maths.PI / 3), Maths.csc(this.angle2 + Maths.PI / 3), Maths.csc(this.angle3 + Maths.PI / 3));
        const cc = t.toCartesian(...cs);
        return new Point(cc.valueOf());
    }
    /**
     * Get the second Fermat point of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Fermat_point}
     */
    //todo modify
    getSecondFermatPoint() {
        // Fermat2 = csc(A-PI/3) : csc(B-PI/3) : csc(C-PI/3)
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const t = new Trilinear(Maths.csc(this.angle1 - Maths.PI / 3), Maths.csc(this.angle2 - Maths.PI / 3), Maths.csc(this.angle3 - Maths.PI / 3));
        const cc = t.toCartesian(...cs);
        return new Point(cc.valueOf());
    }
    /**
     * Get the first isodynamic point of triangle `this`
     * @description
     * If triangle is an equilateral triangle, return null, otherwise return the first isodynamic point.
     * @see {@link https://en.wikipedia.org/wiki/Isodynamic_point}
     */
    getFirstIsodynamicPoint() {
        // isodynamic1 = sin(A+PI/3) : sin(B+PI/3) : sin(C+PI/3)
        if (this.isEquilateralTriangle()) return null;
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const t = new Trilinear(Maths.sin(this.angle1 + Maths.PI / 3), Maths.sin(this.angle2 + Maths.PI / 3), Maths.sin(this.angle3 + Maths.PI / 3));
        const cc = t.toCartesian(...cs);
        return new Point(cc.valueOf());
    }
    /**
     * Get the second isodynamic point of triangle `this`
     * @description
     * If triangle is an equilateral triangle, return null, otherwise return the second isodynamic point.
     * @see {@link https://en.wikipedia.org/wiki/Isodynamic_point}
     */
    getSecondIsodynamicPoint() {
        // isodynamic2 = sin(A-PI/3) : sin(B-PI/3) : sin(C-PI/3)
        if (this.isEquilateralTriangle()) return null;
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const t = new Trilinear(Maths.sin(this.angle1 - Maths.PI / 3), Maths.sin(this.angle2 - Maths.PI / 3), Maths.sin(this.angle3 - Maths.PI / 3));
        const cc = t.toCartesian(...cs);
        return new Point(cc.valueOf());
    }

    /**
     * @see {@link https://mathworld.wolfram.com/EulerPoints.html}
     */
    getEulerPoints(): [Point, Point, Point] {
        const { x: hx, y: hy } = this.getOrthocenterPoint();
        const [x1, y1] = this.point1Coordinates;
        const [x2, y2] = this.point2Coordinates;
        const [x3, y3] = this.point3Coordinates;
        const e1: [number, number] = [(hx + x1) / 2, (hy + y1) / 2];
        const e2: [number, number] = [(hx + x2) / 2, (hy + y2) / 2];
        const e3: [number, number] = [(hx + x3) / 2, (hy + y3) / 2];
        return [new Point(e1), new Point(e2), new Point(e3)];
    }
    /**
     * @see {@link https://mathworld.wolfram.com/EulerTriangle.html}
     */
    getEulerTriangle() {}

    /**
     * Get the Lemoine Line
     * @see {@link https://mathworld.wolfram.com/LemoineAxis.html}
     */

    /**
     * Get Euler line of triangle `this`
     * @see {@link https://en.wikipedia.org/wiki/Euler_line}
     */
    getEulerLine() {
        if (this.isEquilateralTriangle()) return null;
        const p1 = this.getCircumcenterPoint();
        const p2 = this.getOrthocenterPoint();
        return Line.fromTwoPoints(p1, p2);
    }

    // #endregion

    /**
     * Get the tangential triangle of triangle `this`.
     * @see {@link https://en.wikipedia.org/wiki/Tangential_triangle}
     */
    getTangentialTriangle() {
        const cs = [this.point1Coordinates, this.point2Coordinates, this.point3Coordinates] as const;
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const t1 = new Trilinear(-a, b, c);
        const t2 = new Trilinear(a, -b, c);
        const t3 = new Trilinear(a, b, -c);
        const cc1 = t1.toCartesian(...cs);
        const cc2 = t2.toCartesian(...cs);
        const cc3 = t3.toCartesian(...cs);
        return new Triangle(cc1.valueOf(), cc2.valueOf(), cc3.valueOf());
    }

    /**
     * @see {@link https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle  Gergonne triangle}
     */
    getIntouchTriangle() {}
    /**
     * @see {@link https://en.wikipedia.org/wiki/Extouch_triangle}
     */
    getExtouchTriangle() {}
    getIncentralTriangle() {}

    /**
     * Get the incenter point of triangle `this`.
     */
    getIncenterPoint() {
        const [x1, y1] = this.point1Coordinates;
        const [x2, y2] = this.point2Coordinates;
        const [x3, y3] = this.point3Coordinates;
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const d = a + b + c; // this.getPerimeter()
        const x = (a * x1 + b * x2 + c * x3) / d;
        const y = (a * y1 + b * y2 + c * y3) / d;
        return new Point(x, y);
    }
    /**
     * Get the inscribed circle of triangle `this`.
     */
    getInscribedCircle() {
        const s = this.getArea();
        const d = this.getPerimeter();
        const r = (2 * s) / d;
        return new Circle(this.getIncenterPoint(), r);
    }
    /**
     * Get the circumcenter point of triangle `this`.
     */
    getCircumcenterPoint() {
        const [x1, y1] = this.point1Coordinates;
        const [x2, y2] = this.point2Coordinates;
        const [x3, y3] = this.point3Coordinates;
        const a1 = 2 * (x2 - x1);
        const b1 = 2 * (y2 - y1);
        const c1 = x2 ** 2 + y2 ** 2 - (x1 ** 2 + y1 ** 2);
        const a2 = 2 * (x3 - x2);
        const b2 = 2 * (y3 - y2);
        const c2 = x3 ** 2 + y3 ** 2 - (x2 ** 2 + y2 ** 2);
        const d = a1 * b2 - a2 * b1;
        const x = (c1 * b2 - c2 * b1) / d;
        const y = (c2 * a1 - c1 * a2) / d;

        return new Point(x, y);
    }
    /**
     * Get the circumscribed circle of triangle `this`.
     */
    getCircumscribedCircle() {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const area = this.getArea();
        const r = (a * b * c) / (4 * area);
        return new Circle(this.getCircumcenterPoint(), r);
    }
    /**
     * Get the escenter points of triangle `this`.
     */
    getEscenterPoints(): [Point, Point, Point] {
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const [x1, y1] = this.point1Coordinates;
        const [x2, y2] = this.point2Coordinates;
        const [x3, y3] = this.point3Coordinates;
        const ead = -a + b + c;
        const ea: [number, number] = [(-a * x1 + b * x2 + c * x3) / ead, (-a * y1 + b * y2 + c * y3) / ead];
        const ebd = a - b + c;
        const eb: [number, number] = [(a * x1 - b * x2 + c * x3) / ebd, (a * y1 - b * y2 + c * y3) / ebd];
        const ecd = a + b - c;
        const ec: [number, number] = [(a * x1 + b * x2 - c * x3) / ecd, (a * y1 + b * y2 - c * y3) / ecd];
        return [new Point(ea), new Point(eb), new Point(ec)];
    }

    getEscribedCircleRadii() {
        const s = this.getArea();
        const p = this.getPerimeter() / 2;
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        return [s / (p - a), s / (p - b), s / (p - c)];
    }

    /**
     * Get the escribed circles of triangle `this`.
     */
    getEscribedCircles(): [Circle, Circle, Circle] {
        const [ea, eb, ec] = this.getEscenterPoints();
        const area = this.getArea();
        const [a, b, c] = [this.side1Length, this.side2Length, this.side3Length];
        const ead = -a + b + c;
        const ebd = a - b + c;
        const ecd = a + b - c;
        const ra = (2 * area) / ead;
        const rb = (2 * area) / ebd;
        const rc = (2 * area) / ecd;
        return [new Circle(ea, ra), new Circle(eb, rb), new Circle(ec, rc)];
    }

    getBoundingBox() {
        return this.toPolygon().getBoundingBox();
    }

    toPolygon() {
        const polygon = new Polygon();
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        polygon.appendVertex(Polygon.vertex(c1));
        polygon.appendVertex(Polygon.vertex(c2));
        polygon.appendVertex(Polygon.vertex(c3));
        polygon.closed = true;
        return polygon;
    }

    toPath() {
        const path = new Path();
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        path.appendCommand(Path.moveTo(c1));
        path.appendCommand(Path.lineTo(c2));
        path.appendCommand(Path.lineTo(c3));
        path.closed = true;
        return path;
    }
    apply(transformation: Transformation) {
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        const nc1 = transformation.transformCoordinates(c1);
        const nc2 = transformation.transformCoordinates(c2);
        const nc3 = transformation.transformCoordinates(c3);
        return new Triangle(nc1, nc2, nc3);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>).getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const { point1Coordinates: c1, point2Coordinates: c2, point3Coordinates: c3 } = this;
        gg.moveTo(...c1);
        gg.lineTo(...c2);
        gg.lineTo(...c3);
        gg.close();
        return g;
    }
    clone() {
        return new Triangle(this._point1X, this._point1Y, this._point2X, this._point2Y, this._point3X, this._point3Y);
    }
    copyFrom(shape: Triangle | null) {
        if (shape === null) shape = new Triangle();
        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        this._setPoint2X(shape._point2X);
        this._setPoint2Y(shape._point2Y);
        this._setPoint3X(shape._point3X);
        this._setPoint3Y(shape._point3Y);
        return this;
    }
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            point1X: this._point1X,
            point1Y: this._point1Y,
            point2X: this._point2X,
            point2Y: this._point2Y,
            point3X: this._point3X,
            point3Y: this._point3Y
        };
    }
}

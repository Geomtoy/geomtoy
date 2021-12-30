import { validAndWithSameOwner } from "../../decorator";
import assert from "../../utility/assertion";
import util from "../../utility";
import math from "../../utility/math";
import coord from "../../utility/coord";
import vec2 from "../../utility/vec2";

import Shape from "../../base/Shape";
import Point from "./Point";
import Vector from "./Vector";
import Line from "./Line";
import Ray from "./Ray";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../..";
import type Transformation from "../../transformation";
import type { FiniteOpenShape, TransformableShape } from "../../types";

class LineSegment extends Shape implements FiniteOpenShape, TransformableShape {
    private _point1X = NaN;
    private _point1Y = NaN;
    private _point2X = NaN;
    private _point2Y = NaN;

    constructor(owner: Geomtoy, point1X: number, point1Y: number, point2X: number, point2Y: number);
    constructor(owner: Geomtoy, point1Coordinates: [number, number], point2Coordinates: [number, number]);
    constructor(owner: Geomtoy, point1: Point, point2: Point);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any) {
        super(o);
        if (util.isNumber(a1)) {
            Object.assign(this, { point1X: a1, point1Y: a2, point2X: a3, point2Y: a4 });
        }
        if (util.isArray(a1)) {
            Object.assign(this, { point1Coordinates: a1, point2Coordinates: a2 });
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point1: a1, point2: a2 });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        point1XChanged: "point1X" as const,
        point1YChanged: "point1Y" as const,
        point2XChanged: "point2X" as const,
        point2YChanged: "point2Y" as const,
        angleChanged: "angle" as const
    });

    private _setPoint1X(value: number) {
        if (!util.isEqualTo(this._point1X, value)) {
            this.trigger_(EventObject.simple(this, LineSegment.events.point1XChanged));
            this.trigger_(EventObject.simple(this, LineSegment.events.angleChanged));
        }
        this._point1X = value;
    }
    private _setPoint1Y(value: number) {
        if (!util.isEqualTo(this._point1Y, value)) {
            this.trigger_(EventObject.simple(this, LineSegment.events.point1YChanged));
            this.trigger_(EventObject.simple(this, LineSegment.events.angleChanged));
        }
        this._point1Y = value;
    }
    private _setPoint2X(value: number) {
        if (!util.isEqualTo(this._point2X, value)) {
            this.trigger_(EventObject.simple(this, LineSegment.events.point2XChanged));
            this.trigger_(EventObject.simple(this, LineSegment.events.angleChanged));
        }
        this._point2X = value;
    }
    private _setPoint2Y(value: number) {
        if (!util.isEqualTo(this._point2Y, value)) {
            this.trigger_(EventObject.simple(this, LineSegment.events.point2YChanged));
            this.trigger_(EventObject.simple(this, LineSegment.events.angleChanged));
        }
        this._point2Y = value;
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
        return this._point2X;
    }
    set point2X(value) {
        assert.isRealNumber(value, "point2X");
        this._setPoint2X(value);
    }
    get point2Y() {
        return this._point2Y;
    }
    set point2Y(value) {
        assert.isRealNumber(value, "point2Y");
        this._setPoint2Y(value);
    }
    get point2Coordinates() {
        return [this._point2X, this._point2Y] as [number, number];
    }
    set point2Coordinates(value) {
        assert.isCoordinates(value, "point2Coordinates");
        this._setPoint2X(coord.x(value));
        this._setPoint2Y(coord.y(value));
    }
    get point2() {
        return new Point(this.owner, this._point2X, this._point2Y);
    }
    set point2(value) {
        this._setPoint2X(value.x);
        this._setPoint2Y(value.y);
    }
    get angle() {
        return vec2.angle(vec2.from(this.point1Coordinates, this.point2Coordinates));
    }
    set angle(value) {
        assert.isRealNumber(value, "angle");
        const nc2 = vec2.add(this.point1Coordinates, vec2.from2(value, this.getLength()));
        this._setPoint2X(coord.x(nc2));
        this._setPoint2Y(coord.y(nc2));
    }

    static formingCondition = "The two endpoints of a `LineSegment` should be distinct, or the length of a `LineSegment` should greater than 0.";

    isValid() {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const epsilon = this.options_.epsilon;
        if (!coord.isValid(c1)) return false;
        if (!coord.isValid(c2)) return false;
        if (coord.isSameAs(c1, c2, epsilon)) return false;
        return true;
    }

    static fromPointAndAngleAndLength(owner: Geomtoy, point: [number, number] | Point, angle: number, length: number) {
        const c1 = point instanceof Point ? point.coordinates : point;
        const c2 = coord.moveAlongAngle(c1, angle, length);
        return new LineSegment(owner, c1, c2);
    }
    /**
     * Get the `n` equally dividing rays of the angle which is formed by rays `ray1` and `ray2`.
     * @description
     * The angle is generated from `ray1` to `ray2` taking the common endpoint as the center of rotation.
     * If `n` is not integer, return `null`.
     * If `ray1` and `ray2` have different endpoint, return `null`.
     * @param n
     * @param ray1
     * @param ray2
     */
    static getAngleNEquallyDividingRaysOfTwoRays(owner: Geomtoy, n: number, ray1: Ray, ray2: Ray): Ray[] | null {
        if (!util.isInteger(n) || n < 2) return null;
        if (!ray1.isEndpointSameAs(ray2)) return null;
        let a1 = ray1.angle,
            a2 = ray2.angle,
            vertex = ray1.point,
            d = (a2 - a1) / n,
            ret: Ray[] = [];
        util.range(1, n).forEach(index => {
            ret.push(new Ray(owner, vertex, a1 + d * index));
        });
        return ret;
    }

    /**
     * Whether the two endpoints of line segment `this` is the same as line segment `lineSegment` ignoring the order of the endpoints.
     * @param lineSegment
     * @returns
     */
    isSameAs(lineSegment: LineSegment) {
        const epsilon = this.options_.epsilon;
        const [ac1, ac2] = coord.sortArraySelf([this.point1Coordinates, this.point2Coordinates], epsilon);
        const [bc1, bc2] = coord.sortArraySelf([lineSegment.point1Coordinates, lineSegment.point2Coordinates], epsilon);
        return coord.isSameAs(ac1, bc1, epsilon) && coord.isSameAs(ac2, bc2, epsilon);
    }
    /**
     * Whether the two endpoints of line segment `this` is the same as line segment `lineSegment` considering the order of the endpoints.
     * @param lineSegment
     * @returns
     */
    isSameAs2(lineSegment: LineSegment) {
        let epsilon = this.options_.epsilon;
        return coord.isSameAs(this.point1Coordinates, lineSegment.point1Coordinates, epsilon) && coord.isSameAs(this.point2Coordinates, lineSegment.point2Coordinates, epsilon);
    }
    /**
     * Move line segment `this` by `offsetX` and `offsetY` to get new line segment.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move line segment `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.point1Coordinates = coord.move(this.point1Coordinates, deltaX, deltaY);
        this.point2Coordinates = coord.move(this.point2Coordinates, deltaX, deltaY);
        return this;
    }
    /**
     * Move line segment `this` with `distance` along `angle` to get new line segment.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move line segment `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.point1Coordinates = coord.moveAlongAngle(this.point1Coordinates, angle, distance);
        this.point2Coordinates = coord.moveAlongAngle(this.point2Coordinates, angle, distance);
        return this;
    }
    /**
     * Get the middle point of line segment `this`.
     * @returns
     */
    getMiddlePoint() {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = this;
        return new Point(this.owner, (x1 + x2) / 2, (y1 + y2) / 2);
    }
    /**
     * Get the perpendicularly bisecting line of line segment `this`.
     * @returns
     */
    getPerpendicularlyBisectingLine() {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = this;
        return new Line(this.owner, this.getMiddlePoint(), (x1 - x2) / (y1 - y2));
    }

    getIntersectionPointWithLine(line: Line) {
        return line.getIntersectionPointWithLineSegment(this);
    }

    // #region Positional relationships of line segment to line segment
    // (IdenticalTo)
    // PerpendicularTo
    // ParallelTo
    // CollinearWith = ParallelTo | self
    // JointedWith
    // OverlappedWith = ParallelTo | CollinearWith | self,
    // IntersectedWith
    // SeparatedFrom

    /**
     * Whether line segment `this` is perpendicular to line segment `lineSegment`, regardless of whether they intersect.
     * @param {LineSegment} lineSegment
     * @returns {boolean}
     */
    isPerpendicularWithLineSegment(lineSegment: LineSegment): boolean {
        let { point1Coordinates: c1, point2Coordinates: c2 } = this,
            { point1Coordinates: c3, point2Coordinates: c4 } = lineSegment,
            v12 = vec2.from(c1, c2),
            v34 = vec2.from(c3, c4),
            dp = vec2.dot(v12, v34),
            epsilon = this.options_.epsilon;
        return math.equalTo(dp, 0, epsilon);
    }
    /**
     * Whether line segment `this` is parallel to line segment `lineSegment`, regardless of whether they are collinear or even the same.
     * @param {LineSegment} lineSegment
     * @returns {boolean}
     */
    isParallelToLineSegment(lineSegment: LineSegment): boolean {
        let { point1Coordinates: c1, point2Coordinates: c2 } = this,
            { point1Coordinates: c3, point2Coordinates: c4 } = lineSegment,
            v12 = vec2.from(c1, c2),
            v34 = vec2.from(c3, c4),
            cp = vec2.cross(v12, v34),
            epsilon = this.options_.epsilon;
        return math.equalTo(cp, 0, epsilon);
    }

    /**
     * `线段this`与`线段s`是否共线，无论是否相接乃至相同
     * @param {LineSegment} lineSegment
     * @returns {boolean}
     */
    isCollinearToLineSegment(lineSegment: LineSegment): boolean {
        let { point1Coordinates: c1, point2Coordinates: c2 } = this,
            { point1Coordinates: c3, point2Coordinates: c4 } = lineSegment,
            v12 = vec2.from(c1, c2),
            v34 = vec2.from(c3, c4),
            v32 = vec2.from(c3, c2),
            cp1 = vec2.cross(v12, v34),
            cp2 = vec2.cross(v32, v34),
            epsilon = this.options_.epsilon;
        return math.equalTo(cp1, 0, epsilon) && math.equalTo(cp2, 0, epsilon);
    }
    /**
     * `线段this`与`线段s`是否相接，即有且只有一个端点被共用(若两个共用则相同)，无论夹角为多少
     * @param {LineSegment} lineSegment
     * @returns {boolean | Point} 接点
     */
    isJointedWithLineSegment(lineSegment: LineSegment): boolean {
        let { point1Coordinates: c1, point2Coordinates: c2 } = this,
            { point1Coordinates: c3, point2Coordinates: c4 } = lineSegment,
            epsilon = this.options_.epsilon,
            d1 = coord.isSameAs(c1, c3, epsilon),
            d2 = coord.isSameAs(c2, c4, epsilon),
            d3 = coord.isSameAs(c1, c4, epsilon),
            d4 = coord.isSameAs(c2, c3, epsilon);
        return d1 !== d2 || d3 !== d4;
    }
    getJointPointWithLineSegment(lineSegment: LineSegment): Point | null {
        if (!this.isJointedWithLineSegment(lineSegment)) return null;
        let { point1Coordinates: c1, point2Coordinates: c2 } = this,
            { point1Coordinates: c3, point2Coordinates: c4 } = lineSegment,
            epsilon = this.options_.epsilon;
        if (coord.isSameAs(c1, c3, epsilon) || coord.isSameAs(c1, c4, epsilon)) {
            return this.point1;
        } else {
            return this.point2;
        }
    }
    isContainedByLineSegment(lineSegment: LineSegment) {
        if (!this.isCollinearToLineSegment(lineSegment)) return false;
        const epsilon = this.options_.epsilon;
        const [ac1, ac2] = coord.sortArraySelf([this.point1Coordinates, this.point2Coordinates], epsilon);
        const [bc1, bc2] = coord.sortArraySelf([lineSegment.point1Coordinates, lineSegment.point2Coordinates], epsilon);
        return coord.compare(bc1, ac1, epsilon) <= 0 && coord.compare(bc2, ac2, epsilon) >= 0;
    }

    getLength() {
        return vec2.magnitude(vec2.from(this.point1Coordinates, this.point2Coordinates));
    }
    isPointOn(point: [number, number] | Point) {
        const c1 = this.point1Coordinates;
        const c2 = this.point2Coordinates;
        const c3 = point instanceof Point ? point.coordinates : point;
        const epsilon = this.options_.epsilon;
        if (coord.isSameAs(c1, c3, epsilon) || coord.isSameAs(c2, c3, epsilon)) return true;
        const v13 = vec2.from(c1, c3);
        const v23 = vec2.from(c2, c3);
        const dp = vec2.dot(v13, v23);
        return math.equalTo(dp, 0, epsilon) && !math.equalTo(vec2.angle(v13), vec2.angle(v23), epsilon);
    }

    /**
     * `线段this`与`线段s`是否有重合，即有部分重合的一段(线段)
     * @param {LineSegment} s
     * @returns {boolean | LineSegment} 重合部分
     */
    isOverlappedWithLineSegment(lineSegment: LineSegment) {
        if (!this.isCollinearToLineSegment(lineSegment)) return false;

        const epsilon = this.options_.epsilon;
        const [ac1, ac2] = coord.sortArraySelf([this.point1Coordinates, this.point2Coordinates], epsilon);
        const [bc1, bc2] = coord.sortArraySelf([lineSegment.point1Coordinates, lineSegment.point2Coordinates], epsilon);

        if (coord.compare(ac1, bc1, epsilon) <= 0) {
            return math.greaterThan(vec2.squaredMagnitude(vec2.from(ac1, ac2)), vec2.squaredMagnitude(vec2.from(ac1, bc1)), epsilon);
        } else {
            return math.greaterThan(vec2.squaredMagnitude(vec2.from(bc1, bc2)), vec2.squaredMagnitude(vec2.from(bc1, ac1)), epsilon);
        }
    }
    getOverlapLineSegmentWithLineSegment(lineSegment: LineSegment): LineSegment | null {
        if (!this.isOverlappedWithLineSegment(lineSegment)) return null;
        const epsilon = this.options_.epsilon;
        let cs = coord.sortArraySelf([this.point1Coordinates, this.point2Coordinates, lineSegment.point1Coordinates, lineSegment.point2Coordinates], epsilon);
        return new LineSegment(this.owner, util.nth(cs, 1)!, util.nth(cs, 2)!);
    }
    /**
     * `线段this`与`线段s`是否相交，相交不仅要求有且仅有一个点重合，且要求夹角不等于0或者math.PI
     * 包含了不共线的相接和线段的端点在另一个线段上的特殊情况
     * @param {LineSegment} lineSegment
     * @returns {boolean | Point} 交点
     */
    _isIntersectedWithLineSegment(lineSegment: LineSegment) {
        if (this.isParallelToLineSegment(lineSegment)) return false; //相交的前提是不平行

        let v1 = new Vector(this.owner, this.point1, this.point2),
            v2 = new Vector(this.owner, lineSegment.point1, lineSegment.point2),
            v3 = new Vector(this.owner, this.point1, lineSegment.point1),
            cp1 = v1.crossProduct(v2),
            cp2 = v3.crossProduct(v2),
            cp3 = v3.crossProduct(v1),
            epsilon = this.options_.epsilon;

        if (math.equalTo(cp1, 0, epsilon)) return false;
        let t1 = cp3 / cp1,
            t2 = cp2 / cp1;
        if (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) {
            return Point.fromVector(this.owner, new Vector(this.owner, this.point1).add(v1.scalarMultiply(t2)));
        }
        return false;
    }

    isIntersectedWithLineSegment(lineSegment: LineSegment) {
        return Boolean(this._isIntersectedWithLineSegment(lineSegment));
    }
    getIntersectionPointWithLineSegment(lineSegment: LineSegment) {
        let ret = this._isIntersectedWithLineSegment(lineSegment);
        if (ret) return ret;
        return null;
    }

    /**
     * Get the lerping(**lerp** here means **linear interpolation and extrapolation**) point of line segment `this`.
     * @description
     * - When the `weight` is in the interval `[0, 1]`, it is interpolation:
     *      - If "weight=0", return `point1`.
     *      - If "weight=1", return `point2`.
     *      - If "0<weight<1", return a point between `point1` and `point2`.
     * - When the `weight` is in the interval `(-math.Infinity, 0)` and `(1, math.Infinity)`, it is extrapolation:
     *      - If "weight<0", return a point exterior of `point1`.
     *      - If "weight>1", return a point exterior of `point2`.
     * @param {number} weight
     * @returns {Point}
     */
    getLerpingPoint(weight: number): Point {
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = this,
            x = math.lerp(x1, x2, weight),
            y = math.lerp(y1, y2, weight);
        return new Point(this.owner, x, y);
    }
    /**
     * Get the lerping ratio `weight` lerped by line `line `.
     * @description
     * - When `line` is parallel to `this`, return `NaN`.
     * - When `line` is intersected with `this`, return a number in the interval `[0, 1]`:
     *      - If `line` passes through `point1`, return 0.
     *      - If `line` passes through `point2`, return 1.
     * - When `line` is not parallel to and not intersected with `this`, return a number in the interval `(-math.Infinity, 0)` and `(1, math.Infinity)`.
     * @param {Line} line
     * @returns {number}
     */
    getLerpingRatioByLine(line: Line): number {
        const epsilon = this.options_.epsilon;
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = this;
        const [a, b, c] = line.getGeneralEquationParameters(),
            d1 = a * x1 + b * y1 + c,
            d2 = a * x2 + b * y2 + c;
        if (math.equalTo(d1, d2, epsilon)) return NaN;
        return d1 / (d1 - d2);
    }
    /**
     * Get the division point of line segment `this`.
     * @description
     * - When `lambda` is equal to -1, return `null`.
     * - When `lambda` is in the interval `[0, math.Infinity]`, return a internal division point, a point between `point1` and `point2`:
     *      - If "lambda=0", return `point1`.
     *      - If "lambda=math.Infinity", return `point2`.
     * - When `lambda` is in the interval `(-math.Infinity, -1)` and `(-1, 0)`, return a external division point:
     *      - If "-1<lambda<0", return a point exterior of `point1`.
     *      - If "lambda<-1", return a point exterior of `point2`.
     *
     * @param {number} lambda
     * @returns {Point}
     */
    getDivisionPoint(lambda: number): Point | null {
        if (lambda === -1) return null;
        if (math.abs(lambda) === math.Infinity) return this.point2.clone();
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = this,
            x = (x1 + lambda * x2) / (1 + lambda),
            y = (y1 + lambda * y2) / (1 + lambda);
        return new Point(this.owner, x, y);
    }
    /**
     * Get the division ratio `lambda` divided by line `line `.
     * @description
     * - When `line` is parallel to `this`, return `NaN`.
     * - When `line` is intersected with `this`, return a number in the interval `[0, Infinity]`:
     *      - If `line` passes through `point1`, return 0.
     *      - If `line` passes through `point2`, return `Infinity`.
     * - When `line` is not parallel to and not intersected with `this`, return a number in the interval `(-math.Infinity, -1)` and `(-1, 0)`.
     * @param {Line} line
     * @returns {number}
     */
    getDivisionRatioByLine(line: Line): number {
        if (line.isParallelToLineSegment(this)) return NaN;
        if (line.isPointOn(this.point2Coordinates)) return Infinity;
        let {
                point1: { x: x1, y: y1 },
                point2: { x: x2, y: y2 }
            } = this,
            [a, b, c] = line.getGeneralEquationParameters();
        return -(a * x1 + b * y1 + c) / (a * x2 + b * y2 + c);
    }
    toLine() {
        return Line.fromTwoPoints.bind(this)(this.point1Coordinates, this.point2Coordinates)!;
    }

    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.");
    }
    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        g.moveTo(...c1);
        g.lineTo(...c2);
        return g;
    }
    clone() {
        return new LineSegment(this.owner, this.point1X, this.point1Y, this.point2X, this.point2Y);
    }
    copyFrom(shape: LineSegment | null) {
        if (shape === null) shape = new LineSegment(this.owner);
        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        this._setPoint2X(shape._point2X);
        this._setPoint2Y(shape._point2Y);
        return this;
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tpoint1X: ${this.point1X}`,
            `\tpoint1Y: ${this.point1Y}`,
            `\tpoint2X: ${this.point2X}`,
            `\tpoint2Y: ${this.point2Y}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n");
    }
    toArray() {
        return [this.point1X, this.point1Y, this.point2X, this.point2Y];
    }
    toObject() {
        return { point1X: this.point1X, point1Y: this.point1Y, point2X: this.point2X, point2Y: this.point2Y };
    }
}

validAndWithSameOwner(LineSegment);
/**
 *
 * @category BaseObject
 */
export default LineSegment;

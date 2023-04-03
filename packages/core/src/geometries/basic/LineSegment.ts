import { Assert, Box, Coordinates, Maths, Matrix2, Polynomial, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { eps } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import { validGeometry } from "../../misc/decor-geometry";
import { getCoordinates } from "../../misc/point-like";
import type Transformation from "../../transformation";
import type { FiniteOpenGeometry, ViewportDescriptor } from "../../types";
import Path from "../general/Path";
import Line from "./Line";
import Point from "./Point";
import Vector from "./Vector";

@validGeometry
export default class LineSegment extends Geometry implements FiniteOpenGeometry {
    private _point1X = NaN;
    private _point1Y = NaN;
    private _point2X = NaN;
    private _point2Y = NaN;

    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number);
    constructor(point1Coordinates: [number, number], point2Coordinates: [number, number]);
    constructor(point1: Point, point2: Point);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { point1X: a0, point1Y: a1, point2X: a2, point2Y: a3 });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { point1Coordinates: a0, point2Coordinates: a1 });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { point1: a0, point2: a1 });
        }
    }

    static override events = {
        point1XChanged: "point1X" as const,
        point1YChanged: "point1Y" as const,
        point2XChanged: "point2X" as const,
        point2YChanged: "point2Y" as const,
        angleChanged: "angle" as const
    };

    private _setPoint1X(value: number) {
        if (!Utility.is(this._point1X, value)) {
            this.trigger_(new EventSourceObject(this, LineSegment.events.point1XChanged));
            this.trigger_(new EventSourceObject(this, LineSegment.events.angleChanged));
        }
        this._point1X = value;
    }
    private _setPoint1Y(value: number) {
        if (!Utility.is(this._point1Y, value)) {
            this.trigger_(new EventSourceObject(this, LineSegment.events.point1YChanged));
            this.trigger_(new EventSourceObject(this, LineSegment.events.angleChanged));
        }
        this._point1Y = value;
    }
    private _setPoint2X(value: number) {
        if (!Utility.is(this._point2X, value)) {
            this.trigger_(new EventSourceObject(this, LineSegment.events.point2XChanged));
            this.trigger_(new EventSourceObject(this, LineSegment.events.angleChanged));
        }
        this._point2X = value;
    }
    private _setPoint2Y(value: number) {
        if (!Utility.is(this._point2Y, value)) {
            this.trigger_(new EventSourceObject(this, LineSegment.events.point2YChanged));
            this.trigger_(new EventSourceObject(this, LineSegment.events.angleChanged));
        }
        this._point2Y = value;
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
    get angle() {
        return Vector2.angle(Vector2.from(this.point1Coordinates, this.point2Coordinates));
    }
    set angle(value) {
        Assert.isRealNumber(value, "angle");
        const nc2 = Vector2.add(this.point1Coordinates, Vector2.from2(value, this.getLength()));
        this._setPoint2X(Coordinates.x(nc2));
        this._setPoint2Y(Coordinates.y(nc2));
    }

    @stated
    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._point1X) &&
            !Number.isNaN(this._point1Y) &&
            !Number.isNaN(this._point2X) &&
            !Number.isNaN(this._point2Y)
        );
    }

    degenerate(check: false): Point | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;

        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const c12 = Coordinates.equalTo(c1, c2, eps.epsilon);

        if (check) return c12;
        return c12 ? new Point(c1) : this;
    }

    move(deltaX: number, deltaY: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, [deltaX, deltaY]);
        this.point2Coordinates = Vector2.add(this.point2Coordinates, [deltaX, deltaY]);
        return this;
    }
    static fromPointAndAngleAndLength(point: [number, number] | Point, angle: number, length: number) {
        if (Maths.equalTo(length, 0, eps.epsilon)) return null;
        const c1 = getCoordinates(point, "point");
        const c2 = Vector2.add(c1, Vector2.from2(angle, length));
        return new LineSegment(c1, c2);
    }
    /**
     * Whether point `point` is on line segment `this`.
     * @param point
     */
    isPointOn(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const v12 = Vector2.from(c1, c2);
        const v10 = Vector2.from(c1, c);
        const cp = Vector2.cross(v10, v12);
        const dp = Vector2.dot(v10, v12);
        const sm = Vector2.squaredMagnitude(v12);
        return Maths.equalTo(cp, 0, eps.vectorEpsilon) && !Maths.lessThan(dp, 0, eps.vectorEpsilon) && !Maths.greaterThan(dp, sm, eps.vectorEpsilon);
    }
    reverse() {
        [this.point1Coordinates, this.point2Coordinates] = [this.point2Coordinates, this.point1Coordinates];
        return this;
    }
    /**
     * Get the length of line segment `this`.
     */
    getLength() {
        return Vector2.magnitude(Vector2.from(this.point1Coordinates, this.point2Coordinates));
    }
    /**
     * Returns two univariate polynomial of `time` for `x` coordinate and `y` coordinate.
     */
    @stated
    getPolynomial(): [polynomialForX: [number, number], polynomialForY: [number, number]] {
        const {
            point1Coordinates: [x0, y0],
            point2Coordinates: [x1, y1]
        } = this;
        const m = [-1, 1, 1, 0] as [number, number, number, number];
        const polyX = Matrix2.dotVector2(m, [x0, x1]);
        const polyY = Matrix2.dotVector2(m, [y0, y1]);
        return [polyX, polyY] as [[number, number], [number, number]];
    }
    /**
     * Returns a function as parametric equation.
     */
    @stated
    getParametricEquation() {
        const [polyX, polyY] = this.getPolynomial();
        return function (t: number) {
            const x = Polynomial.evaluate(polyX, t);
            const y = Polynomial.evaluate(polyY, t);
            return [x, y] as [number, number];
        };
    }
    /**
     * Returns the coefficients of the implicit function $ax+by+c=0$.
     */
    @stated
    getImplicitFunctionCoefs(): [a: number, b: number, c: number] {
        const {
            point1Coordinates: [x0, y0],
            point2Coordinates: [x1, y1]
        } = this;
        const a = y1 - y0;
        const b = x0 - x1;
        const c = x0 * (y0 - y1) + y0 * (x1 - x0);
        return [a, b, c];
    }

    /**
     * Get the closest point on line segment `this` from point `point`.
     * @param point
     */
    getClosestPointFromPoint(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const [polyX, polyY] = this.getPolynomial();
        const fn = this.getParametricEquation();
        let polyXM = Polynomial.add(polyX, [-x]);
        let polyYM = Polynomial.add(polyY, [-y]);
        polyXM = Polynomial.multiply(polyXM, polyXM);
        polyYM = Polynomial.multiply(polyYM, polyYM);

        const polySquaredDistance = Polynomial.add(polyXM, polyYM);
        const polyD1 = Polynomial.derivative(polySquaredDistance);
        // Let the derivative equal 0, find the extreme value.
        const ts = Polynomial.roots(polyD1).filter((r): r is number => Type.isNumber(r) && r > 0 && r < 1);
        // Take endpoints into account.
        ts.push(0, 1);
        let minT = Infinity;
        let minSd = Infinity;
        ts.forEach(t => {
            const sd = Polynomial.evaluate(polySquaredDistance, t);
            if (sd < minSd) {
                minSd = sd;
                minT = t;
            }
        });
        return [new Point(fn(minT)), minSd] as [point: Point, distanceSquare: number];
    }
    /**
     * Get the middle point of line segment `this`.
     */
    getMiddlePoint() {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = this;
        return new Point((x1 + x2) / 2, (y1 + y2) / 2);
    }
    /**
     * Get the perpendicularly bisecting line of line segment `this`.
     */
    getPerpendicularlyBisectingLine() {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = this;
        return new Line(this.getMiddlePoint(), (x1 - x2) / (y1 - y2));
    }
    /**
     * Whether line segment `this` is perpendicular to line segment `lineSegment`.
     * @param lineSegment
     */
    isPerpendicularToLineSegment(lineSegment: LineSegment): boolean {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const { point1Coordinates: c3, point2Coordinates: c4 } = lineSegment;
        const v12 = Vector2.from(c1, c2);
        const v34 = Vector2.from(c3, c4);
        const dp = Vector2.dot(v12, v34);
        return Maths.equalTo(dp, 0, eps.vectorEpsilon);
    }
    /**
     * Whether line segment `this` is parallel to line segment `lineSegment`.
     * @param lineSegment
     */
    isParallelToLineSegment(lineSegment: LineSegment): boolean {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const { point1Coordinates: c3, point2Coordinates: c4 } = lineSegment;
        const v12 = Vector2.from(c1, c2);
        const v34 = Vector2.from(c3, c4);
        const cp = Vector2.cross(v12, v34);
        return Maths.equalTo(cp, 0, eps.vectorEpsilon);
    }
    /**
     * Whether line segment `this` is collinear with line segment `lineSegment`.
     * @param lineSegment
     */
    isCollinearWithLineSegment(lineSegment: LineSegment) {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const { point1Coordinates: c3, point2Coordinates: c4 } = lineSegment;
        const v12 = Vector2.from(c1, c2);
        const v34 = Vector2.from(c3, c4);
        const v32 = Vector2.from(c3, c2);
        const cp1 = Vector2.cross(v12, v34);
        const cp2 = Vector2.cross(v32, v34);
        return Maths.equalTo(cp1, 0, eps.vectorEpsilon) && Maths.equalTo(cp2, 0, eps.vectorEpsilon);
    }

    splitAtTimes(times: number[]) {
        Assert.condition(
            times.every(t => Maths.greaterThan(t, 0, eps.timeEpsilon) && Maths.lessThan(t, 1, eps.timeEpsilon)),
            "[G]The `times` should all be a number between 0(not including) and 1(not including)."
        );
        const ret: LineSegment[] = [];
        times = Utility.sortBy(
            Utility.uniqWith(times, (a, b) => Maths.equalTo(a, b, eps.timeEpsilon)),
            [n => n]
        );
        [0, ...times, 1].forEach((_, index, arr) => {
            if (index !== arr.length - 1) {
                ret.push(this.portionOfExtend(arr[index], arr[index + 1]));
            }
        });
        return ret;
    }

    splitAtTime(t: number) {
        Assert.condition(Maths.between(t, 0, 1, true, true, eps.timeEpsilon), "[G]The `t` should be a number between 0(not including) and 1(not including).");
        return [this.portionOfExtend(0, t), this.portionOfExtend(t, 1)] as [LineSegment, LineSegment];
    }

    portionOf(t1: number, t2: number) {
        Assert.condition(Maths.between(t1, 0, 1, false, false, eps.timeEpsilon), "[G]The `t1` should be a number between 0(including) and 1(including).");
        Assert.condition(Maths.between(t2, 0, 1, false, false, eps.timeEpsilon), "[G]The `t2` should be a number between 0(including) and 1(including).");
        Assert.condition(!Maths.equalTo(t1, t2, eps.timeEpsilon), "[G]The `t1` and `t2` should not be equal.");
        return this.portionOfExtend(t1, t2);
    }

    portionOfExtend(t1: number, t2: number) {
        Assert.isRealNumber(t1, "t1");
        Assert.isRealNumber(t2, "t2");
        Assert.condition(!Maths.equalTo(t1, t2, eps.timeEpsilon), "[G]The `t1` and `t2` should not be equal.");

        if (t1 > t2) [t1, t2] = [t2, t1];
        const [polyX, polyY] = this.getPolynomial();
        const xs = [Polynomial.evaluate(polyX, t1), Polynomial.evaluate(polyX, t2)];
        const ys = [Polynomial.evaluate(polyY, t1), Polynomial.evaluate(polyY, t2)];
        return new LineSegment(xs[0], ys[0], xs[1], ys[1]);
    }

    @stated
    getBoundingBox() {
        return Box.from(this.point1Coordinates, this.point2Coordinates);
    }

    private _clampTime(t: number, p: string) {
        Assert.isRealNumber(t, p);
        if (t < 0 || t > 1) {
            console.warn(`[G]The \`${p}\` with value \`${t}\` is not between \`0\`(including) and \`1\`(including). It will be clamped.`);
        }
        return Maths.clamp(t, 0, 1);
    }

    @stated
    private _d1() {
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD1, polyYD1] = [Polynomial.derivative(polyX, 1), Polynomial.derivative(polyY, 1)];
        return function (t: number) {
            return [Polynomial.evaluate(polyXD1, t), Polynomial.evaluate(polyYD1, t)] as [number, number];
        };
    }

    /**
     * Get the tangent vector of line segment `this` at time `t`.
     * @param t
     * @param normalized
     */
    getTangentVectorAtTime(t: number, normalized = false) {
        t = this._clampTime(t, "t");
        const [d1x, d1y] = this._d1()(t);
        const tv = [d1x, d1y] as [number, number];
        const c = this.getParametricEquation()(t);
        return normalized ? new Vector(c, Vector2.normalize(tv)) : new Vector(c, tv);
    }
    /**
     * Get the normal vector of line segment `this` at time `t`.
     * @param t
     * @param normalized
     */
    getNormalVectorAtTime(t: number, normalized = false) {
        t = this._clampTime(t, "t");
        const [d1x, d1y] = this._d1()(t);
        const nv = [-d1y, d1x] as [number, number];
        const c = this.getParametricEquation()(t);
        return normalized ? new Vector(c, Vector2.normalize(nv)) : new Vector(c, nv);
    }
    /**
     * Get the curvature of line segment `this` at time `t`.
     * @note
     * This method always returns 0.
     * @param t
     */
    getCurvatureAtTime(t: number) {
        t = this._clampTime(t, "t");
        return 0;
    }
    /**
     * Get the osculating circle of line segment `this` at time `t`.
     * @note
     * This method always returns null.
     * @param t
     */
    getOsculatingCircleAtTime(t: number) {
        t = this._clampTime(t, "t");
        return null;
    }

    // #region Time and point
    /**
     * Get the point at time `t` of line segment `this`.
     * @note
     * Only interpolation is supported to keep the returned point on the line segment `this`, so `t` must be in $[0,1]$.
     * If both interpolation and extrapolation are required at the same time, please use `getPointAtTimeExtend` method,
     * which has no restrictions on the value of `t`, nor does it guarantee that the returned point is on line segment `this`.
     * @param t
     */
    getPointAtTime(t: number) {
        t = this._clampTime(t, "t");
        const [x, y] = this.getParametricEquation()(t);
        return new Point(x, y);
    }
    /**
     * Get the point at extended time `t` of line segment `this`.
     * @description
     * - If `t` is in $[0,1]$, a point on the interior of `point1`(including) and `point2`(including) will be returned.
     * - If `t` is in $(-\infty,0)$, a point on the exterior of `point1` will be returned.
     * - If `t` is in $(1,\infty)$, a point on the exterior of `point2` will be returned.
     * @note
     * This method performs both interpolation and extrapolation at the same time,
     * so the returned point is not guaranteed to be on the line segment `this`.
     * @param t
     */
    getPointAtTimeExtend(t: number) {
        Assert.isExtendedRealNumber(t, "t");
        const [x, y] = this.getParametricEquation()(t);
        return new Point(x, y);
    }
    /**
     * Get the time of point `point` on line segment `this`.
     * @description
     * - If `point` is not on line segment `this`, `NaN` will be returned.
     * - If `point` is on line segment `this`, a number in $[0,1]$ will be returned.
     * @param point
     */
    getTimeOfPoint(point: [number, number] | Point) {
        const t = this.getTimeOfPointExtend(point);
        if (Maths.between(t, 0, 1, false, false, eps.timeEpsilon)) return Maths.clamp(t, 0, 1);
        return NaN;
    }
    /**
     * Get the time of point `point` on the underlying line of line segment `this`.
     * @description
     * - If `point` is not on the underlying line, `NaN` will be returned.
     * - If `point` is on the interior of `point1`(including) and `point2`(including),a number in $[0,1]$ will be returned.
     * - If `point` is on the exterior of `point1`, a number in $(-\infty,0)$ will be returned.
     * - If `point` is on the exterior of `point2`, a number in $(1,\infty)$ will be returned.
     * @param point
     */
    getTimeOfPointExtend(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const v10 = Vector2.from(c1, [x, y]);
        const v12 = Vector2.from(c1, c2);
        const cp = Vector2.cross(v10, v12);
        if (!Maths.equalTo(cp, 0, eps.vectorEpsilon)) {
            return NaN;
        }
        const dp = Vector2.dot(v10, v12);
        const sign = dp < 0 ? -1 : 1;
        return (sign * Vector2.magnitude(v10)) / Vector2.magnitude(v12);
    }
    // #endregion

    toLine() {
        return Line.fromTwoPoints(this.point1Coordinates, this.point2Coordinates)!;
    }
    toVector() {
        return Vector.fromTwoPoints(this.point1Coordinates, this.point2Coordinates);
    }
    toPath(closed = false) {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const path = new Path();
        path.appendCommand(Path.moveTo(c1));
        path.appendCommand(Path.lineTo(c2));
        path.closed = closed;
        return path;
    }
    apply(transformation: Transformation) {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        const nc1 = transformation.transformCoordinates(c1);
        const nc2 = transformation.transformCoordinates(c2);
        return new LineSegment(nc1, nc2);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>).getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        gg.moveTo(...c1);
        gg.lineTo(...c2);
        return g;
    }
    clone() {
        return new LineSegment(this.point1X, this.point1Y, this.point2X, this.point2Y);
    }
    copyFrom(shape: LineSegment | null) {
        if (shape === null) shape = new LineSegment();
        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        this._setPoint2X(shape._point2X);
        this._setPoint2Y(shape._point2Y);
        return this;
    }
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            point1X: this._point1X,
            point1Y: this._point1Y,
            point2X: this._point2X,
            point2Y: this._point2Y
        };
    }
}

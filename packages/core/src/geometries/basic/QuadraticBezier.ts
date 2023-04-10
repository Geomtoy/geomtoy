import { Assert, Coordinates, Float, Maths, Matrix3, Polynomial, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { eps } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import { bezierLength } from "../../misc/bezier-length";
import { validGeometry } from "../../misc/decor-geometry";
import { stated, statedWithBoolean } from "../../misc/decor-stated";
import { getCoordinates } from "../../misc/point-like";
import type Transformation from "../../transformation";
import type { FiniteOpenGeometry, PathCommand, ViewportDescriptor } from "../../types";
import Path from "../general/Path";
import Circle from "./Circle";
import LineSegment from "./LineSegment";
import Point from "./Point";
import Vector from "./Vector";

@validGeometry
export default class QuadraticBezier extends Geometry implements FiniteOpenGeometry {
    private _point1X = NaN;
    private _point1Y = NaN;
    private _point2X = NaN;
    private _point2Y = NaN;
    private _controlPointX = NaN;
    private _controlPointY = NaN;

    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number, controlPointX: number, controlPointY: number);
    constructor(point1Coordinates: [number, number], point2Coordinates: [number, number], controlPointCoordinates: [number, number]);
    constructor(point1: Point, point2: Point, controlPoint: Point);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { point1X: a0, point1Y: a1, point2X: a2, point2Y: a3, controlPointX: a4, controlPointY: a5 });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { point1Coordinates: a0, point2Coordinates: a1, controlPointCoordinates: a2 });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { point1: a0, point2: a1, controlPoint: a2 });
        }
        this.initState_();
    }

    static override events = {
        point1XChanged: "point1X" as const,
        point1YChanged: "point1Y" as const,
        point2XChanged: "point2X" as const,
        point2YChanged: "point2Y" as const,
        controlPointXChanged: "controlPointX" as const,
        controlPointYChanged: "controlPointY" as const
    };

    private _setPoint1X(value: number) {
        if (Utility.is(this._point1X, value)) return;
        this._point1X = value;
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point1XChanged));
    }
    private _setPoint1Y(value: number) {
        if (Utility.is(this._point1Y, value)) return;
        this._point1Y = value;
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point1YChanged));
    }
    private _setPoint2X(value: number) {
        if (Utility.is(this._point2X, value)) return;
        this._point2X = value;
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point2XChanged));
    }
    private _setPoint2Y(value: number) {
        if (Utility.is(this._point2Y, value)) return;
        this._point2Y = value;
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point2YChanged));
    }
    private _setControlPointX(value: number) {
        if (Utility.is(this._controlPointX, value)) return;
        this._controlPointX = value;
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.controlPointXChanged));
    }
    private _setControlPointY(value: number) {
        if (Utility.is(this._controlPointY, value)) return;
        this._controlPointY = value;
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.controlPointYChanged));
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
    get controlPointX() {
        return this._controlPointX;
    }
    set controlPointX(value) {
        Assert.isRealNumber(value, "controlPointX");
        this._setControlPointX(value);
    }
    get controlPointY() {
        return this._controlPointY;
    }
    set controlPointY(value) {
        Assert.isRealNumber(value, "controlPointY");
        this._setControlPointY(value);
    }
    get controlPointCoordinates() {
        return [this._controlPointX, this._controlPointY] as [number, number];
    }
    set controlPointCoordinates(value) {
        Assert.isCoordinates(value, "controlPointCoordinates");
        this._setControlPointX(Coordinates.x(value));
        this._setControlPointY(Coordinates.y(value));
    }
    get controlPoint() {
        return new Point(this._controlPointX, this._controlPointY);
    }
    set controlPoint(value) {
        this._setControlPointX(value.x);
        this._setControlPointY(value.y);
    }

    @stated
    initialized() {
        return (
            !Number.isNaN(this._point1X) &&
            !Number.isNaN(this._point1Y) &&
            !Number.isNaN(this._point2X) &&
            !Number.isNaN(this._point2Y) &&
            !Number.isNaN(this._controlPointX) &&
            !Number.isNaN(this._controlPointY)
        );
    }

    degenerate(check: false): Point | LineSegment | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;

        const {
            point1Coordinates: [x0, y0],
            controlPointCoordinates: [x1, y1],
            point2Coordinates: [x2, y2]
        } = this;
        const m = [1, -2, 1, -2, 2, 0, 1, 0, 0] as Parameters<typeof Matrix3.dotVector3>[0];
        const [cx2, cx1] = Matrix3.dotVector3(m, [x0, x1, x2]);
        const [cy2, cy1] = Matrix3.dotVector3(m, [y0, y1, y2]);
        const d2 = Float.equalTo(cx2, 0, Float.MACHINE_EPSILON) && Float.equalTo(cy2, 0, Float.MACHINE_EPSILON);
        const d1 = Float.equalTo(cx1, 0, Float.MACHINE_EPSILON) && Float.equalTo(cy1, 0, Float.MACHINE_EPSILON);

        if (check) return d2;

        if (d2) {
            // degenerate to linear
            if (d1) {
                // degenerate to point, no move.
                return new Point([x0, y0]);
            }
            return new LineSegment([x0, y0], [x2, y2]);
        }
        return this;
    }

    /**
     * Returns an array of `[Point, time]` indicate where and at what time, quadratic bezier curve `this` has max/min x/y coordinate value.
     */
    @stated
    extrema() {
        const [polyX, polyY] = this.getPolynomial();
        // prettier-ignore
        const [polyXD, polyYD] = [
            Polynomial.standardize(Polynomial.derivative(polyX)), 
            Polynomial.standardize(Polynomial.derivative(polyY))
        ];
        // prettier-ignore
        let tRoots = [
            ...(!Polynomial.isConstant(polyXD) ? Polynomial.roots(polyXD, eps.complexEpsilon) : []),
            ...(!Polynomial.isConstant(polyYD) ? Polynomial.roots(polyYD, eps.complexEpsilon) : [])
        ].filter((t) : t is number => Type.isNumber(t) &&  Float.between(t, 0, 1, false, false, eps.timeEpsilon) );
        tRoots = Utility.uniqWith(tRoots, (a, b) => Float.equalTo(a, b, eps.timeEpsilon));

        return tRoots.map(t => [new Point(this.getParametricEquation()(t)), t] as [point: Point, time: number]);
    }

    move(deltaX: number, deltaY: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, [deltaX, deltaY]);
        this.point2Coordinates = Vector2.add(this.point2Coordinates, [deltaX, deltaY]);
        this.controlPointCoordinates = Vector2.add(this.controlPointCoordinates, [deltaX, deltaY]);
        return this;
    }
    /**
     * Returns a quadratic bezier based on provided three points and time `t`.
     * @param point1
     * @param point2
     * @param point3
     * @param t
     */
    static fromThreePointsAndTime(point1: [number, number] | Point, point2: [number, number] | Point, point3: [number, number] | Point, t: number) {
        // todo if t can be out of the interval [0, 1]

        if (Float.equalTo((1 - t) * t, 0, eps.timeEpsilon)) {
            return null;
        }

        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        const c3 = getCoordinates(point3, "point3");
        const ct = Vector2.subtract(c2, Vector2.add(Vector2.scalarMultiply(c1, (1 - t) ** 2), Vector2.scalarMultiply(c3, t ** 2)));
        const cpc = Vector2.scalarMultiply(ct, 1 / (2 * (1 - t) * t));
        return new QuadraticBezier(c1, c3, cpc);
    }

    reverse() {
        // prettier-ignore
        [
            [this._point1X, this._point1Y],
            [this._point2X, this._point2Y]
        ] = [
            [this._point2X, this._point2Y],
            [this._point1X, this._point1Y]
        ];
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point1XChanged));
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point1YChanged));
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point2XChanged));
        this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point2YChanged));
        return this;
    }
    /**
     * Whether point `point` is on quadratic bezier `this`.
     * @param point
     */
    isPointOn(point: [number, number] | Point) {
        return !Number.isNaN(this.getTimeOfPoint(point));
    }
    /**
     * Get the length of quadratic bezier `this`.
     */
    getLength() {
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD, polyYD] = [Polynomial.derivative(polyX), Polynomial.derivative(polyY)];
        return bezierLength(polyXD, polyYD);
    }

    @stated
    getBoundingBox() {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        const extrema = this.extrema().map(([p]) => p);
        // Take endpoints into account
        extrema.concat([this.point1, this.point2]).forEach(point => {
            const { x, y } = point;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });
        return [minX, minY, maxX - minX, maxY - minY] as [number, number, number, number];
    }
    /**
     * Returns two univariate polynomial of `time` for `x` coordinate and `y` coordinate.
     */
    @stated
    getPolynomial(): [polynomialForX: [number, number, number], polynomialForY: [number, number, number]] {
        const {
            point1Coordinates: [x0, y0],
            controlPointCoordinates: [x1, y1],
            point2Coordinates: [x2, y2]
        } = this;
        const m = [1, -2, 1, -2, 2, 0, 1, 0, 0] as [number, number, number, number, number, number, number, number, number];
        const polyX = Matrix3.dotVector3(m, [x0, x1, x2]);
        const polyY = Matrix3.dotVector3(m, [y0, y1, y2]);
        return [polyX, polyY] as [[number, number, number], [number, number, number]];
    }
    /**
     * Returns a function as parametric equation.
     */
    getParametricEquation() {
        const [polyX, polyY] = this.getPolynomial();
        return function (t: number) {
            const x = Polynomial.evaluate(polyX, t);
            const y = Polynomial.evaluate(polyY, t);
            return [x, y] as [number, number];
        };
    }

    isDoubleLine() {
        // This means $ax^2+bxy+cy^2+dx+ey+f=0$ can write as $(lx+my+n)^2=0$
        const coefs = this.getImplicitFunctionCoefs();
        if (coefs.length !== 6) return false;
        const [a, b, c, d, e, f] = coefs;
        // $$
        // \begin{align*}
        //     a&=l^2 \\
        //     b&=2lm  \\
        //     c&=m^2 \\
        //     d&=2ln \\
        //     e&=2mn \\
        //     f&=n^2
        // \end{align*}
        // $$
        const l = Maths.sqrt(a);
        const m = Maths.sqrt(c);
        const n = Maths.sqrt(f);
        // prettier-ignore
        return (
            Float.equalTo(b, 2 * l * m, eps.coefficientEpsilon) &&
            Float.equalTo(d, 2 * l * n, eps.coefficientEpsilon) &&
            Float.equalTo(e, 2 * m * n, eps.coefficientEpsilon)
        );
    }

    /**
     * Returns the coefficients of the implicit function $ax^2+bxy+cy^2+dx+ey+f=0$.
     */
    getImplicitFunctionCoefs(): [a: number, b: number, c: number, d: number, e: number, f: number] {
        const [[cx2, cx1, cx0], [cy2, cy1, cy0]] = this.getPolynomial();

        const [cx02, cy02] = [cx0 ** 2, cy0 ** 2];
        const [cx12, cy12] = [cx1 ** 2, cy1 ** 2];
        const [cx22, cy22] = [cx2 ** 2, cy2 ** 2];

        // $ax^2+bxy+cy^2+dx+ey+f=0$
        const a = cy22;
        const b = -2 * cx2 * cy2;
        const c = cx22;
        // prettier-ignore
        const d = 
            -cx2 * cy12 + 
            2 * cx2 * cy0 * cy2 + 
            cx1 * cy1 * cy2 - 
            2 * cx0 * cy22;
        // prettier-ignore
        const e = 
            -2 * cx22 * cy0 + 
            cx1 * cx2 * cy1 - 
            cx12 * cy2 + 
            2 * cx0 * cx2 * cy2;
        // prettier-ignore
        const f = 
            cx22 * cy02 - 
            cx1 * cx2 * cy0 * cy1 + 
            cx0 * cx2 * cy12 + 
            cx12 * cy0 * cy2 - 
            2 * cx0 * cx2 * cy0 * cy2 - 
            cx0 * cx1 * cy1 * cy2 + 
            cx02 * cy22;

        return [a, b, c, d, e, f] as [number, number, number, number, number, number];
    }
    /**
     * Get the closest point on quadratic bezier `this` from point `point`.
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
        let minT = NaN;
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

    private _clampTime(t: number, p: string) {
        Assert.isRealNumber(t, p);
        if (t < 0 || t > 1) {
            console.warn(`[G]The \`${p}\` with value \`${t}\` is not between \`0\`(including) and \`1\`(including). It will be clamped.`);
        }
        return Maths.clamp(t, 0, 1);
    }
    // #region Time and point
    /**
     * Get the point at time `t` of quadratic bezier `this`.
     * @note
     * Only interpolation is supported to keep the returned point on the quadratic bezier `this`, so `t` must be in $[0,1]$.
     * If both interpolation and extrapolation are required at the same time, please use `getPointAtTimeExtend` method,
     * which has no restrictions on the value of `t`, nor does it guarantee that the returned point is on quadratic bezier `this`.
     * @param t
     */
    getPointAtTime(t: number) {
        t = this._clampTime(t, "t");
        const [x, y] = this.getParametricEquation()(t);
        return new Point(x, y);
    }
    /**
     * Get the point at extended time `t` of quadratic bezier `this`.
     * @description
     * - If `t` is in $[0,1]$, a point on the interior of `point1`(including) and `point2`(including) will be returned.
     * - If `t` is in $(-\infty,0)$, a point on the exterior of `point1` will be returned.
     * - If `t` is in $(1,\infty)$, a point on the exterior of `point2` will be returned.
     * @note
     * This method performs both interpolation and extrapolation at the same time,
     * so the returned point is not guaranteed to be on the quadratic bezier `this`.
     * @param t
     */
    getPointAtTimeExtend(t: number) {
        Assert.isRealNumber(t, "t");
        const [x, y] = this.getParametricEquation()(t);
        return new Point(x, y);
    }
    /**
     * Returns the time of a point on quadratic bezier `this`.
     * @note
     * - If `point` is not on quadratic bezier `this`, `NaN` will be returned.
     * - If `point` is on quadratic bezier `this`, a number in $[0,1]$ will be returned.
     * @param point
     */
    getTimeOfPoint(point: [number, number] | Point) {
        const t = this.getTimeOfPointExtend(point);
        if (Float.between(t, 0, 1, false, false, eps.timeEpsilon)) return Maths.clamp(t, 0, 1);
        return NaN;
    }

    getTimesOfPointExtend(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const [polyX, polyY] = this.getPolynomial();
        const xPoly = Polynomial.standardize(Polynomial.add(polyX, [-x]));
        const yPoly = Polynomial.standardize(Polynomial.add(polyY, [-y]));

        let xRoots: number[] | undefined = undefined;
        let yRoots: number[] | undefined = undefined;

        if (Polynomial.isConstant(xPoly)) {
            if (!Float.equalTo(Polynomial.coef(xPoly, 0), 0, eps.coefficientEpsilon)) return [];
        } else {
            xRoots = Polynomial.roots(xPoly, eps.complexEpsilon).filter(Type.isNumber);
            if (xRoots.length === 0) return [];
        }

        if (Polynomial.isConstant(yPoly)) {
            if (!Float.equalTo(Polynomial.coef(yPoly, 0), 0, eps.coefficientEpsilon)) return [];
        } else {
            yRoots = Polynomial.roots(yPoly, eps.complexEpsilon).filter(Type.isNumber);
            if (yRoots.length === 0) return [];
        }

        if (xRoots !== undefined && yRoots === undefined) {
            return Utility.uniqWith(xRoots, (a, b) => Float.equalTo(a, b, eps.timeEpsilon));
        }
        if (xRoots === undefined && yRoots !== undefined) {
            return Utility.uniqWith(yRoots, (a, b) => Float.equalTo(a, b, eps.timeEpsilon));
        }
        if (xRoots !== undefined && yRoots !== undefined) {
            const roots: number[] = [];
            for (let xr of xRoots) {
                for (let yr of yRoots) {
                    if (Float.equalTo(xr, yr, eps.timeEpsilon)) {
                        roots.push(Maths.avg(xr, yr));
                    }
                }
            }
            return Utility.uniqWith(roots, (a, b) => Float.equalTo(a, b, eps.timeEpsilon));
        }
        // now xRootsM === undefined && yRootsM === undefined
        return [];
    }
    /**
     * Get the time of point `point` on the underlying curve of quadratic bezier `this`.
     * @description
     * - If `point` is not on the underlying curve, `NaN` will be returned.
     * - If `point` is on the interior of `point1`(including) and `point2`(including),a number in $[0,1]$ will be returned.
     * - If `point` is on the exterior of `point1`, a number in $(-\infty,0)$ will be returned.
     * - If `point` is on the exterior of `point2`, a number in $(1,\infty)$ will be returned.
     * @note
     * If there are multiple times fit this point, the returned time follow this order of priority:
     * - time in $[0,1]$ will be returned.
     * - the smallest time will be returned.
     * @param point
     */
    getTimeOfPointExtend(point: [number, number] | Point) {
        const times = this.getTimesOfPointExtend(point);
        if (times.length === 0) return NaN;

        Utility.sortWith(times, (a, b) => {
            const d1 = Float.between(a, 0, 1, false, false, eps.timeEpsilon);
            const d2 = Float.between(b, 0, 1, false, false, eps.timeEpsilon);
            if (d1 && !d2) return -1;
            if (!d1 && d2) return 1;
            return a - b;
        });
        return times[0];
    }
    // #endregion

    // #region Tangent and normal

    @stated
    private _d1() {
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD1, polyYD1] = [Polynomial.derivative(polyX, 1), Polynomial.derivative(polyY, 1)];
        return function (t: number) {
            return [Polynomial.evaluate(polyXD1, t), Polynomial.evaluate(polyYD1, t)] as [number, number];
        };
    }
    @stated
    private _d2() {
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD2, polyYD2] = [Polynomial.derivative(polyX, 2), Polynomial.derivative(polyY, 2)];
        return function (t: number) {
            return [Polynomial.evaluate(polyXD2, t), Polynomial.evaluate(polyYD2, t)] as [number, number];
        };
    }
    /**
     * Get the tangent vector of quadratic bezier `this` at time `t`.
     * @param t
     */
    getTangentVectorAtTime(t: number, normalized = false) {
        t = this._clampTime(t, "t");
        const [d1x, d1y] = this._d1()(t);
        const tv = [d1x, d1y] as [number, number];
        const c = this.getParametricEquation()(t);
        return normalized ? new Vector(c, Vector2.normalize(tv)) : new Vector(c, tv);
    }
    /**
     * Get the normal vector of quadratic bezier `this` at time `t`.
     * @param t
     */
    getNormalVectorAtTime(t: number, normalized = false) {
        t = this._clampTime(t, "t");
        const [d1x, d1y] = this._d1()(t);
        const nv = [-d1y, d1x] as [number, number];
        const c = this.getParametricEquation()(t);
        return normalized ? new Vector(c, Vector2.normalize(nv)) : new Vector(c, nv);
    }
    /**
     * Get the curvature of quadratic bezier `this` at time `t`.
     * @note
     * A curvature is signed and it is in $(-\infty,\infty]$.
     * @param t
     */
    getCurvatureAtTime(t: number) {
        t = this._clampTime(t, "t");
        const [d1x, d1y] = this._d1()(t);
        const [d2x, d2y] = this._d2()(t);
        const num = Vector2.cross([d1x, d1y], [d2x, d2y]);
        const den = Maths.pow(d1x ** 2 + d1y ** 2, 3 / 2);
        // When degenerating, at the cusp of quadratic bezier `num` and `den` will be all equal to 0, but 0/0 = NaN, so modify it.
        if (num === 0 && den === 0) return Infinity;
        return num / den;
    }
    /**
     * Get the osculating circle of quadratic bezier `this` at time `t`.
     * @description
     * - If the curvature at `t` is $\infty$, `null` will be returned(the circle degenerates to a point).
     * - If the curvature at `t` is 0, `null` will be returned(the circle degenerates to a line).
     * - Else a circle is returned.
     * @param t
     */
    getOsculatingCircleAtTime(t: number) {
        t = this._clampTime(t, "t");
        const cvt = this.getCurvatureAtTime(t);
        const { coordinates } = this.getPointAtTime(t);

        if (cvt === Infinity) return null; // the circle is a point
        if (cvt === 0) return null; // the circle is a line

        const r = Maths.abs(1 / cvt);
        const angle = this.getNormalVectorAtTime(t).angle;
        const cc = Vector2.add(coordinates, Vector2.from2(angle, r));
        return new Circle(cc, r);
    }
    // #endregion

    // #region Split and portion
    splitAtTime(t: number) {
        t = this._clampTime(t, "t");
        const portion1 = this.portionOfExtend(0, t);
        const portion2 = this.portionOfExtend(t, 1);
        // Do this to get better precision.
        portion1._point1X = this._point1X;
        portion1._point1Y = this._point1Y;
        portion2._point2X = this._point2X;
        portion2._point2Y = this._point2Y;
        return [portion1, portion2] as [QuadraticBezier, QuadraticBezier];
    }
    splitAtTimes(ts: number[]) {
        ts = ts.map(t => this._clampTime(t, "element of ts"));
        const ret: QuadraticBezier[] = [];
        ts = Utility.sortBy(
            Utility.uniqWith(ts, (a, b) => Float.equalTo(a, b, eps.timeEpsilon)),
            [n => n]
        );
        [0, ...ts, 1].forEach((_, index, arr) => {
            if (index !== arr.length - 1) {
                ret.push(this.portionOfExtend(arr[index], arr[index + 1]));
            }
        });
        // Do this to get better precision.
        ret[0]._point1X = this._point1X;
        ret[0]._point1Y = this._point1Y;
        ret[ret.length - 1]._point2X = this._point2X;
        ret[ret.length - 1]._point2Y = this._point2Y;

        for (let i = 1, l = ret.length; i < l; i++) {
            ret[i]._point1X = ret[i - 1]._point2X;
            ret[i]._point1Y = ret[i - 1]._point2Y;
        }
        return ret;
    }
    portionOf(t1: number, t2: number) {
        t1 = this._clampTime(t1, "t1");
        t2 = this._clampTime(t2, "t2");
        return this.portionOfExtend(t1, t2);
    }
    portionOfExtend(t1: number, t2: number) {
        Assert.isRealNumber(t1, "t1");
        Assert.isRealNumber(t2, "t2");
        if (t1 > t2) [t1, t2] = [t2, t1];
        const {
            point1Coordinates: [x0, y0],
            controlPointCoordinates: [x1, y1],
            point2Coordinates: [x2, y2]
        } = this;

        const a = (t1 - 1) ** 2;
        const b = -2 * (t1 - 1) * t1;
        const c = t1 ** 2;

        const d = (t1 - 1) * (t2 - 1);
        const e = t1 + t2 - 2 * t1 * t2;
        const f = t1 * t2;

        const g = (t2 - 1) ** 2;
        const h = -2 * (t2 - 1) * t2;
        const i = t2 ** 2;

        const matrix = [a, b, c, d, e, f, g, h, i] as Parameters<typeof Matrix3.dotVector3>[0];

        const xs = Matrix3.dotVector3(matrix, [x0, x1, x2]);
        const ys = Matrix3.dotVector3(matrix, [y0, y1, y2]);

        return new QuadraticBezier(xs[0], ys[0], xs[2], ys[2], xs[1], ys[1]);
    }
    // #endregion

    toPath(closed = false) {
        const { point1Coordinates: c1, point2Coordinates: c2, controlPointCoordinates: cpc } = this;
        const commands: PathCommand[] = [];
        commands.push(Path.moveTo(c1));
        commands.push(Path.quadraticBezierTo(cpc, c2));
        return new Path(commands, closed);
    }
    apply(transformation: Transformation) {
        const { point1Coordinates: c1, point2Coordinates: c2, controlPointCoordinates: cpc } = this;
        const nc1 = transformation.transformCoordinates(c1);
        const nc2 = transformation.transformCoordinates(c2);
        const ncpc = transformation.transformCoordinates(cpc);
        return new QuadraticBezier(nc1, nc2, ncpc);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>).getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const { point1Coordinates: c1, point2Coordinates: c2, controlPointCoordinates: cpc } = this;
        gg.moveTo(...c1);
        gg.quadraticBezierTo(...cpc, ...c2);
        return g;
    }
    clone() {
        const ret = new QuadraticBezier();
        ret._point1X = this._point1X;
        ret._point1Y = this._point1Y;
        ret._point2X = this._point2X;
        ret._point2Y = this._point2Y;
        ret._controlPointX = this._controlPointX;
        ret._controlPointY = this._controlPointY;
        return ret;
    }
    copyFrom(shape: QuadraticBezier | null) {
        if (shape === null) shape = new QuadraticBezier();
        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        this._setPoint2X(shape._point2X);
        this._setPoint2Y(shape._point2Y);
        this._setControlPointX(shape._controlPointX);
        this._setControlPointY(shape._controlPointY);
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
            controlPointX: this._controlPointX,
            controlPointY: this._controlPointY
        };
    }
}

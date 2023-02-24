import { Assert, Coordinates, Maths, Matrix3, Polynomial, RootMultiplicity, Type, Utility, Vector2 } from "@geomtoy/util";
import { validGeometry } from "../../misc/decor-geometry";

import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import Circle from "./Circle";
import Point from "./Point";
import Vector from "./Vector";

import { optioner } from "../../geomtoy";
import Graphics from "../../graphics";
import { bezierLength } from "../../misc/bezier-length";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import { getCoordinates } from "../../misc/point-like";
import type Transformation from "../../transformation";
import type { FiniteOpenGeometry, ViewportDescriptor } from "../../types";
import Path from "../general/Path";
import LineSegment from "./LineSegment";

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
        if (!Utility.isEqualTo(this._point1X, value)) this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point1XChanged));
        this._point1X = value;
    }
    private _setPoint1Y(value: number) {
        if (!Utility.isEqualTo(this._point1Y, value)) this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point1YChanged));
        this._point1Y = value;
    }
    private _setPoint2X(value: number) {
        if (!Utility.isEqualTo(this._point2X, value)) this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point2XChanged));
        this._point2X = value;
    }
    private _setPoint2Y(value: number) {
        if (!Utility.isEqualTo(this._point2Y, value)) this.trigger_(new EventSourceObject(this, QuadraticBezier.events.point2YChanged));
        this._point2Y = value;
    }
    private _setControlPointX(value: number) {
        if (!Utility.isEqualTo(this._controlPointX, value)) this.trigger_(new EventSourceObject(this, QuadraticBezier.events.controlPointXChanged));
        this._controlPointX = value;
    }
    private _setControlPointY(value: number) {
        if (!Utility.isEqualTo(this._controlPointY, value)) this.trigger_(new EventSourceObject(this, QuadraticBezier.events.controlPointYChanged));
        this._controlPointY = value;
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

        const eps = optioner.options.coefficientEpsilon;
        const d2 = Maths.equalTo(cx2, 0, eps) && Maths.equalTo(cy2, 0, eps);
        const d1 = Maths.equalTo(cx1, 0, eps) && Maths.equalTo(cy1, 0, eps);

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
        const { epsilon, curveEpsilon } = optioner.options;
        // prettier-ignore
        let tRoots = [
            ...(!Polynomial.isConstant(polyXD) ? Polynomial.roots(polyXD) : []),
            ...(!Polynomial.isConstant(polyYD) ? Polynomial.roots(polyYD) : [])
        ].filter(Type.isNumber);
        tRoots = Utility.uniqWith(tRoots, (a, b) => Maths.equalTo(a, b, curveEpsilon));

        return tRoots
            .filter(t => {
                return Maths.between(t, 0, 1, false, false, epsilon);
            })
            .map(t => [new Point(this.getParametricEquation()(t)), t] as [point: Point, time: number]);
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
        if (Maths.equalTo((1 - t) * t, 0, optioner.options.timeEpsilon)) {
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
        [this.point1Coordinates, this.point2Coordinates] = [this.point2Coordinates, this.point1Coordinates];
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

    isDoubleLines() {
        // This means $ax^2+bxy+cy^2+dx+ey+f=0$ can write as $(lx+my+n)^2=0$
        const coefs = this.getImplicitFunctionCoefs();
        const curveEpsilon = optioner.options.curveEpsilon;
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
            Maths.equalTo(b, 2 * l * m, curveEpsilon) &&
            Maths.equalTo(d, 2 * l * n, curveEpsilon) &&
            Maths.equalTo(e, 2 * m * n, curveEpsilon)
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
    getClosestPointFrom(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const [polyX, polyY] = this.getPolynomial();
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
        return new Point(Polynomial.evaluate(polyX, minT), Polynomial.evaluate(polyY, minT));
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
        if (Maths.between(t, 0, 1, false, false, optioner.options.epsilon)) return Maths.clamp(t, 0, 1);
        return NaN;
    }

    getTimesOfPointExtend(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const [polyX, polyY] = this.getPolynomial();
        const epsilon = optioner.options.epsilon;
        const curveEpsilon = optioner.options.curveEpsilon;
        const xPoly = Polynomial.standardize(Polynomial.add(polyX, [-x]));
        const yPoly = Polynomial.standardize(Polynomial.add(polyY, [-y]));

        let xRootsM: RootMultiplicity<number>[] | undefined = undefined;
        let yRootsM: RootMultiplicity<number>[] | undefined = undefined;

        if (Polynomial.isConstant(xPoly)) {
            if (!Maths.equalTo(Polynomial.coef(xPoly, 0), 0, epsilon)) return [];
        } else {
            xRootsM = Polynomial.rootsMultiplicity(Polynomial.roots(xPoly).filter(Type.isNumber), curveEpsilon);
            if (xRootsM.length === 0) return [];
        }

        if (Polynomial.isConstant(yPoly)) {
            if (!Maths.equalTo(Polynomial.coef(yPoly, 0), 0, epsilon)) return [];
        } else {
            yRootsM = Polynomial.rootsMultiplicity(Polynomial.roots(yPoly).filter(Type.isNumber), curveEpsilon);
            if (yRootsM.length === 0) return [];
        }

        if (xRootsM !== undefined && yRootsM === undefined) {
            return xRootsM.map(rm => rm.root);
        }
        if (xRootsM === undefined && yRootsM !== undefined) {
            return yRootsM.map(rm => rm.root);
        }
        if (xRootsM !== undefined && yRootsM !== undefined) {
            let ret: number[] = [];
            for (let xr of xRootsM) {
                for (let yr of yRootsM) {
                    if (Maths.equalTo(xr.root, yr.root, curveEpsilon)) {
                        ret.push(Maths.avg(xr.root, yr.root));
                    }
                }
            }
            return ret;
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

        const epsilon = optioner.options.epsilon;
        Utility.sortWith(times, (a, b) => {
            const d1 = Maths.between(a, 0, 1, false, false, epsilon);
            const d2 = Maths.between(b, 0, 1, false, false, epsilon);
            if (d1 && !d2) return -1;
            if (!d1 && d2) return 1;
            return a - b;
        });
        return times[0];
    }
    // #endregion

    // #region Tangent and normal
    /**
     * Get the tangent vector of quadratic bezier `this` at time `t`.
     * @param t
     */
    getTangentVectorAtTime(t: number, normalized = false) {
        t = this._clampTime(t, "t");
        // `polyX` and `polyY` may be constant polygon(all end/control points lie on a horizontal/vertical line).
        // `Polynomial.derivative` will handle the above case well, it will return a zero polynomial and zero polynomial can be evaluated.
        // If there is a cusp, the tangent vector will be zero there.
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD, polyYD] = [Polynomial.derivative(polyX), Polynomial.derivative(polyY)];
        const c = this.getParametricEquation()(t);
        const tv = [Polynomial.evaluate(polyXD, t), Polynomial.evaluate(polyYD, t)] as [number, number];
        return normalized ? new Vector(c, Vector2.normalize(tv)) : new Vector(c, tv);
    }
    /**
     * Get the normal vector of quadratic bezier `this` at time `t`.
     * @param t
     */
    getNormalVectorAtTime(t: number, normalized = false) {
        t = this._clampTime(t, "t");
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD, polyYD] = [Polynomial.derivative(polyX), Polynomial.derivative(polyY)];
        const c = this.getParametricEquation()(t);
        const tv = [Polynomial.evaluate(polyXD, t), Polynomial.evaluate(polyYD, t)] as [number, number];
        const nv = Maths.sign(this.getCurvatureAtTime(t)) < 0 ? Vector2.rotate(tv, -Maths.PI / 2) : Vector2.rotate(tv, Maths.PI / 2);
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
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD1, polyYD1] = [Polynomial.derivative(polyX, 1), Polynomial.derivative(polyY, 1)];
        const [polyXD2, polyYD2] = [Polynomial.derivative(polyX, 2), Polynomial.derivative(polyY, 2)];
        const d1x = Polynomial.evaluate(polyXD1, t);
        const d1y = Polynomial.evaluate(polyYD1, t);
        const d2x = Polynomial.evaluate(polyXD2, t);
        const d2y = Polynomial.evaluate(polyYD2, t);
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
    splitAtTimes(ts: number[]) {
        ts = ts.map(t => this._clampTime(t, "element of ts"));
        const ret: QuadraticBezier[] = [];
        const epsilon = optioner.options.epsilon;
        ts = Utility.sortBy(
            Utility.uniqWith(ts, (a, b) => Maths.equalTo(a, b, epsilon)),
            [n => n]
        );
        [0, ...ts, 1].forEach((_, index, arr) => {
            if (index !== arr.length - 1) {
                ret.push(this.portionOfExtend(arr[index], arr[index + 1]));
            }
        });
        return ret;
    }
    splitAtTime(t: number) {
        t = this._clampTime(t, "t");
        return [this.portionOfExtend(0, t), this.portionOfExtend(t, 1)] as [QuadraticBezier, QuadraticBezier];
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
        const path = new Path();
        const { point1Coordinates: c1, point2Coordinates: c2, controlPointCoordinates: cpc } = this;
        path.appendCommand(Path.moveTo(c1));
        path.appendCommand(Path.quadraticBezierTo(cpc, c2));
        path.closed = closed;
        return path;
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
        return new QuadraticBezier(this.point1X, this.point1Y, this.point2X, this.point2Y, this.controlPointX, this.controlPointY);
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
    override toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tpoint1X: ${this.point1X}`,
            `\tpoint1Y: ${this.point1Y}`,
            `\tpoint2X: ${this.point2X}`,
            `\tpoint2Y: ${this.point2Y}`,
            `\tcontrolPointX: ${this.controlPointX}`,
            `\tcontrolPointY: ${this.controlPointY}`,
            `}`
        ].join("\n");
    }
}

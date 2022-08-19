import { Assert, Type, Utility, Coordinates, Vector2, Polynomial, Matrix4, Maths, Matrix2, RootMultiplicity } from "@geomtoy/util";
import { validGeometry } from "../../misc/decor-valid-geometry";

import Geometry from "../../base/Geometry";
import Point from "./Point";
import Vector from "./Vector";
import Circle from "./Circle";
import LineSegment from "./LineSegment";
import Path from "../advanced/Path";
import GeometryGraphics from "../../graphics/GeometryGraphics";
import EventObject from "../../event/EventObject";

import type Transformation from "../../transformation";
import type { FiniteOpenGeometry } from "../../types";
import QuadraticBezier from "./QuadraticBezier";
import { stated } from "../../misc/decor-cache";
import { optioner } from "../../geomtoy";
import { getCoordinates } from "../../misc/point-like";
import { bezierLength } from "../../misc/bezier-length";

@validGeometry
export default class Bezier extends Geometry implements FiniteOpenGeometry {
    private _point1X = NaN;
    private _point1Y = NaN;
    private _point2X = NaN;
    private _point2Y = NaN;
    private _controlPoint1X = NaN;
    private _controlPoint1Y = NaN;
    private _controlPoint2X = NaN;
    private _controlPoint2Y = NaN;

    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number, controlPoint1X: number, controlPoint1Y: number, controlPoint2X: number, controlPoint2Y: number);
    constructor(point1Coordinates: [number, number], point2Coordinates: [number, number], controlPoint1Coordinates: [number, number], controlPoint2Coordinates: [number, number]);
    constructor(point1: Point, point2: Point, controlPoint1: Point, controlPoint2: Point);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { point1X: a0, point1Y: a1, point2X: a2, point2Y: a3, controlPoint1X: a4, controlPoint1Y: a5, controlPoint2X: a6, controlPoint2Y: a7 });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { point1Coordinates: a0, point2Coordinates: a1, controlPoint1Coordinates: a2, controlPoint2Coordinates: a3 });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { point1: a0, point2: a1, controlPoint1: a2, controlPoint2: a3 });
        }
    }

    get events() {
        return {
            point1XChanged: "point1X" as const,
            point1YChanged: "point1Y" as const,
            point2XChanged: "point2X" as const,
            point2YChanged: "point2Y" as const,
            controlPoint1XChanged: "controlPoint1X" as const,
            controlPoint1YChanged: "controlPoint1Y" as const,
            controlPoint2XChanged: "controlPoint2X" as const,
            controlPoint2YChanged: "controlPoint2Y" as const
        };
    }

    private _setPoint1X(value: number) {
        if (!Utility.isEqualTo(this._point1X, value)) this.trigger_(EventObject.simple(this, this.events.point1XChanged));
        this._point1X = value;
    }
    private _setPoint1Y(value: number) {
        if (!Utility.isEqualTo(this._point1Y, value)) this.trigger_(EventObject.simple(this, this.events.point1YChanged));
        this._point1Y = value;
    }
    private _setPoint2X(value: number) {
        if (!Utility.isEqualTo(this._point2X, value)) this.trigger_(EventObject.simple(this, this.events.point2XChanged));
        this._point2X = value;
    }
    private _setPoint2Y(value: number) {
        if (!Utility.isEqualTo(this._point2Y, value)) this.trigger_(EventObject.simple(this, this.events.point2YChanged));
        this._point2Y = value;
    }
    private _setControlPoint1X(value: number) {
        if (!Utility.isEqualTo(this._controlPoint1X, value)) this.trigger_(EventObject.simple(this, this.events.controlPoint1XChanged));
        this._controlPoint1X = value;
    }
    private _setControlPoint1Y(value: number) {
        if (!Utility.isEqualTo(this._controlPoint1Y, value)) this.trigger_(EventObject.simple(this, this.events.controlPoint1YChanged));
        this._controlPoint1Y = value;
    }
    private _setControlPoint2X(value: number) {
        if (!Utility.isEqualTo(this._controlPoint2X, value)) this.trigger_(EventObject.simple(this, this.events.controlPoint2XChanged));
        this._controlPoint2X = value;
    }
    private _setControlPoint2Y(value: number) {
        if (!Utility.isEqualTo(this._controlPoint2Y, value)) this.trigger_(EventObject.simple(this, this.events.controlPoint2YChanged));
        this._controlPoint2Y = value;
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
    get controlPoint1X() {
        return this._controlPoint1X;
    }
    set controlPoint1X(value) {
        Assert.isRealNumber(value, "controlPoint1X");
        this._setControlPoint1X(value);
    }
    get controlPoint1Y() {
        return this._controlPoint1Y;
    }
    set controlPoint1Y(value) {
        Assert.isRealNumber(value, "controlPoint1Y");
        this._setControlPoint1Y(value);
    }
    get controlPoint1Coordinates() {
        return [this._controlPoint1X, this._controlPoint1Y] as [number, number];
    }
    set controlPoint1Coordinates(value) {
        Assert.isCoordinates(value, "controlPoint1Coordinates");
        this._setControlPoint1X(Coordinates.x(value));
        this._setControlPoint1Y(Coordinates.y(value));
    }
    get controlPoint1() {
        return new Point(this._controlPoint1X, this._controlPoint1Y);
    }
    set controlPoint1(value) {
        this._setControlPoint1X(value.x);
        this._setControlPoint1Y(value.y);
    }
    get controlPoint2X() {
        return this._controlPoint2X;
    }
    set controlPoint2X(value) {
        Assert.isRealNumber(value, "controlPoint2X");
        this._setControlPoint2X(value);
    }
    get controlPoint2Y() {
        return this._controlPoint2Y;
    }
    set controlPoint2Y(value) {
        Assert.isRealNumber(value, "controlPoint2Y");
        this._setControlPoint2Y(value);
    }
    get controlPoint2Coordinates() {
        return [this._controlPoint2X, this._controlPoint2Y] as [number, number];
    }
    set controlPoint2Coordinates(value) {
        Assert.isCoordinates(value, "controlPoint2Coordinates");
        this._setControlPoint2X(Coordinates.x(value));
        this._setControlPoint2Y(Coordinates.y(value));
    }
    get controlPoint2() {
        return new Point(this._controlPoint2X, this._controlPoint2Y);
    }
    set controlPoint2(value) {
        this._setControlPoint2X(value.x);
        this._setControlPoint2Y(value.y);
    }

    protected initialized_() {
        return (
            !Number.isNaN(this._point1X) &&
            !Number.isNaN(this._point1Y) &&
            !Number.isNaN(this._point2X) &&
            !Number.isNaN(this._point2Y) &&
            !Number.isNaN(this._controlPoint1X) &&
            !Number.isNaN(this._controlPoint1Y) &&
            !Number.isNaN(this._controlPoint2X) &&
            !Number.isNaN(this._controlPoint2Y)
        );
    }

    /**
     * Returns an array of `[Point, time]` indicate where and at what time, bezier curve `this` has max/min x/y coordinate value.
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

    @stated
    dimensionallyDegenerate() {
        if (!this.initialized_()) return true;
        const { point1Coordinates: c1, point2Coordinates: c2, controlPoint1Coordinates: cpc1, controlPoint2Coordinates: cpc2 } = this;
        const epsilon = optioner.options.epsilon;
        return Coordinates.isEqualTo(c1, c2, epsilon) && Coordinates.isEqualTo(cpc1, cpc2, epsilon) && Coordinates.isEqualTo(c1, cpc1, epsilon);
    }
    @stated
    nonDimensionallyDegenerate(): this | QuadraticBezier | LineSegment {
        const { point1Coordinates: c1, point2Coordinates: c2, controlPoint1Coordinates: cpc1 } = this;

        const [[cx3, cx2], [cy3, cy2]] = this.getPolynomial();

        if (cx3 === 0 && cy3 === 0) {
            // degenerate to quadratic, move like a quadratic
            if (cx2 === 0 && cy2 === 0) {
                // degenerate to linear, move like a linear
                // if (cx1 === 0 && cy1 === 0) {
                // Degenerate to point, no move. This is a dimensional degeneration, it won't come here
                // }
                return new LineSegment(c1, c2);
            }
            const [x0, y0] = c1;
            const [x1, y1] = cpc1;
            const cpc = [(-x0 + 3 * x1) / 2, (-y0 + 3 * y1) / 2] as [number, number];
            return new QuadraticBezier(c1, c2, cpc);
        }
        return this;
    }

    move(deltaX: number, deltaY: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, [deltaX, deltaY]);
        this.point2Coordinates = Vector2.add(this.point2Coordinates, [deltaX, deltaY]);
        this.controlPoint1Coordinates = Vector2.add(this.controlPoint1Coordinates, [deltaX, deltaY]);
        this.controlPoint2Coordinates = Vector2.add(this.controlPoint2Coordinates, [deltaX, deltaY]);
        return this;
    }

    moveAlongAngle(angle: number, distance: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, Vector2.from2(angle, distance));
        this.point2Coordinates = Vector2.add(this.point2Coordinates, Vector2.from2(angle, distance));
        this.controlPoint1Coordinates = Vector2.add(this.controlPoint1Coordinates, Vector2.from2(angle, distance));
        this.controlPoint2Coordinates = Vector2.add(this.controlPoint2Coordinates, Vector2.from2(angle, distance));
        return this;
    }
    /**
     * Returns a bezier based on provided four points and two times `ts`.
     * @note
     * - If two times are equal, `null` will be returned.
     * - The two times must both be in the interval $(0,1)$, if not, an error will be thrown.
     * @param point1
     * @param point2
     * @param point3
     * @param point4
     * @param ts
     */
    static fromFourPointsAndTimes(point1: [number, number] | Point, point2: [number, number] | Point, point3: [number, number] | Point, point4: [number, number] | Point, ts: [number, number]) {
        Assert.condition(ts[0] > 0 && ts[0] < 1, "[G]The first `time` should be a number between 0(not including) and 1(not including).");
        Assert.condition(ts[1] > 0 && ts[1] < 1, "[G]The second `time` should be a number between 0(not including) and 1(not including).");
        const c1 = getCoordinates(point1, "point1");
        const c2 = getCoordinates(point2, "point2");
        const c3 = getCoordinates(point3, "point3");
        const c4 = getCoordinates(point4, "point4");
        const [t1, t2] = ts;

        const ct1 = Vector2.subtract(c2, Vector2.add(Vector2.scalarMultiply(c1, (1 - t1) ** 3), Vector2.scalarMultiply(c4, t1 ** 3)));
        const ct2 = Vector2.subtract(c3, Vector2.add(Vector2.scalarMultiply(c1, (1 - t2) ** 3), Vector2.scalarMultiply(c4, t2 ** 3)));
        const m = [3 * (1 - t1) ** 2 * t1, 3 * (1 - t1) * t1 ** 2, 3 * (1 - t2) ** 2 * t2, 3 * (1 - t2) * t2 ** 2] as [number, number, number, number];
        const im = Matrix2.invert(m);
        if (im === undefined) return null;
        const [cp1x, cp2x] = Matrix2.dotVector2(im, [Coordinates.x(ct1), Coordinates.x(ct2)] as [number, number]);
        const [cp1y, cp2y] = Matrix2.dotVector2(im, [Coordinates.y(ct1), Coordinates.y(ct2)] as [number, number]);
        return new Bezier(c1, c4, [cp1x, cp1y], [cp2x, cp2y]);
    }
    /**
     * Whether point `point` is on bezier `this`.
     * @param point
     */
    isPointOn(point: [number, number] | Point) {
        return !Number.isNaN(this.getTimeOfPoint(point));
    }

    reverse() {
        [this.point1Coordinates, this.point2Coordinates] = [this.point2Coordinates, this.point1Coordinates];
        [this.controlPoint1Coordinates, this.controlPoint2Coordinates] = [this.controlPoint2Coordinates, this.controlPoint1Coordinates];
    }
    /**
     * Returns the length of bezier `this`.
     */
    getLength() {
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD, polyYD] = [Polynomial.derivative(polyX), Polynomial.derivative(polyY)];
        return bezierLength(polyXD, polyYD);
    }
    /**
     * Returns two univariate polynomial of `time` for `x` coordinate and `y` coordinate.
     */
    @stated
    getPolynomial(): [polynomialForX: [number, number, number, number], polynomialForY: [number, number, number, number]] {
        const {
            point1Coordinates: [x0, y0],
            controlPoint1Coordinates: [x1, y1],
            controlPoint2Coordinates: [x2, y2],
            point2Coordinates: [x3, y3]
        } = this;
        // prettier-ignore
        const m = [-1, 3, -3, 1, 3, -6, 3, 0, -3, 3, 0, 0, 1, 0, 0, 0] as [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
        const polyX = Matrix4.dotVector4(m, [x0, x1, x2, x3]);
        const polyY = Matrix4.dotVector4(m, [y0, y1, y2, y3]);
        return [polyX, polyY] as [[number, number, number, number], [number, number, number, number]];
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
    isTripleLines() {
        // This means $ax^3+bx^2y+cxy^2+dy^3+ex^2+fxy+gy^2+hx+iy+j=0$ can write as $(lx+my+n)^3=0$
        const coefs = this.getImplicitFunctionCoefs();
        const curveEpsilon = optioner.options.curveEpsilon;
        if (coefs.length !== 10) return false;
        const [a, b, c, d, e, f, g, h, i, j] = coefs;
        // $$
        // \begin{align*}
        //     a&=l^3 \\
        //     b&=3l^2m \\
        //     c&=3lm^2 \\
        //     d&=m^3 \\
        //     e&=3l^2n \\
        //     f&=6lmn \\
        //     g&=3m^2n \\
        //     h&=3ln^2 \\
        //     i&=3mn^2 \\
        //     j&=n^3
        // \end{align*}
        // $$
        const l = Maths.cbrt(a);
        const m = Maths.cbrt(d);
        const n = Maths.cbrt(j);
        return (
            Maths.equalTo(b, 3 * l ** 2 * m, curveEpsilon) &&
            Maths.equalTo(c, 3 * l * m ** 2, curveEpsilon) &&
            Maths.equalTo(e, 3 * l ** 2 * n, curveEpsilon) &&
            Maths.equalTo(f, 6 * l * m * n, curveEpsilon) &&
            Maths.equalTo(g, 3 * m ** 2 * n, curveEpsilon) &&
            Maths.equalTo(h, 3 * l * n ** 2, curveEpsilon) &&
            Maths.equalTo(i, 3 * m * n ** 2, curveEpsilon)
        );
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
    /**
     * Returns the coefficients of the implicit function $ax^3+bx^2y+cxy^2+dy^3+ex^2+fxy+gy^2+hx+iy+j=0$.
     */
    getImplicitFunctionCoefs():
        | [a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number]
        | [a: number, b: number, c: number, d: number, e: number, f: number]
        | [a: number, b: number, c: number] {
        const [[cx3, cx2, cx1, cx0], [cy3, cy2, cy1, cy0]] = this.getPolynomial();

        const [cx02, cx03, cy02, cy03] = [cx0 ** 2, cx0 ** 3, cy0 ** 2, cy0 ** 3];
        const [cx12, cx13, cy12, cy13] = [cx1 ** 2, cx1 ** 3, cy1 ** 2, cy1 ** 3];
        const [cx22, cx23, cy22, cy23] = [cx2 ** 2, cx2 ** 3, cy2 ** 2, cy2 ** 3];
        const [cx32, cx33, cy32, cy33] = [cx3 ** 2, cx3 ** 3, cy3 ** 2, cy3 ** 3];

        const epsilon = optioner.options.epsilon;

        if (Maths.equalTo(cx3, 0, epsilon) && Maths.equalTo(cy3, 0, epsilon)) {
            // degenerate to quadratic, move like a quadratic
            if (Maths.equalTo(cx2, 0, epsilon) && Maths.equalTo(cy2, 0, epsilon)) {
                // degenerate to linear, move like a linear
                if (Maths.equalTo(cx1, 0, epsilon) && Maths.equalTo(cy1, 0, epsilon)) {
                    // Degenerate to point, no move
                    // This is a dimensional degeneration, it won't come here
                }
                // $ax+by+c=0$
                const a = cy1;
                const b = -cx1;
                const c = cx1 * cy0 - cx0 * cy1;
                return [a, b, c] as [number, number, number];
            }
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
        // $ax^3+bx^2y+cxy^2+dy^3+ex^2+fxy+gy^2+hx+iy+j=0$
        const a = -cy33;
        const b = 3 * cx3 * cy32;
        const c = -3 * cx32 * cy3;
        const d = cx33;
        // prettier-ignore
        const e = 
            -cx3 * cy23 + 
            3 * cx3 * cy1 * cy2 * cy3 + 
            cx2 * cy22 * cy3 - 
            3 * cx3 * cy0 * cy32 - 
            2 * cx2 * cy1 * cy32 - 
            cx1 * cy2 * cy32 + 
            3 * cx0 * cy33;
        // prettier-ignore
        const f =
            -3 * cx32 * cy1 * cy2 + 
            2 * cx2 * cx3 * cy22 + 
            6 * cx32 * cy0 * cy3 + 
            cx2 * cx3 * cy1 * cy3 - 
            2 * cx22 * cy2 * cy3 - 
            cx1 * cx3 * cy2 * cy3 + 
            3 * cx1 * cx2 * cy32 - 
            6 * cx0 * cx3 * cy32;
        // prettier-ignore
        const g = 
            -3 * cx33 * cy0 + 
            cx2 * cx32 * cy1 - 
            cx22 * cx3 * cy2 + 
            2 * cx1 * cx32 * cy2 + 
            cx23 * cy3 - 
            3 * cx1 * cx2 * cx3 * cy3 + 
            3 * cx0 * cx32 * cy3;
        const h =
            3 * cx32 * cy0 * cy1 * cy2 -
            cx32 * cy13 +
            cx2 * cx3 * cy12 * cy2 -
            2 * cx2 * cx3 * cy0 * cy22 -
            cx1 * cx3 * cy1 * cy22 +
            2 * cx0 * cx3 * cy23 -
            3 * cx32 * cy02 * cy3 -
            cx2 * cx3 * cy0 * cy1 * cy3 -
            cx22 * cy12 * cy3 +
            2 * cx1 * cx3 * cy12 * cy3 +
            2 * cx22 * cy0 * cy2 * cy3 +
            cx1 * cx3 * cy0 * cy2 * cy3 +
            cx1 * cx2 * cy1 * cy2 * cy3 -
            6 * cx0 * cx3 * cy1 * cy2 * cy3 -
            2 * cx0 * cx2 * cy22 * cy3 -
            3 * cx1 * cx2 * cy0 * cy32 +
            6 * cx0 * cx3 * cy0 * cy32 -
            cx12 * cy1 * cy32 +
            4 * cx0 * cx2 * cy1 * cy32 +
            2 * cx0 * cx1 * cy2 * cy32 -
            3 * cx02 * cy33;

        const i =
            3 * cx33 * cy02 -
            2 * cx2 * cx32 * cy0 * cy1 +
            cx1 * cx32 * cy12 +
            2 * cx22 * cx3 * cy0 * cy2 -
            4 * cx1 * cx32 * cy0 * cy2 -
            cx1 * cx2 * cx3 * cy1 * cy2 +
            3 * cx0 * cx32 * cy1 * cy2 +
            cx12 * cx3 * cy22 -
            2 * cx0 * cx2 * cx3 * cy22 -
            2 * cx23 * cy0 * cy3 +
            6 * cx1 * cx2 * cx3 * cy0 * cy3 -
            6 * cx0 * cx32 * cy0 * cy3 +
            cx1 * cx22 * cy1 * cy3 -
            2 * cx12 * cx3 * cy1 * cy3 -
            cx0 * cx2 * cx3 * cy1 * cy3 -
            cx12 * cx2 * cy2 * cy3 +
            2 * cx0 * cx22 * cy2 * cy3 +
            cx0 * cx1 * cx3 * cy2 * cy3 +
            cx13 * cy32 -
            3 * cx0 * cx1 * cx2 * cy32 +
            3 * cx02 * cx3 * cy32;
        const j =
            cx2 * cx32 * cy02 * cy1 -
            cx33 * cy03 -
            cx1 * cx32 * cy0 * cy12 +
            cx0 * cx32 * cy13 -
            cx22 * cx3 * cy02 * cy2 +
            2 * cx1 * cx32 * cy02 * cy2 +
            cx1 * cx2 * cx3 * cy0 * cy1 * cy2 -
            3 * cx0 * cx32 * cy0 * cy1 * cy2 -
            cx0 * cx2 * cx3 * cy12 * cy2 -
            cx12 * cx3 * cy0 * cy22 +
            2 * cx0 * cx2 * cx3 * cy0 * cy22 +
            cx0 * cx1 * cx3 * cy1 * cy22 -
            cx02 * cx3 * cy23 +
            cx23 * cy02 * cy3 -
            3 * cx1 * cx2 * cx3 * cy02 * cy3 +
            3 * cx0 * cx32 * cy02 * cy3 -
            cx1 * cx22 * cy0 * cy1 * cy3 +
            2 * cx12 * cx3 * cy0 * cy1 * cy3 +
            cx0 * cx2 * cx3 * cy0 * cy1 * cy3 +
            cx0 * cx22 * cy12 * cy3 -
            2 * cx0 * cx1 * cx3 * cy12 * cy3 +
            cx12 * cx2 * cy0 * cy2 * cy3 -
            2 * cx0 * cx22 * cy0 * cy2 * cy3 -
            cx0 * cx1 * cx3 * cy0 * cy2 * cy3 -
            cx0 * cx1 * cx2 * cy1 * cy2 * cy3 +
            3 * cx02 * cx3 * cy1 * cy2 * cy3 +
            cx02 * cx2 * cy22 * cy3 -
            cx13 * cy0 * cy32 +
            3 * cx0 * cx1 * cx2 * cy0 * cy32 -
            3 * cx02 * cx3 * cy0 * cy32 +
            cx0 * cx12 * cy1 * cy32 -
            2 * cx02 * cx2 * cy1 * cy32 -
            cx02 * cx1 * cy2 * cy32 +
            cx03 * cy33;

        return [a, b, c, d, e, f, g, h, i, j];
    }

    /**
     * Returns the self-intersection situation of bezier `this`.
     * @see https://math.stackexchange.com/questions/3776840/2d-cubic-bezier-curve-point-of-self-intersection
     * @description
     * - If bezier `this` has a self-intersection, the two time values of the self-intersection will be returned.
     * - Else return a empty array.
     */
    selfIntersection(): [] | [number, number] {
        const [t1, t2] = this.selfIntersectionExtend();
        if (!t1 || !t2) return [];
        const epsilon = optioner.options.epsilon;
        if (Maths.between(t1, 0, 1, false, false, epsilon) && Maths.between(t2, 0, 1, false, false, epsilon)) {
            // Self-intersection is on underlying curve not on bezier `this`.
            return [t1, t2] as [number, number];
        }
        return [];
    }

    /**
     * Returns the self-intersection situation of the underlying curve of bezier `this`.
     * @see https://math.stackexchange.com/questions/3776840/2d-cubic-bezier-curve-point-of-self-intersection
     * @description
     * - If the underlying curve has a self-intersection, the two time values of the self-intersection will be returned.
     * - Else return a empty array.
     */
    selfIntersectionExtend() {
        const [[cx3, cx2, cx1, cx0], [cy3, cy2, cy1, cy0]] = this.getPolynomial();
        // Suppose bezier has self-intersection which has two distinct times `t1` and `t2`.
        // By Vieta's formulas, `t1` and `t2` are the roots of $t^2-(t1+t2)t+t1*t2=0$
        // prettier-ignore
        const poly = [
            1,
            (cx3 * cy1 - cx1 * cy3) / (cx3 * cy2 - cx2 * cy3),
            (cx3**2 * cy1**2 - cx2 * cx3 * cy1 * cy2 + cx1 * cx3 * cy2**2 + cx2**2 * cy1 * cy3 - 2 * cx1 * cx3 * cy1 * cy3 - cx1 * cx2 * cy2 * cy3 + cx1**2 * cy3**2) 
            / (cx3 * cy2 - cx2 * cy3) ** 2
        ];
        if (!Polynomial.is(poly)) return []; // cx3 * cy2 - cx2 * cy3 == 0
        const epsilon = optioner.options.epsilon;
        const tRoots = Polynomial.roots(poly).filter(Type.isNumber);
        if (tRoots.length === 0) return [];
        // violate the supposition that `t1` and `t2` are distinct(The case where self-intersection degenerates to a cusp is not taken into account)
        if (Maths.equalTo(tRoots[0], tRoots[1], epsilon)) return [];
        return [tRoots[0], tRoots[1]] as [number, number];
    }

    /**
     * Get the closest point on bezier `this` from point `point`.
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

    // #region Time and point
    /**
     * Get the point at time `t` of bezier `this`.
     * @note
     * Only interpolation is supported to keep the returned point on the bezier `this`, so `t` must be in $[0,1]$.
     * If both interpolation and extrapolation are required at the same time, please use `getPointAtTimeExtend` method,
     * which has no restrictions on the value of `t`, nor does it guarantee that the returned point is on bezier `this`.
     * @param t
     */
    getPointAtTime(t: number) {
        Assert.condition(t >= 0 && t <= 1, "[G]The `t` must be between 0(including) and 1(including).");
        const [x, y] = this.getParametricEquation()(t);
        return new Point(x, y);
    }
    /**
     * Get the point at extended time `t` of bezier `this`.
     * @description
     * - If `t` is in $[0,1]$, a point on the interior of `point1`(including) and `point2`(including) will be returned.
     * - If `t` is in $(-\infty,0)$, a point on the exterior of `point1` will be returned.
     * - If `t` is in $(1,\infty)$, a point on the exterior of `point2` will be returned.
     * @note
     * This method performs both interpolation and extrapolation at the same time,
     * so the returned point is not guaranteed to be on the bezier `this`.
     * @param t
     */
    getPointAtTimeExtend(t: number) {
        Assert.isRealNumber(t, "t");
        const [x, y] = this.getParametricEquation()(t);
        return new Point(x, y);
    }
    /**
     * Get the time of point `point` on bezier `this`.
     * @description
     * - If point is not on bezier `this`, `NaN` will be returned.
     * - If point is on bezier `this`, a number in $[0,1]$ will be returned.
     * @note
     * Since bezier `this` may have a self-intersection, there may be two time values.
     * In this case, the smaller time value found first will be returned.
     * @param point
     */
    getTimeOfPoint(point: [number, number] | Point): number {
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
     * Get the time of point `point` on the underlying curve of bezier `this`.
     * @description
     * - If `point` is not on the underlying curve, `NaN` will be returned.
     * - If `point` is on the interior of `point1`(including) and `point2`(including), a number in $[0,1]$ will be returned.
     * - If `point` is on the exterior of `point1`, a number in $(-\infty,0)$ will be returned.
     * - If `point` is on the exterior of `point2`, a number in $(1,\infty)$ will be returned.
     * @note
     * Since bezier `this` may have a self-intersection, there may be two time values.
     * In this case, the smaller time value found first will be returned.
     * @param point
     */
    getTimeOfPointExtend(point: [number, number] | Point): number {
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
        // When degenerate and self-intersecting, there are at most three different times fit the `point`.
        // We pick the time in $[0,1]$ and smaller one.
        return times[0];
    }
    // #endregion

    /**
     * Get the tangent vector of bezier `this` at time `t`.
     * @param t
     * @param normalized
     */
    getTangentVectorAtTime(t: number, normalized = false) {
        Assert.condition(t >= 0 && t <= 1, "[G]The `t` must be between 0(including) and 1(including).");
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD, polyYD] = [Polynomial.derivative(polyX), Polynomial.derivative(polyY)];
        const c = this.getParametricEquation()(t);
        const tv = [Polynomial.evaluate(polyXD, t), Polynomial.evaluate(polyYD, t)] as [number, number];
        return normalized ? new Vector(c, Vector2.normalize(tv)) : new Vector(c, tv);
    }
    /**
     * Get the normal vector of bezier `this` at time `t`.
     * @param t
     * @param normalized
     */
    getNormalVectorAtTime(t: number, normalized = false) {
        Assert.condition(t >= 0 && t <= 1, "[G]The `t` must be between 0(including) and 1(including).");
        const [polyX, polyY] = this.getPolynomial();
        const [polyXD, polyYD] = [Polynomial.derivative(polyX), Polynomial.derivative(polyY)];
        const tv = [Polynomial.evaluate(polyXD, t), Polynomial.evaluate(polyYD, t)] as [number, number];
        const c = this.getParametricEquation()(t);
        const cvt = this.getCurvatureAtTime(t);
        const sign = Maths.sign(cvt);
        const nv = Object.is(sign, -1) || Object.is(sign, -0) ? Vector2.rotate(tv, -Maths.PI / 2) : Vector2.rotate(tv, Maths.PI / 2);
        return normalized ? new Vector(c, Vector2.normalize(nv)) : new Vector(c, nv);
    }
    /**
     * Get the curvature of quadratic bezier `this` at time `t`.
     * @note
     * A curvature is signed and it is in $[-\infty,\infty]$.
     * @param t
     */
    getCurvatureAtTime(t: number) {
        Assert.condition(t >= 0 && t <= 1, "[G]The `t` must be between 0(including) and 1(including).");
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
     * - If the curvature at `t` is $\pm\infty$, `null` will be returned(the circle degenerates to a line).
     * - If the curvature at `t` is 0, `null` will be returned(the circle degenerates to a point).
     * - Else a circle is returned.
     * @param t
     */
    getOsculatingCircleAtTime(t: number) {
        const cvt = this.getCurvatureAtTime(t);
        const p = this.getPointAtTime(t);

        if (cvt === Infinity || cvt === -Infinity) return null; // the circle is a line
        if (cvt === 0) return null; // the circle is a point

        const r = Maths.abs(1 / cvt);
        const angle = this.getNormalVectorAtTime(t).angle;
        p.moveAlongAngle(angle, r);
        return new Circle(p, r);
    }

    splitAtTimes(times: number[]) {
        Assert.condition(
            times.every(t => t > 0 && t < 1),
            "[G]The `times` should all be a number between 0(not including) and 1(not including)."
        );
        const ret: Bezier[] = [];
        const epsilon = optioner.options.epsilon;
        times = Utility.sortBy(
            Utility.uniqWith(times, (a, b) => Maths.equalTo(a, b, epsilon)),
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
        Assert.condition(t > 0 && t < 1, "[G]The `t` should be a number between 0(not including) and 1(not including).");
        return [this.portionOfExtend(0, t), this.portionOfExtend(t, 1)] as [Bezier, Bezier];
    }

    portionOf(t1: number, t2: number) {
        const epsilon = optioner.options.epsilon;
        Assert.condition(t1 >= 0 && t2 <= 1, "[G]The `t1` should be a number between 0(including) and 1(including).");
        Assert.condition(t2 >= 0 && t2 <= 1, "[G]The `t2` should be a number between 0(including) and 1(including).");
        Assert.condition(!Maths.equalTo(t1, t2, epsilon), "[G]The `t1` and `t2` should not be equal.");
        return this.portionOfExtend(t1, t2);
    }

    portionOfExtend(t1: number, t2: number) {
        const epsilon = optioner.options.epsilon;
        Assert.isRealNumber(t1, "t1");
        Assert.isRealNumber(t2, "t2");
        Assert.condition(!Maths.equalTo(t1, t2, epsilon), "[G]The `t1` and `t2` should not be equal.");
        if (t1 > t2) [t1, t2] = [t2, t1];
        const {
            point1Coordinates: [x0, y0],
            controlPoint1Coordinates: [x1, y1],
            controlPoint2Coordinates: [x2, y2],
            point2Coordinates: [x3, y3]
        } = this;

        const a = -((t1 - 1) ** 3);
        const b = 3 * (t1 - 1) ** 2 * t1;
        const c = -3 * (t1 - 1) * t1 ** 2;
        const d = t1 ** 3;

        const e = -(t2 - 1) * (t1 - 1) ** 2;
        const f = (t1 - 1) * (-2 * t1 - t2 + 3 * t1 * t2);
        const g = t1 * (t1 + 2 * t2 - 3 * t1 * t2);
        const h = t1 ** 2 * t2;

        const i = -(t1 - 1) * (t2 - 1) ** 2;
        const j = (t2 - 1) * (-2 * t2 - t1 + 3 * t1 * t2);
        const k = t2 * (t2 + 2 * t1 - 3 * t1 * t2);
        const l = t1 * t2 ** 2;

        const m = -((t2 - 1) ** 3);
        const n = 3 * (t2 - 1) ** 2 * t2;
        const o = -3 * (t2 - 1) * t2 ** 2;
        const p = t2 ** 3;

        const matrix = [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p] as [
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number,
            number
        ];

        const xs = Matrix4.dotVector4(matrix, [x0, x1, x2, x3]);
        const ys = Matrix4.dotVector4(matrix, [y0, y1, y2, y3]);

        return new Bezier(xs[0], ys[0], xs[3], ys[3], xs[1], ys[1], xs[2], ys[2]);
    }
    toPath(closed = false) {
        const path = new Path();
        const { point1Coordinates: c1, point2Coordinates: c2, controlPoint1Coordinates: cpc1, controlPoint2Coordinates: cpc2 } = this;
        path.appendCommand(Path.moveTo(c1));
        path.appendCommand(Path.bezierTo(cpc1, cpc2, c2));
        path.closed = closed;
        return path;
    }
    apply(transformation: Transformation) {
        const { point1Coordinates: c1, point2Coordinates: c2, controlPoint1Coordinates: cpc1, controlPoint2Coordinates: cpc2 } = this;
        const nc1 = transformation.transformCoordinates(c1);
        const nc2 = transformation.transformCoordinates(c2);
        const ncpc1 = transformation.transformCoordinates(cpc1);
        const ncpc2 = transformation.transformCoordinates(cpc2);
        return new Bezier(nc1, nc2, ncpc1, ncpc2);
    }
    getGraphics() {
        const g = new GeometryGraphics();
        if (!this.initialized_()) return g;

        const { point1Coordinates: c1, point2Coordinates: c2, controlPoint1Coordinates: cpc1, controlPoint2Coordinates: cpc2 } = this;
        g.moveTo(...c1);
        g.bezierTo(...cpc1, ...cpc2, ...c2);
        return g;
    }
    clone() {
        return new Bezier(this.point1X, this.point1Y, this.point2X, this.point2Y, this.controlPoint1X, this.controlPoint1Y, this.controlPoint2X, this.controlPoint2Y);
    }
    copyFrom(shape: Bezier | null) {
        if (shape === null) shape = new Bezier();
        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        this._setPoint2X(shape._point2X);
        this._setPoint2Y(shape._point2Y);
        this._setControlPoint1X(shape._controlPoint1X);
        this._setControlPoint1Y(shape._controlPoint1Y);
        this._setControlPoint2X(shape._controlPoint2X);
        this._setControlPoint2Y(shape._controlPoint2Y);
        return this;
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tpoint1X: ${this.point1X},`,
            `\tpoint1Y: ${this.point1Y},`,
            `\tpoint2X: ${this.point2X},`,
            `\tpoint2Y: ${this.point2Y},`,
            `\tcontrolPoint1X: ${this.controlPoint1X},`,
            `\tcontrolPoint1Y: ${this.controlPoint1Y},`,
            `\tcontrolPoint2X: ${this.controlPoint2X},`,
            `\tcontrolPoint2Y: ${this.controlPoint2Y}`,
            `}`
        ].join("\n");
    }
    toArray() {
        return [this.point1X, this.point1Y, this.point2X, this.point2Y, this.controlPoint1X, this.controlPoint1Y, this.controlPoint2X, this.controlPoint2Y];
    }
    toObject() {
        return {
            point1X: this.point1X,
            point1Y: this.point1Y,
            point2X: this.point2X,
            point2Y: this.point2Y,
            controlPoint1X: this.controlPoint1X,
            controlPoint1Y: this.controlPoint1Y,
            controlPoint2X: this.controlPoint2X,
            controlPoint2Y: this.controlPoint2Y
        };
    }
}

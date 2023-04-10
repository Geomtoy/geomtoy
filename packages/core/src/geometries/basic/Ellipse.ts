import { Angle, Assert, Coordinates, Float, Maths, Polynomial, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import SealedGeometryArray from "../../collection/SealedGeometryArray";
import EventSourceObject from "../../event/EventSourceObject";
import { eps } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import { validGeometry, validGeometryArguments } from "../../misc/decor-geometry";
import { stated, statedWithBoolean } from "../../misc/decor-stated";
import { completeEllipticIntegralOfSecondKind } from "../../misc/elliptic-integral";
import { getCoordinates } from "../../misc/point-like";
import Transformation from "../../transformation";
import type { ClosedGeometry, RotationFeaturedGeometry, ViewportDescriptor, WindingDirection } from "../../types";
import Path from "../general/Path";
import Arc from "./Arc";
import Circle from "./Circle";
import Line from "./Line";
import LineSegment from "./LineSegment";
import Point from "./Point";
import Vector from "./Vector";

@validGeometry
export default class Ellipse extends Geometry implements ClosedGeometry, RotationFeaturedGeometry {
    // $\frac{((x-c_x)\cos(\varphi)+(y-c_y)\sin(\varphi))^2}{r_x^2}+\frac{((x-c_x)\sin(\varphi)-(y-c_y)\cos(\varphi))^2}{r_y^2}=1$
    private _centerX = NaN;
    private _centerY = NaN;
    private _radiusX = NaN;
    private _radiusY = NaN;
    private _rotation = 0;

    constructor(centerX: number, centerY: number, radiusX: number, radiusY: number, rotation?: number);
    constructor(centerCoordinates: [number, number], radiusX: number, radiusY: number, rotation?: number);
    constructor(centerPoint: Point, radiusX: number, radiusY: number, rotation?: number);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { centerX: a0, centerY: a1, radiusX: a2, radiusY: a3, rotation: a4 ?? 0 });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { centerCoordinates: a0, radiusX: a1, radiusY: a2, rotation: a3 ?? 0 });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { centerPoint: a0, radiusX: a1, radiusY: a2, rotation: a3 ?? 0 });
        }
        this.initState_();
    }

    static override events = {
        centerXChanged: "centerX" as const,
        centerYChanged: "centerY" as const,
        radiusXChanged: "radiusX" as const,
        radiusYChanged: "radiusY" as const,
        rotationChanged: "rotation" as const
    };

    private _setCenterX(value: number) {
        if (Utility.is(this._centerX, value)) return;
        this._centerX = value;
        this.trigger_(new EventSourceObject(this, Ellipse.events.centerXChanged));
    }
    private _setCenterY(value: number) {
        if (Utility.is(this._centerY, value)) return;
        this._centerY = value;
        this.trigger_(new EventSourceObject(this, Ellipse.events.centerYChanged));
    }
    private _setRadiusX(value: number) {
        if (Utility.is(this._radiusX, value)) return;
        this._radiusX = value;
        this.trigger_(new EventSourceObject(this, Ellipse.events.radiusXChanged));
    }
    private _setRadiusY(value: number) {
        if (Utility.is(this._radiusY, value)) return;
        this._radiusY = value;
        this.trigger_(new EventSourceObject(this, Ellipse.events.radiusYChanged));
    }
    private _setRotation(value: number) {
        if (Utility.is(this._rotation, value)) return;
        this._rotation = value;
        this.trigger_(new EventSourceObject(this, Ellipse.events.rotationChanged));
    }

    get centerX() {
        return this._centerX;
    }
    set centerX(value) {
        Assert.isRealNumber(value, "centerX");
        this._setCenterX(value);
    }
    get centerY() {
        return this._centerY;
    }
    set centerY(value) {
        Assert.isRealNumber(value, "centerY");
        this._setCenterY(value);
    }
    get centerCoordinates() {
        return [this._centerX, this._centerY] as [number, number];
    }
    set centerCoordinates(value) {
        Assert.isCoordinates(value, "centerCoordinates");
        this._setCenterX(Coordinates.x(value));
        this._setCenterY(Coordinates.y(value));
    }
    get centerPoint() {
        return new Point(this._centerX, this._centerY);
    }
    set centerPoint(value) {
        this._setCenterX(value.x);
        this._setCenterY(value.y);
    }
    get radiusX() {
        return this._radiusX;
    }
    set radiusX(value) {
        Assert.isNonNegativeNumber(value, "radiusX");
        this._setRadiusX(value);
    }
    get radiusY() {
        return this._radiusY;
    }
    set radiusY(value) {
        Assert.isNonNegativeNumber(value, "radiusY");
        this._setRadiusY(value);
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        Assert.isRealNumber(value, "rotation");
        this._setRotation(value);
    }

    @stated
    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._centerX) &&
            !Number.isNaN(this._centerY) &&
            !Number.isNaN(this._radiusX) &&
            !Number.isNaN(this._radiusY)
        );
    }

    degenerate(check: false): Point | SealedGeometryArray<[LineSegment, LineSegment]> | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;

        const { radiusX: rx, radiusY: ry, centerCoordinates: cc, rotation: phi } = this;
        const rx0 = Float.equalTo(rx, 0, Float.MACHINE_EPSILON);
        const ry0 = Float.equalTo(ry, 0, Float.MACHINE_EPSILON);
        if (check) return rx0 || ry0;

        if (rx0 && !ry0) {
            const c1 = Vector2.add(cc, Vector2.rotate([0, ry], phi));
            const c2 = Vector2.add(cc, Vector2.rotate([0, -ry], phi));
            // prettier-ignore
            return new SealedGeometryArray([
                new LineSegment(c1, c2), 
                new LineSegment(c2, c1)
            ]);
        }
        if (!rx0 && ry0) {
            const c1 = Vector2.add(cc, Vector2.rotate([0, rx], phi));
            const c2 = Vector2.add(cc, Vector2.rotate([0, -rx], phi));
            // prettier-ignore
            return new SealedGeometryArray([
                new LineSegment(c1, c2), 
                new LineSegment(c2, c1)
            ]);
        }
        if (rx0 && ry0) return new Point(cc);
        return this;
    }
    /**
     * @see https://en.wikipedia.org/wiki/Ellipse#Circumference
     */
    getLength() {
        const { radiusX: rx, radiusY: ry } = this;
        const a = Maths.max(rx, ry);
        const b = Maths.min(rx, ry);
        const esq = 1 - b ** 2 / a ** 2;
        return 4 * a * completeEllipticIntegralOfSecondKind(esq);
    }
    getArea() {
        const { radiusX: rx, radiusY: ry } = this;
        return Maths.PI * rx * ry;
    }
    /**
     * Returns the eccentricity of ellipse `this`.
     */
    getEccentricity() {
        const { radiusX: rx, radiusY: ry } = this;
        const a = Maths.max(rx, ry);
        const b = Maths.min(rx, ry);
        return Maths.sqrt(1 - b ** 2 / a ** 2);
    }
    /**
     * Returns the tow foci of ellipse `this`.
     */
    getFoci() {
        const { radiusX: rx, radiusY: ry, centerCoordinates: cc, rotation: phi } = this;
        if (rx === ry) {
            return [new Point(cc), new Point(cc)] as [Point, Point];
        }
        let f1: [number, number];
        let f2: [number, number];
        if (rx > ry) {
            const a = rx;
            const b = ry;
            const c = Maths.sqrt(a ** 2 - b ** 2);
            [f1, f2] = [Vector2.subtract(cc, Vector2.rotate([c, 0], phi)), Vector2.add(cc, Vector2.rotate([c, 0], phi))];
        } else {
            const a = ry;
            const b = rx;
            const c = Maths.sqrt(b ** 2 - a ** 2);
            [f1, f2] = [Vector2.subtract(cc, Vector2.rotate([0, c], phi)), Vector2.add(cc, Vector2.rotate([0, c], phi))];
        }
        return [new Point(f1), new Point(f2)] as [Point, Point];
    }

    getXAxisVertices() {
        const { radiusX: rx, centerCoordinates: cc, rotation: phi } = this;
        const [v1, v2] = [Vector2.subtract(cc, Vector2.rotate([rx, 0], phi)), Vector2.add(cc, Vector2.rotate([rx, 0], phi))];
        return [new Point(v1), new Point(v2)] as [Point, Point];
    }
    getYAxisVertices() {
        const { radiusY: ry, centerCoordinates: cc, rotation: phi } = this;
        const [v1, v2] = [Vector2.subtract(cc, Vector2.rotate([0, ry], phi)), Vector2.add(cc, Vector2.rotate([0, ry], phi))];
        return [new Point(v1), new Point(v2)] as [Point, Point];
    }

    getDirectrices() {
        const { radiusX: rx, radiusY: ry, centerCoordinates: cc, rotation: phi } = this;
        if (rx === ry) {
            // circle has no directrices, or line at infinite.
            return [null, null] as [null, null];
        }
        let lc: [number, number];
        let uc: [number, number];
        let angle: number;
        if (rx > ry) {
            const a = rx;
            const b = ry;
            const c = Maths.sqrt(a ** 2 - b ** 2);
            lc = [-(a ** 2) / c, 0] as [number, number];
            uc = [a ** 2 / c, 0] as [number, number];
            angle = Vector2.angle(Vector2.rotate([0, 1], phi));
        } else {
            const a = ry;
            const b = rx;
            const c = Maths.sqrt(b ** 2 - a ** 2);
            lc = [0, -(a ** 2) / c] as [number, number];
            uc = [0, a ** 2 / c] as [number, number];
            angle = Vector2.angle(Vector2.rotate([1, 0], phi));
        }
        const ll = Line.fromPointAndAngle(lc, angle);
        const ul = Line.fromPointAndAngle(uc, angle);
        return [ll, ul] as [Line, Line];
    }

    static fromTwoFociAndDistanceSum(focus1: [number, number] | Point, focus2: [number, number] | Point, distanceSum: number) {
        Assert.isPositiveNumber(distanceSum, "distanceSum");
        const c1 = getCoordinates(focus1, "focus1");
        const c2 = getCoordinates(focus2, "focus2");
        const v = Vector2.from(c1, c2);
        const c = Vector2.magnitude(v) / 2;
        const a = distanceSum / 2;
        if (Float.lessThan(a, c, eps.epsilon)) {
            console.warn("[G]The `distanceSum` should greater than or equal to the distance between two foci.");
            return null;
        }
        const b = Maths.sqrt(a ** 2 - c ** 2);
        const cc = Vector2.add(c1, Vector2.scalarMultiply(v, 0.5));
        const angle = Vector2.angle(v);
        return new Ellipse(cc, a, b, angle);
    }

    static fromTwoFociAndPointOn(focus1: [number, number] | Point, focus2: [number, number] | Point, point: [number, number] | Point) {
        const c1 = getCoordinates(focus1, "focus1");
        const c2 = getCoordinates(focus2, "focus2");
        const c0 = getCoordinates(point, "point");
        const ds = Vector2.magnitude(Vector2.from(c0, c1)) + Vector2.magnitude(Vector2.from(c0, c2));
        return Ellipse.fromTwoFociAndDistanceSum(c1, c2, ds);
    }

    static fromTwoFociAndEccentricity(focus1: [number, number] | Point, focus2: [number, number] | Point, eccentricity: number) {
        if (!(eccentricity > 0 && eccentricity < 1)) {
            console.warn("[G]The `eccentricity` should be a number between 0(not including) and 1(not including).");
            return null;
        }
        const c1 = getCoordinates(focus1, "focus1");
        const c2 = getCoordinates(focus2, "focus2");
        const v = Vector2.from(c1, c2);
        const c = Vector2.magnitude(v) / 2;
        const a = c / eccentricity;
        const b = Maths.sqrt(a ** 2 - c ** 2);
        const cc = Vector2.add(c1, Vector2.scalarMultiply(v, 0.5));
        const angle = Vector2.angle(v);
        return new Ellipse(cc, a, b, angle);
    }

    /**
     * Determine a ellipse from center point `centerPoint` and two endpoints `endpoint1` and `endpoint2` of conjugate diameters.
     * @see https://en.wikipedia.org/wiki/Rytz%27s_construction
     * @param centerPoint
     * @param endpoint1
     * @param endpoint2
     */
    static fromCenterPointAndTwoConjugateDiametersEndPoints(centerPoint: [number, number] | Point, endpoint1: [number, number] | Point, endpoint2: [number, number] | Point) {
        const cc = getCoordinates(centerPoint, "centerPoint");
        const c1 = getCoordinates(endpoint1, "endpoint1");
        const c2 = getCoordinates(endpoint2, "endpoint2");
        if (Coordinates.equalTo(cc, c1, eps.epsilon) || Coordinates.equalTo(cc, c2, eps.epsilon) || Coordinates.equalTo(c1, c2, eps.epsilon)) {
            console.warn("[G]The `centerPoint`, `endpoint1` and `endpoint2` can not be the same to each other, `null` will be returned");
            return null;
        }
        const v01 = Vector2.from(cc, c1);
        const v02 = Vector2.from(cc, c2);
        if (Float.equalTo(Vector2.cross(v01, v02), 0, eps.vectorEpsilon)) {
            console.warn("[G]The `centerPoint`, `endpoint1` and `endpoint2` can not be collinear, `null` will be returned");
            return null;
        }
        const vh = Vector2.subtract(Vector2.rotate(v01, Maths.PI / 2), v02);
        const vk = Vector2.scalarMultiply(vh, 0.5);
        const m1 = Vector2.magnitude(vk);
        const m2 = Vector2.magnitude(Vector2.add(v02, vk));
        // Make longer one as the major axis.
        const a = m1 + m2;
        const b = m1 - m2;
        const u = Vector2.normalize(vk);
        const vb = Vector2.scalarMultiply(u, b);
        const angle = Vector2.angle(Vector2.add(v02, vb));
        return new Ellipse(cc, Maths.abs(a), Maths.abs(b), angle);
    }

    isPointOn(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const { centerX: cx, centerY: cy, radiusX: rx, radiusY: ry, rotation: phi } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const dx = x - cx;
        const dy = y - cy;
        const f = (dx * cosPhi + dy * sinPhi) ** 2 / rx ** 2 + (dx * sinPhi - dy * cosPhi) ** 2 / ry ** 2;
        return Float.equalTo(f, 1, eps.epsilon);
    }
    isPointOutside(point: [number, number] | Point): boolean {
        const [x, y] = getCoordinates(point, "point");
        const { centerX: cx, centerY: cy, radiusX: rx, radiusY: ry, rotation: phi } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const dx = x - cx;
        const dy = y - cy;
        const f = (dx * cosPhi + dy * sinPhi) ** 2 / rx ** 2 + (dx * sinPhi - dy * cosPhi) ** 2 / ry ** 2;
        return Float.equalTo(f, 1, eps.epsilon);
    }
    isPointInside(point: [number, number] | Point): boolean {
        const [x, y] = getCoordinates(point, "point");
        const { centerX: cx, centerY: cy, radiusX: rx, radiusY: ry, rotation: phi } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const dx = x - cx;
        const dy = y - cy;
        const f = (dx * cosPhi + dy * sinPhi) ** 2 / rx ** 2 + (dx * sinPhi - dy * cosPhi) ** 2 / ry ** 2;
        return Float.equalTo(f, 1, eps.epsilon);
    }

    @validGeometryArguments
    getClosestPointFromPoint(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const { centerX: cx, centerY: cy, rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const cosPhi2 = cosPhi ** 2;
        const sinPhi2 = sinPhi ** 2;
        const rx2 = rx ** 2;
        const ry2 = ry ** 2;

        const fn = this.getParametricEquation();

        if (cx === x && cy === y && rx === ry) {
            return [new Point(fn(0)), rx] as [point: Point, distance: number]; // circle and at centerPoint
        }
        let tPoly = [
            ry * (sinPhi * (cx - x) - cosPhi * (cy - y)),
            2 * (cosPhi2 * (rx2 - ry2) + cosPhi * rx * (-cx + x) + sinPhi2 * (rx2 - ry2) + sinPhi * rx * (-cy + y)),
            0,
            2 * (cosPhi2 * (-rx2 + ry2) + cosPhi * rx * (-cx + x) + sinPhi2 * (-rx2 + ry2) + sinPhi * rx * (-cy + y)),
            ry * (cosPhi * (cy - y) - sinPhi * (cx - x))
        ];

        tPoly = Polynomial.monic(tPoly);

        const roots = Polynomial.roots(tPoly).filter(Type.isNumber);
        const as = roots.map(r => Angle.simplify(Maths.atan(r) * 2));

        let minA = NaN;
        let minSd = Infinity;
        as.forEach(a => {
            const [px, py] = fn(a);
            const sd = (px - x) ** 2 + (py - y) ** 2;
            if (sd < minSd) {
                minSd = sd;
                minA = a;
            }
        });
        return [new Point(fn(minA)), minSd] as [point: Point, distanceSquare: number];
    }

    move(deltaX: number, deltaY: number) {
        this.centerCoordinates = Vector2.add(this.centerCoordinates, [deltaX, deltaY]);
        return this;
    }

    getWindingDirection() {
        return 1 as WindingDirection;
    }

    getArcBetweenAngles(startAngle: number, endAngle: number, positive = true): null | Arc {
        const sa = Angle.simplify(startAngle);
        const ea = Angle.simplify(endAngle);
        return Arc.fromCenterPointAndStartEndAnglesEtc(this.centerCoordinates, this.radiusX, this.radiusY, sa, ea, positive, this.rotation);
    }

    //https://www.coder.work/article/1220553
    static findTangentLineOfTwoEllipse(ellipse1: Ellipse, ellipse2: Ellipse) {}

    //https://zhuanlan.zhihu.com/p/64550850
    static findTangentLineOfEllipseAndParabola() {}

    @stated
    getParametricEquation() {
        const { _centerX: cx, _centerY: cy, _rotation: phi, _radiusX: rx, _radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        return function (a: number) {
            const cosA = Maths.cos(a);
            const sinA = Maths.sin(a);
            // prettier-ignore
            return [
                rx * cosA * cosPhi - ry * sinA * sinPhi + cx, 
                rx * cosA * sinPhi + ry * sinA * cosPhi + cy
            ] as [number, number];
        };
    }

    getPointAtAngle(angle: number) {
        Assert.isRealNumber(angle, "angle");
        const [x, y] = this.getParametricEquation()(angle);
        return new Point(x, y);
    }

    getAngleOfPoint(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const { centerX: cx, centerY: cy, rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        // rx*cosTheta*cosPhi-ry*sinTheta*sinPhi+cx==x
        // rx*cosTheta*sinPhi+ry*sinTheta*cosPhi+cy==y
        const cosTheta = (cosPhi * (x - cx) + sinPhi * (y - cy)) / rx;
        const sinTheta = (cosPhi * (y - cy) - sinPhi * (x - cx)) / ry;
        if (Float.equalTo(sinTheta ** 2 + cosTheta ** 2, 1, eps.trigonometricEpsilon)) {
            return Angle.simplify(Maths.atan2(sinTheta, cosTheta));
        }
        return NaN;
    }

    getBoundingBox() {
        const { centerX: cx, centerY: cy, rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const hw = Maths.hypot(rx * cosPhi, ry * sinPhi);
        const hh = Maths.hypot(rx * sinPhi, ry * cosPhi);
        const w = hw * 2;
        const h = hh * 2;
        const x = cx - hw;
        const y = cy - hh;
        return [x, y, w, h] as [number, number, number, number];
    }
    @stated
    private _d1() {
        const { _radiusX: rx, _radiusY: ry, _rotation: phi } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        return function (a: number) {
            const sinA = Maths.sin(a);
            const cosA = Maths.cos(a);
            // prettier-ignore
            return [
                -rx * sinA * cosPhi - ry * cosA * sinPhi, 
                -rx * sinA * sinPhi + ry * cosA * cosPhi
            ] as [number, number];
        };
    }
    @stated
    private _d2() {
        const { _radiusX: rx, _radiusY: ry, _rotation: phi } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        return function (a: number) {
            const sinA = Maths.sin(a);
            const cosA = Maths.cos(a);
            // prettier-ignore
            return [
                -rx * cosA * cosPhi + ry * sinA * sinPhi, 
                -rx * cosA * sinPhi - ry * sinA * cosPhi
            ] as [number, number];
        };
    }

    /**
     * Get the tangent vector of ellipse `this` at angle `a`.
     * @param a
     * @param normalized
     */
    getTangentVectorAtAngle(a: number, normalized = false) {
        const [d1x, d1y] = this._d1()(a);
        const tv = [d1x, d1y] as [number, number];
        const c = this.getParametricEquation()(a);
        return normalized ? new Vector(c, Vector2.normalize(tv)) : new Vector(c, tv);
    }
    getNormalVectorAtAngle(a: number, normalized = false) {
        const [d1x, d1y] = this._d1()(a);
        const nv = [-d1y, d1x] as [number, number]; // rotate positively 90 degree, vector rotation shorthand
        const c = this.getParametricEquation()(a);
        return normalized ? new Vector(c, Vector2.normalize(nv)) : new Vector(c, nv);
    }
    getCurvatureAtAngle(a: number) {
        const [d1x, d1y] = this._d1()(a);
        const [d2x, d2y] = this._d2()(a);
        const num = Vector2.cross([d1x, d1y], [d2x, d2y]);
        const den = Maths.pow(d1x ** 2 + d1y ** 2, 3 / 2);
        return num / den;
    }
    getOsculatingCircleAtAngle(a: number) {
        const cvt = this.getCurvatureAtAngle(a);
        if (cvt === Infinity || cvt === -Infinity) return null; // the circle is a line
        if (cvt === 0) return null; // the circle is a point

        const r = 1 / cvt;
        const c = this.getParametricEquation()(a);
        const angle = this.getNormalVectorAtAngle(a).angle;
        const cc = Vector2.add(c, Vector2.from2(angle, r));
        return new Circle(cc, Maths.abs(r));
    }

    /**
     * Returns the coefficients of the implicit function $ax^2+bxy+cy^2+dx+ey+f=0$.
     */
    getImplicitFunctionCoefs(): [a: number, b: number, c: number, d: number, e: number, f: number] {
        const { centerX: cx, centerY: cy, rotation: phi, radiusX: rx, radiusY: ry } = this;
        const sin2Phi = Maths.sin(2 * phi); // $\sin(2\alpha)=2\sin(\alpha)\cos(\alpha)$
        const cos2Phi = Maths.cos(2 * phi); // $\cos(2\alpha)=2\cos^2(\alpha)-1=1-2\sin^2(\alpha)$
        const cx2 = cx ** 2;
        const cy2 = cy ** 2;
        const rx2 = rx ** 2;
        const ry2 = ry ** 2;

        const a = (1 + cos2Phi) / (2 * rx2) + (1 - cos2Phi) / (2 * ry2);
        const b = sin2Phi / rx2 - sin2Phi / ry2;
        const c = (1 - cos2Phi) / (2 * rx2) + (1 + cos2Phi) / (2 * ry2);
        const d = (sin2Phi * cy - (1 - cos2Phi) * cx) / ry2 - (sin2Phi * cy + (1 + cos2Phi) * cx) / rx2;
        const e = (sin2Phi * cx - (1 + cos2Phi) * cy) / ry2 - (sin2Phi * cx + (1 - cos2Phi) * cy) / rx2;
        const f = -1 + ((1 + cos2Phi) * cx2 + 2 * sin2Phi * cx * cy + (1 - cos2Phi) * cy2) / (2 * rx2) + ((1 - cos2Phi) * cx2 - 2 * sin2Phi * cx * cy + (1 + cos2Phi) * cy2) / (2 * ry2);

        return [a, b, c, d, e, f];
    }
    apply(transformation: Transformation) {
        // @see https://math.stackexchange.com/questions/3076317/what-is-the-equation-for-an-ellipse-in-standard-form-after-an-arbitrary-matrix-t
        // @see https://math.stackexchange.com/questions/2627074/finding-the-major-and-minor-axes-lengths-of-an-ellipse-given-parametric-equation
        const { centerX, centerY, radiusX, radiusY, rotation } = this;
        // Consider ellipse `this` is transformed from a unit circle.
        // Do remember, the transformation is applied from right to left.
        // *Memo:
        // A x B x C = M            --- M is composited by A, B, C in the order shown.
        // M x v = nv               --- apply the composited matrix to v
        // (A x B x C) v = nv       --- equal to apply the A, B, C sequently in the right to left order.
        //                          --- Because matrix is a kind of `function`:
        // A(B(C(v)))= nv
        const te = new Transformation().addTranslate(centerX, centerY).addRotate(rotation).addScale(radiusX, radiusY);
        const t = transformation.clone().addMatrix(...te.matrix);
        const {
            translate: [tx, ty],
            rotate1,
            scale: [sx, sy]
        } = t.decomposeSvd();
        return new Ellipse(tx, ty, Maths.abs(sx), Maths.abs(sy), rotate1);
    }
    /**
     * Convert ellipse `this` to path, using only one `Path.arcTo` command.
     */
    toPath() {
        const { _rotation: rotation, _radiusX: radiusX, _radiusY: radiusY } = this;
        const c = this.getParametricEquation()(0);
        const path = new Path();
        path.appendCommand(Path.moveTo(c));
        path.appendCommand(Path.arcTo(radiusX, radiusY, rotation, true, true, c));
        path.closed = true;
        return path;
    }
    /**
     * Convert ellipse `this` to path, using two `Path.arcTo` commands.
     */
    toPath3() {
        const { _rotation: rotation, _radiusX: radiusX, _radiusY: radiusY } = this;
        const c0 = this.getParametricEquation()(0);
        const c1 = this.getParametricEquation()(Maths.PI);
        const path = new Path();
        path.appendCommand(Path.moveTo(c0));
        path.appendCommand(Path.arcTo(radiusX, radiusY, rotation, false, true, c1));
        path.appendCommand(Path.arcTo(radiusX, radiusY, rotation, false, true, c0));
        path.closed = true;
        return path;
    }

    toPath2() {
        const kappa = 0.5522848;
        const { centerX: cx, centerY: cy, rotation: phi, radiusX: rx, radiusY: ry } = this;

        const ox = rx * kappa; // control point offset horizontal
        const oy = ry * kappa; // control point offset vertical
        const xs = cx - rx; // x-start
        const ys = cy - ry; // y-start
        const xe = cx + rx; // x-end
        const ye = cy + ry; // y-end
        const xm = cx; // x-middle
        const ym = cy; // y-middle

        const cp11 = Vector2.rotate([xs, ym - oy], phi);
        const cp12 = Vector2.rotate([xm - ox, ys], phi);
        const cp21 = Vector2.rotate([xm + ox, ys], phi);
        const cp22 = Vector2.rotate([xe, ym - oy], phi);
        const cp31 = Vector2.rotate([xe, ym + oy], phi);
        const cp32 = Vector2.rotate([xm + ox, ye], phi);
        const cp41 = Vector2.rotate([xm - ox, ye], phi);
        const cp42 = Vector2.rotate([xs, ym + oy], phi);

        // todo consider windingDirection
        const path = new Path();
        path.appendCommand(Path.moveTo(Vector2.rotate([xs, ym], phi)));
        path.appendCommand(Path.bezierTo(cp11, cp12, Vector2.rotate([xm, ys], phi)));
        path.appendCommand(Path.bezierTo(cp21, cp22, Vector2.rotate([xe, ym], phi)));
        path.appendCommand(Path.bezierTo(cp31, cp32, Vector2.rotate([xm, ye], phi)));
        path.appendCommand(Path.bezierTo(cp41, cp42, Vector2.rotate([xs, ym], phi)));
        path.closed = true;
        return path;
    }

    getGraphics(viewport: ViewportDescriptor) {
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>).getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const { centerX, centerY, radiusX, radiusY, rotation } = this;
        gg.centerArcTo(centerX, centerY, radiusX, radiusY, rotation, 0, 2 * Maths.PI);
        return g;
    }
    clone() {
        return new Ellipse(this.centerX, this.centerY, this.radiusX, this.radiusY, this.rotation);
    }
    copyFrom(shape: Ellipse | null) {
        if (shape === null) shape = new Ellipse();
        this._setCenterX(shape._centerX);
        this._setCenterY(shape._centerY);
        this._setRadiusX(shape._radiusX);
        this._setRadiusY(shape._radiusY);
        this._setRotation(shape._rotation);
        return this;
    }
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            centerX: this._centerX,
            centerY: this._centerY,
            radiusX: this._radiusX,
            radiusY: this._radiusY,
            rotation: this._rotation
        };
    }
}

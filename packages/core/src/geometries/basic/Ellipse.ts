import { Assert, Type, Utility, Coordinates, Maths, Vector2, Angle, EllipticIntegral } from "@geomtoy/util";
import { validGeometry } from "../../misc/decor-valid-geometry";
import { centerToEndpointParameterization } from "../../misc/arc";

import Path from "../advanced/Path";

import Geometry from "../../base/Geometry";
import Point from "./Point";
import GeometryGraphics from "../../graphics/GeometryGraphics";
import EventObject from "../../event/EventObject";
import Arc from "./Arc";
import Circle from "./Circle";
import Vector from "./Vector";
import Line from "./Line";

import Transformation from "../../transformation";
import type { WindingDirection, ClosedGeometry, RotationFeaturedGeometry } from "../../types";
import { optioner } from "../../geomtoy";
import { getCoordinates } from "../../misc/point-like";

@validGeometry
export default class Ellipse extends Geometry implements ClosedGeometry, RotationFeaturedGeometry {
    // $\frac{((x-c_x)\cos(\varphi)+(y-c_y)\sin(\varphi))^2}{r_x^2}+\frac{((x-c_x)\sin(\varphi)-(y-c_y)\cos(\varphi))^2}{r_y^2}=1$
    private _centerX = NaN;
    private _centerY = NaN;
    private _radiusX = NaN;
    private _radiusY = NaN;
    private _rotation = 0;
    private _windingDirection = 1 as WindingDirection;

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
    }

    get events() {
        return {
            centerXChanged: "centerX" as const,
            centerYChanged: "centerY" as const,
            radiusXChanged: "radiusX" as const,
            radiusYChanged: "radiusY" as const,
            rotationChanged: "rotation" as const
        };
    }

    private _setCenterX(value: number) {
        if (!Utility.isEqualTo(this._centerX, value)) this.trigger_(EventObject.simple(this, this.events.centerXChanged));
        this._centerX = value;
    }
    private _setCenterY(value: number) {
        if (!Utility.isEqualTo(this._centerY, value)) this.trigger_(EventObject.simple(this, this.events.centerYChanged));
        this._centerY = value;
    }
    private _setRadiusX(value: number) {
        if (!Utility.isEqualTo(this._radiusX, value)) this.trigger_(EventObject.simple(this, this.events.radiusXChanged));
        this._radiusX = value;
    }
    private _setRadiusY(value: number) {
        if (!Utility.isEqualTo(this._radiusY, value)) this.trigger_(EventObject.simple(this, this.events.radiusYChanged));
        this._radiusY = value;
    }
    private _setRotation(value: number) {
        if (!Utility.isEqualTo(this._rotation, value)) this.trigger_(EventObject.simple(this, this.events.rotationChanged));
        this._rotation = value;
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
        Assert.isPositiveNumber(value, "radiusX");
        this._setRadiusX(value);
    }
    get radiusY() {
        return this._radiusY;
    }
    set radiusY(value) {
        Assert.isPositiveNumber(value, "radiusY");
        this._setRadiusY(value);
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        Assert.isRealNumber(value, "rotation");
        this._setRotation(value);
    }

    protected initialized_() {
        // prettier-ignore
        return (
            !Number.isNaN(this._centerX) &&
            !Number.isNaN(this._centerY) &&
            !Number.isNaN(this._radiusX) &&
            !Number.isNaN(this._radiusY)
        );
    }

    /**
     * @see https://en.wikipedia.org/wiki/Ellipse#Circumference
     * Use the Ramanujan Approximation II
     */
    getLength() {
        const { radiusX: rx, radiusY: ry } = this;
        const a = Maths.max(rx, ry);
        const b = Maths.min(rx, ry);
        const esq = 1 - b ** 2 / a ** 2;
        return 4 * a * EllipticIntegral.completeEllipticIntegralOfSecondKind(esq);
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
        const epsilon = optioner.options.epsilon;
        const v = Vector2.from(c1, c2);
        const c = Vector2.magnitude(v) / 2;
        const a = distanceSum / 2;
        if (Maths.lessThan(a, c, epsilon)) {
            console.warn("[G]The `distanceSum` should greater than the distance between two foci.");
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
        const epsilon = optioner.options.epsilon;
        if (Coordinates.isEqualTo(cc, c1, epsilon) || Coordinates.isEqualTo(cc, c2, epsilon) || Coordinates.isEqualTo(c1, c2, epsilon)) {
            console.warn("[G]The `centerPoint`, `endpoint1` and `endpoint2` can not be the same to each other, `null` will be returned");
            return null;
        }
        const v01 = Vector2.from(cc, c1);
        const v02 = Vector2.from(cc, c2);
        if (Maths.equalTo(Vector2.cross(v01, v02), 0, epsilon)) {
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
        const curveEpsilon = optioner.options.curveEpsilon;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const dx = x - cx;
        const dy = y - cx;
        const f = (dx * cosPhi + dy * sinPhi) ** 2 / rx ** 2 + (dx * sinPhi - dy * cosPhi) ** 2 / ry ** 2;
        return Maths.equalTo(f, 1, curveEpsilon);
    }
    isPointOutside(point: [number, number] | Point): boolean {
        const [x, y] = getCoordinates(point, "point");
        const { centerX: cx, centerY: cy, radiusX: rx, radiusY: ry, rotation: phi } = this;
        const curveEpsilon = optioner.options.curveEpsilon;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const dx = x - cx;
        const dy = y - cx;
        const f = (dx * cosPhi + dy * sinPhi) ** 2 / rx ** 2 + (dx * sinPhi - dy * cosPhi) ** 2 / ry ** 2;
        return Maths.greaterThan(f, 1, curveEpsilon);
    }
    isPointInside(point: [number, number] | Point): boolean {
        const [x, y] = getCoordinates(point, "point");
        const { centerX: cx, centerY: cy, radiusX: rx, radiusY: ry, rotation: phi } = this;
        const curveEpsilon = optioner.options.curveEpsilon;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const dx = x - cx;
        const dy = y - cx;
        const f = (dx * cosPhi + dy * sinPhi) ** 2 / rx ** 2 + (dx * sinPhi - dy * cosPhi) ** 2 / ry ** 2;
        return Maths.lessThan(f, 1, curveEpsilon);
    }

    move(deltaX: number, deltaY: number) {
        this.centerCoordinates = Vector2.add(this.centerCoordinates, [deltaX, deltaY]);
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        this.centerCoordinates = Vector2.add(this.centerCoordinates, Vector2.from2(angle, distance));
        return this;
    }

    getWindingDirection() {
        return this._windingDirection;
    }
    setWindingDirection(direction: WindingDirection) {
        this._windingDirection = direction;
    }

    getArcBetweenAngle(startAngle: number, endAngle: number, positive = true): null | Arc {
        const epsilon = optioner.options.epsilon;
        const sa = Angle.simplify(startAngle);
        const ea = Angle.simplify(endAngle);

        if (Maths.equalTo(sa, ea, epsilon)) {
            console.warn("[G]The start angle and end angle are the same, `null` will be returned.");
            return null;
        }
        return Arc.fromCenterPointAndStartEndAnglesEtc(this.centerCoordinates, this.radiusX, this.radiusY, sa, ea, positive, this.rotation);
    }

    //https://www.coder.work/article/1220553
    static findTangentLineOfTwoEllipse(ellipse1: Ellipse, ellipse2: Ellipse) {}

    //https://zhuanlan.zhihu.com/p/64550850
    static findTangentLineOfEllipseAndParabola() {}

    getParametricEquation() {
        const { centerX: cx, centerY: cy, rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        return function (a: number) {
            const x = rx * Maths.cos(a) * cosPhi - ry * Maths.sin(a) * sinPhi + cx;
            const y = rx * Maths.cos(a) * sinPhi + ry * Maths.sin(a) * cosPhi + cy;
            return [x, y] as [number, number];
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

        const curveEpsilon = optioner.options.curveEpsilon;

        if (Maths.equalTo(sinTheta ** 2 + cosTheta ** 2, 1, curveEpsilon)) {
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

    /**
     * Get the tangent vector of ellipse `this` at angle `a`.
     * @param a
     * @param normalized
     */
    getTangentVectorAtAngle(a: number, normalized = false) {
        a = Angle.simplify(a);
        const { rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        // derivative of parametric equation
        const pxD = -rx * Maths.sin(a) * cosPhi - ry * Maths.cos(a) * sinPhi;
        const pyD = -rx * Maths.sin(a) * sinPhi + ry * Maths.cos(a) * cosPhi;
        const tv = [pxD, pyD] as [number, number];
        const c = this.getParametricEquation()(a);
        return normalized ? new Vector(c, Vector2.normalize(tv)) : new Vector(c, tv);
    }
    getNormalVectorAtAngle(a: number, normalized = false) {
        a = Angle.simplify(a);
        const { rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        // derivative of parametric equation
        const pxD = -rx * Maths.sin(a) * cosPhi - ry * Maths.cos(a) * sinPhi;
        const pyD = -rx * Maths.sin(a) * sinPhi + ry * Maths.cos(a) * cosPhi;
        const tv = [pxD, pyD] as [number, number];
        const c = this.getParametricEquation()(a);
        const cvt = this.getCurvatureAtAngle(a);
        const sign = Maths.sign(cvt);
        const nv = Object.is(sign, -1) || Object.is(sign, -0) ? Vector2.rotate(tv, -Maths.PI / 2) : Vector2.rotate(tv, Maths.PI / 2);
        return normalized ? new Vector(c, Vector2.normalize(nv)) : new Vector(c, nv);
    }
    getCurvatureAtAngle(a: number) {
        a = Angle.simplify(a);
        const { centerX: cx, centerY: cy, rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        // 1th order derivative of parametric equation
        const pxD1 = -rx * Maths.sin(a) * cosPhi - ry * Maths.cos(a) * sinPhi;
        const pyD1 = -rx * Maths.sin(a) * sinPhi + ry * Maths.cos(a) * cosPhi;
        // 2th order derivative of parametric equation
        const pxD2 = -rx * Maths.cos(a) * cosPhi + ry * Maths.sin(a) * sinPhi;
        const pyD2 = -rx * Maths.cos(a) * sinPhi - ry * Maths.sin(a) * cosPhi;
        const num = pxD1 * pyD2 - pyD1 * pxD2;
        const den = Maths.pow(pxD1 ** 2 + pxD2 ** 2, 3 / 2);
        return num / den;
    }
    getOsculatingCircleAtAngle(a: number) {
        const cvt = this.getCurvatureAtAngle(a);
        const p = this.getPointAtAngle(a);

        if (cvt === Infinity || cvt === -Infinity) return null; // the circle is a line
        if (cvt === 0) return null; // the circle is a point

        const r = Maths.abs(1 / cvt);
        const angle = this.getNormalVectorAtAngle(a).angle;
        const pc = p.moveAlongAngle(angle, r);
        return new Circle(pc, r);
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
        if (transformation.span() !== 2) return null;

        const { centerX, centerY, radiusX, radiusY, rotation } = this;
        // consider ellipse `this` is transformed from a unit circle
        const te = new Transformation().addTranslate(centerX, centerY).addRotate(rotation).addScale(radiusX, radiusY);

        const t = transformation.clone().addMatrix(...te.matrix);
        const {
            translate: [tx, ty],
            rotate1,
            scale: [sx, sy]
        } = t.decomposeSvd();
        return new Ellipse(tx, ty, Maths.abs(sx), Maths.abs(sy), rotate1);
    }

    toPath2() {
        const { centerX: cx, centerY: cy, rotation: phi, radiusX: rx, radiusY: ry } = this;
        const path = new Path();

        const {
            point1X: x1,
            point1Y: y1,
            point2X: x2,
            point2Y: y2,
            radiusX,
            radiusY,
            largeArc,
            positive,
            rotation
        } = centerToEndpointParameterization({
            centerX: cx,
            centerY: cy,
            radiusX: rx,
            radiusY: ry,
            rotation: phi,
            startAngle: 0,
            endAngle: 2 * Maths.PI,
            positive: this.getWindingDirection() === 1
        });
        path.appendCommand(Path.moveTo([x1, y1]));
        path.appendCommand(Path.arcTo(radiusX, radiusY, rotation, largeArc, positive, [x2, y2]));
        path.closed = true;
        return path;
    }

    toPath() {
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

    getGraphics() {
        const g = new GeometryGraphics();
        if (!this.initialized_()) return g;

        const { centerX, centerY, radiusX, radiusY, rotation } = this;
        g.centerArcTo(centerX, centerY, radiusX, radiusY, rotation, 0, 2 * Maths.PI);
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
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tcenterX: ${this.centerX}`,
            `\tcenterY: ${this.centerY}`,
            `\tradiusX: ${this.radiusX}`,
            `\tradiusY: ${this.radiusY}`,
            `\trotation: ${this.rotation}`,
            `}`
        ].join("\n");
    }
    toArray() {
        return [this.centerX, this.centerY, this.radiusX, this.radiusY, this.rotation];
    }
    toObject() {
        return {
            centerX: this.centerX,
            centerY: this.centerY,
            radiusX: this.radiusX,
            radiusY: this.radiusY,
            rotation: this.rotation
        };
    }
}

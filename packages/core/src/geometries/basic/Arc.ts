import { optioner } from "../../geomtoy";
import { Assert, Vector2, Maths, Type, Utility, Coordinates, Polynomial, Angle, TransformationMatrix, Box } from "@geomtoy/util";

import { centerToEndpointParameterization, endpointToCenterParameterization, endpointParameterizationTransform, flexCorrectRadii } from "../../misc/arc";
import Geometry from "../../base/Geometry";
import Point from "./Point";
import Ellipse from "./Ellipse";
import Circle from "./Circle";
import GeometryGraphics from "../../graphics/GeometryGraphics";
import EventObject from "../../event/EventObject";

import Transformation from "../../transformation";
import type { FiniteOpenGeometry, ViewportDescriptor } from "../../types";
import Path from "../advanced/Path";
import { stated } from "../../misc/decor-cache";
import Vector from "./Vector";
import { validGeometry, validGeometryArguments } from "../../misc/decor-valid-geometry";
import { getCoordinates } from "../../misc/point-like";
import { completeEllipticIntegralOfSecondKind, incompleteEllipticIntegralOfSecondKind } from "../../misc/elliptic-integral";

@validGeometry
export default class Arc extends Geometry implements FiniteOpenGeometry {
    private _point1X = NaN;
    private _point1Y = NaN;
    private _point2X = NaN;
    private _point2Y = NaN;
    private _radiusX = NaN;
    private _radiusY = NaN;
    private _largeArc = true;
    private _positive = true;
    private _rotation = 0;

    private _inputRadiusX = NaN;
    private _inputRadiusY = NaN;

    constructor(point1X: number, point1Y: number, point2X: number, point2Y: number, radiusX: number, radiusY: number, largeArc: boolean, positive: boolean, rotation?: number);
    constructor(point1Coordinates: [number, number], point2Coordinates: [number, number], radiusX: number, radiusY: number, largeArc: boolean, positive: boolean, rotation?: number);
    constructor(point1: Point, point2: Point, radiusX: number, radiusY: number, largeArc: boolean, positive: boolean, rotation?: number);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any, a8?: any) {
        super();
        if (Type.isNumber(a0)) {
            // assign `rotation` first for handling `radiusX` and `radiusY`
            Object.assign(this, { point1X: a0, point1Y: a1, point2X: a2, point2Y: a3, rotation: a8 ?? 0, radiusX: a4, radiusY: a5, largeArc: a6, positive: a7 });
        }
        if (Type.isArray(a0)) {
            // assign `rotation` first for handling `radiusX` and `radiusY`
            Object.assign(this, { point1Coordinates: a0, point2Coordinates: a1, rotation: a6 ?? 0, radiusX: a2, radiusY: a3, largeArc: a4, positive: a5 });
        }
        if (a0 instanceof Point) {
            // assign `rotation` first for handling `radiusX` and `radiusY`
            Object.assign(this, { point1: a0, point2: a1, rotation: a6 ?? 0, radiusX: a2, radiusY: a3, largeArc: a4, positive: a5 });
        }
    }

    get events() {
        return {
            point1XChanged: "point1X" as const,
            point1YChanged: "point1Y" as const,
            point2XChanged: "point2X" as const,
            point2YChanged: "point2Y" as const,
            radiusXChanged: "radiusX" as const,
            radiusYChanged: "radiusY" as const,
            largeArcChanged: "largeArc" as const,
            positiveChanged: "positive" as const,
            rotationChanged: "rotation" as const
        };
    }

    private _setPoint1X(value: number) {
        if (Utility.isEqualTo(this._point1X, value)) return;
        this._point1X = value;
        this.trigger_(EventObject.simple(this, this.events.point1XChanged));
        this._correctAndSetRadii();
    }
    private _setPoint1Y(value: number) {
        if (Utility.isEqualTo(this._point1Y, value)) return;
        this._point1Y = value;
        this.trigger_(EventObject.simple(this, this.events.point1YChanged));
        this._correctAndSetRadii();
    }
    private _setPoint2X(value: number) {
        if (Utility.isEqualTo(this._point2X, value)) return;
        this._point2X = value;
        this.trigger_(EventObject.simple(this, this.events.point2XChanged));
        this._correctAndSetRadii();
    }
    private _setPoint2Y(value: number) {
        if (Utility.isEqualTo(this._point2Y, value)) return;
        this._point2Y = value;
        this.trigger_(EventObject.simple(this, this.events.point2YChanged));
        this._correctAndSetRadii();
    }
    private _setRadiusX(value: number) {
        if (Utility.isEqualTo(this._inputRadiusX, value)) return;
        this._inputRadiusX = value;
        this.trigger_(EventObject.simple(this, this.events.radiusXChanged));
        this._correctAndSetRadii();
    }
    private _setRadiusY(value: number) {
        if (Utility.isEqualTo(this._inputRadiusY, value)) return;
        this._inputRadiusY = value;
        this.trigger_(EventObject.simple(this, this.events.radiusYChanged));
        this._correctAndSetRadii();
    }
    private _setLargeArc(value: boolean) {
        if (Utility.isEqualTo(this._largeArc, value)) return;
        this._largeArc = value;
        this.trigger_(EventObject.simple(this, this.events.largeArcChanged));
    }
    private _setPositive(value: boolean) {
        if (Utility.isEqualTo(this._positive, value)) return;
        this._positive = value;
        this.trigger_(EventObject.simple(this, this.events.positiveChanged));
    }
    private _setRotation(value: number) {
        if (Utility.isEqualTo(this._rotation, value)) return;
        this._rotation = value;
        this.trigger_(EventObject.simple(this, this.events.rotationChanged));
        this._correctAndSetRadii();
    }

    private _correctAndSetRadii() {
        const { _point1X, _point1Y, _point2X, _point2Y, _inputRadiusX, _inputRadiusY, _rotation /* default 0 always not `NaN` */ } = this;
        // prettier-ignore
        const correctPrecondition = (
            !Number.isNaN(_point1X) &&
            !Number.isNaN(_point1Y) &&
            !Number.isNaN(_point2X) &&
            !Number.isNaN(_point1Y) &&
            !Number.isNaN(_point2Y) &&
            !Number.isNaN(_inputRadiusX) &&
            !Number.isNaN(_inputRadiusY)
        )
        if (correctPrecondition) {
            let [rx, ry] = flexCorrectRadii(_point1X, _point1Y, _point2X, _point2Y, _inputRadiusX, _inputRadiusY, _rotation);
            if (!Utility.isEqualTo(this._radiusX, rx)) {
                this._radiusX = rx;
                this.trigger_(EventObject.simple(this, this.events.radiusXChanged));
            }
            if (!Utility.isEqualTo(this._radiusY, ry)) {
                this._radiusY = ry;
                this.trigger_(EventObject.simple(this, this.events.radiusYChanged));
            }
        }
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
    get largeArc() {
        return this._largeArc;
    }
    set largeArc(value) {
        this._setLargeArc(value);
    }
    get positive() {
        return this._positive;
    }
    set positive(value) {
        this._setPositive(value);
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
            !Number.isNaN(this._point1X) &&
            !Number.isNaN(this._point1Y )&&
            !Number.isNaN(this._point2X )&&
            !Number.isNaN(this._point2Y )&&
            !Number.isNaN(this._radiusX )&&
            !Number.isNaN(this._radiusY )
        );
    }

    @stated
    dimensionallyDegenerate() {
        if (!this.initialized_()) return true;
        const { point1Coordinates: c1, point2Coordinates: c2 } = this;
        return Coordinates.isEqualTo(c1, c2, optioner.options.epsilon);
    }

    static fromCenterPointAndStartEndAnglesEtc(centerPoint: [number, number] | Point, radiusX: number, radiusY: number, startAngle: number, endAngle: number, positive: boolean, rotation = 0) {
        Assert.isPositiveNumber(radiusX, "radiusX");
        Assert.isPositiveNumber(radiusY, "radiusY");
        Assert.isRealNumber(startAngle, "startAngle");
        Assert.isRealNumber(endAngle, "endAngle");
        Assert.isRealNumber(rotation, "rotation");
        const [cx, cy] = getCoordinates(centerPoint, "centerPoint");
        const ep = centerToEndpointParameterization({
            centerX: cx,
            centerY: cy,
            radiusX,
            radiusY,
            rotation,
            startAngle,
            endAngle,
            positive
        });
        return new Arc(ep.point1X, ep.point1Y, ep.point2X, ep.point2Y, ep.radiusX, ep.radiusY, ep.largeArc, ep.positive, ep.rotation);
    }
    static fromThreePointsCircular(point1: [number, number] | Point, point2: [number, number] | Point, radiusControlPoint: [number, number] | Point) {
        const [x1, y1] = getCoordinates(point1, "point1");
        const [x2, y2] = getCoordinates(point2, "point2");
        const [x3, y3] = getCoordinates(radiusControlPoint, "radiusControlPoint");

        if (Point.isThreePointsCollinear([x1, y1], [x2, y2], [x3, y3])) {
            return null;
        }

        const a = 2 * (x2 - x1);
        const b = 2 * (y2 - y1);
        const c = x2 ** 2 + y2 ** 2 - x1 ** 2 - y1 ** 2;
        const d = 2 * (x3 - x2);
        const e = 2 * (y3 - y2);
        const f = x3 ** 2 + y3 ** 2 - x2 ** 2 - y2 ** 2;
        const cx = (b * f - e * c) / (b * d - e * a);
        const cy = (d * c - a * f) / (b * d - e * a);
        const r = Maths.sqrt((cx - x1) ** 2 + (cy - y1) ** 2);

        const v12 = Vector2.from([x1, y1], [x2, y2]);
        const v13 = Vector2.from([x1, y1], [x3, y3]);
        const positive = Vector2.cross(v12, v13) < 0;

        const cm = [(x1 + x2) / 2, (y1 + y2) / 2] as [number, number];
        const br = Vector2.magnitude(Vector2.from([x1, y1], [x2, y2])) / 2;
        const d3 = Vector2.magnitude(Vector2.from([x3, y3], cm));
        const largeArc = d3 > br;

        return new Arc(x1, y1, x2, y2, r, r, largeArc, positive, 0);
    }

    @stated
    extrema() {
        const [sa, ea] = this.getStartEndAngles();
        const { rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        // find the root of derivative of parametric equation
        let atanX = Maths.atan((-ry * sinPhi) / (rx * cosPhi));
        const xRoots = [Angle.simplify(atanX), Angle.simplify(atanX + Maths.PI)];
        let atanY = Maths.atan((ry * cosPhi) / (rx * sinPhi));
        const yRoots = [Angle.simplify(atanY), Angle.simplify(atanY + Maths.PI)];

        const epsilon = optioner.options.epsilon;
        const fn = this.getParametricEquation();
        const aRoots = Utility.uniqWith([...xRoots, ...yRoots], (a, b) => Maths.equalTo(a, b, epsilon));
        return aRoots
            .filter(a => {
                return Angle.between(a, sa, ea, this.positive, false, false, epsilon);
            })
            .map(a => [new Point(fn(a)), a] as [point: Point, angle: number]);
    }

    move(deltaX: number, deltaY: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, [deltaX, deltaY]);
        this.point2Coordinates = Vector2.add(this.point2Coordinates, [deltaX, deltaY]);
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, Vector2.from2(angle, distance));
        this.point2Coordinates = Vector2.add(this.point2Coordinates, Vector2.from2(angle, distance));
        return this;
    }

    @stated
    private _centerParameterization() {
        const { point1X, point1Y, point2X, point2Y, radiusX, radiusY, largeArc, positive, rotation } = this;
        return endpointToCenterParameterization({
            point1X,
            point1Y,
            point2X,
            point2Y,
            radiusX,
            radiusY,
            largeArc,
            positive,
            rotation
        });
    }

    getCenterPoint() {
        const { centerX, centerY } = this._centerParameterization();
        return new Point(centerX, centerY);
    }
    @stated
    getStartEndAngles() {
        const { startAngle, endAngle } = this._centerParameterization();
        return [startAngle, endAngle] as [number, number];
    }

    getParametricEquation() {
        return this.toEllipse().getParametricEquation();
    }
    getImplicitFunctionCoefs() {
        return this.toEllipse().getImplicitFunctionCoefs();
    }

    @stated
    toEllipse() {
        const { centerX: cx, centerY: cy } = this._centerParameterization();
        const { rotation: phi, radiusX: rx, radiusY: ry } = this;
        const ellipse = new Ellipse(cx, cy, rx, ry, phi);
        return ellipse;
    }
    isCircularArc() {
        return Maths.equalTo(this.radiusX, this.radiusY, optioner.options.epsilon);
    }

    toCircle() {
        if (!this.isCircularArc()) {
            console.warn("[G]The arc is not a is circular arc, and it can not change to a circle.");
            return null;
        }
        const { centerX: cx, centerY: cy } = this._centerParameterization();
        return new Circle(cx, cy, this.radiusX);
    }

    reverse() {
        this.positive = !this.positive;
        // we need special handling
        const [ox1, oy1] = [this._point1X, this._point1Y];
        const [ox2, oy2] = [this._point2X, this._point2Y];
        [this._point1X, this.point1Y] = [ox2, oy2];
        [this._point2X, this.point2Y] = [ox1, oy1];
        this.trigger_(EventObject.simple(this, this.events.point1XChanged));
        this.trigger_(EventObject.simple(this, this.events.point1YChanged));
        this.trigger_(EventObject.simple(this, this.events.point2XChanged));
        this.trigger_(EventObject.simple(this, this.events.point2YChanged));
    }

    isPointOn(point: [number, number] | Point) {
        return !Number.isNaN(this.getAngleOfPoint(point));
    }
    getAngleOfPoint(point: [number, number] | Point) {
        const a = this.toEllipse().getAngleOfPoint(point);
        const [sa, ea] = this.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return Angle.between(a, sa, ea, this.positive, false, false, epsilon) ? a : NaN;
    }

    private _assertBetweenStartAndEndAngles(value: number, p: string) {
        const [sa, ea] = this.getStartEndAngles();
        Assert.condition(
            Angle.between(value, sa, ea, this.positive, false, false),
            `[G]The \`${p}\` must be ${this.positive ? "positively" : "negatively"} between ${sa}(including) and ${ea}(including).`
        );
    }
    getPointAtAngle(angle: number) {
        this._assertBetweenStartAndEndAngles(angle, "angle");
        return this.toEllipse().getPointAtAngle(angle);
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

    getTangentVectorAtAngle(angle: number, normalized = false): Vector {
        this._assertBetweenStartAndEndAngles(angle, "angle");
        const tv = this.toEllipse().getTangentVectorAtAngle(angle, normalized);
        if (this.positive) {
            return tv;
        } else {
            return tv.negative();
        }
    }
    getNormalVectorAtAngle(angle: number, normalized = false): Vector {
        this._assertBetweenStartAndEndAngles(angle, "angle");
        const nv = this.toEllipse().getNormalVectorAtAngle(angle, normalized);
        if (this.positive) {
            return nv;
        } else {
            return nv.negative();
        }
    }
    getCurvatureAtAngle(angle: number) {
        this._assertBetweenStartAndEndAngles(angle, "angle");
        const c = this.toEllipse().getCurvatureAtAngle(angle);
        return this.positive ? c : -c;
    }

    splitAtAngles(angles: number[]) {
        const [sa, ea] = this.getStartEndAngles();
        Assert.condition(
            angles.every(angle => Angle.between(angle, sa, ea, this.positive, false, false)),
            `[G]The \`angles\` must be all ${this.positive ? "positively" : "negatively"}  between ${sa}(including) and ${ea}(including).`
        );
        const ret: Arc[] = [];
        const epsilon = optioner.options.epsilon;

        angles = Utility.sortBy(
            Utility.uniqWith(
                angles.map(a => Angle.simplify(a)),
                (a, b) => Maths.equalTo(a, b, epsilon)
            ),
            [
                n => {
                    if (this.positive) {
                        if (sa > ea) return n < sa ? n + Maths.PI * 2 : n;
                        return n;
                    } else {
                        if (ea > sa) return n < ea ? -(n + Maths.PI * 2) : -n;
                        return -n;
                    }
                }
            ]
        );
        const cc = this.getCenterPoint().coordinates;
        [sa, ...angles, ea].forEach((_, index, arr) => {
            if (index !== arr.length - 1) {
                ret.push(Arc.fromCenterPointAndStartEndAnglesEtc(cc, this.radiusX, this.radiusY, arr[index], arr[index + 1], this.positive, this.rotation));
            }
        });
        return ret;
    }

    splitAtAngle(angle: number) {
        this._assertBetweenStartAndEndAngles(angle, "angle");
        const [sa, ea] = this.getStartEndAngles();
        const cc = this.getCenterPoint().coordinates;
        return [
            Arc.fromCenterPointAndStartEndAnglesEtc(cc, this.radiusX, this.radiusY, sa, angle, this.positive, this.rotation),
            Arc.fromCenterPointAndStartEndAnglesEtc(cc, this.radiusX, this.radiusY, angle, ea, this.positive, this.rotation)
        ];
    }

    @validGeometryArguments
    getClosestPointFrom(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const [cx, cy] = this.getCenterPoint().coordinates;
        const [sa, ea] = this.getStartEndAngles();
        const { rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const cosPhi2 = cosPhi ** 2;
        const sinPhi2 = sinPhi ** 2;
        const rx2 = rx ** 2;
        const ry2 = ry ** 2;

        const fn = this.getParametricEquation();

        if (cx === x && cy === y && rx2 === ry2) {
            return new Point(fn(sa)); // circle and at centerPoint
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
        const epsilon = optioner.options.epsilon;
        const as = roots.map(r => Angle.simplify(Maths.atan(r) * 2)).filter(a => Angle.between(a, sa, ea, this.positive, true, true, epsilon));
        // Take endpoints into account.
        as.push(sa, ea);

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
        return new Point(fn(minA));
    }

    /**
     * Returns the length of arc `this`.
     * @see https://en.wikipedia.org/wiki/Ellipse#Arc_length
     */
    @stated
    getLength() {
        let [sa, ea] = this.getStartEndAngles();
        const { radiusX: rx, radiusY: ry, positive } = this;

        // Notice: https://en.wikipedia.org/wiki/Ellipse#Arc_length
        // In this section on the page, `a` and `b` here mean `a = rx`, `b = ry`, NOT `a = max(rx, ry)`, `b = min(rx, ry)`.
        // For the eccentric angle is always counted from positive x-axis, if `rx` and `ry` are interchanged, it is obvious that the arc length corresponding to the same eccentric angle are different.
        // But if `a > b` then `m` behind `ksq`(`m = sqrt(ksq)`) below will be an complex.
        // And our integral algorithm doesn't support complex numbers, so we need magic tricks here.

        // determine if we should transpose? to make ksq in $(0,1)$
        const shouldTranspose = rx > ry ? true : false;
        const ksq = shouldTranspose ? 1 - ry ** 2 / rx ** 2 : 1 - rx ** 2 / ry ** 2;
        const integralScalar = shouldTranspose ? rx : ry;

        if (!positive) [sa, ea] = [ea, sa];
        // now positive from sa to ea.
        const sh = heldIntegrals(sa);
        const eh = heldIntegrals(ea);

        // Complete integral is not affected by `shouldTranspose`, It's "complete" after all.
        const oneCompleteIntegral = integralScalar * completeEllipticIntegralOfSecondKind(ksq);

        // cross $2\pi$, 4 + eh - sh; not cross $2\pi$, eh - sh
        const completeCount = sa > ea ? 4 + eh[0] - sh[0] : eh[0] - sh[0];
        const complete = completeCount !== 0 ? completeCount * oneCompleteIntegral : 0;
        const incomplete = calcIncomplete(eh[1]) - calcIncomplete(sh[1]);
        return complete + incomplete;

        function calcIncomplete(angle: number) {
            const sign = Maths.sign(angle);
            const value = Maths.abs(angle);
            // do tricks here
            if (shouldTranspose) {
                // if transposed, we use `oneCompleteIntegral` minus the rest angle to calculate
                return sign * (oneCompleteIntegral - integralScalar * incompleteEllipticIntegralOfSecondKind(Maths.PI / 2 - value, ksq));
            } else {
                return sign * integralScalar * incompleteEllipticIntegralOfSecondKind(value, ksq);
            }
        }
        // Count the held complete integrals and incomplete integral angle(from 0) of a angle.
        // the first element of the tuple is count of complete integral
        // the second element of the tuple is the remaining angle for incomplete integral, and it is in interval of $(-\frac{\pi}{2},\frac{\pi}{2})$
        function heldIntegrals(angle: number) {
            const h1Pi = Maths.PI * 0.5;
            const h2Pi = Maths.PI;
            const h3Pi = Maths.PI * 1.5;
            const h4Pi = Maths.PI * 2;
            let held: [completeIntegralCount: number, incompleteIntegralAngle: number] = [0, 0];
            if (angle >= 0 && angle < h1Pi) held = [0, angle];
            if (angle >= h1Pi && angle < h2Pi) held = [2, -(h2Pi - angle)];
            if (angle >= h2Pi && angle < h3Pi) held = [2, angle - h2Pi];
            if (angle >= h3Pi && angle < h4Pi) held = [4, -(h4Pi - angle)];
            return held;
        }
    }

    toPath(closed = false) {
        const path = new Path();
        const { point1Coordinates: c1, point2Coordinates: c2, radiusX, radiusY, rotation, largeArc, positive } = this;
        path.appendCommand(Path.moveTo(c1));
        path.appendCommand(Path.arcTo(radiusX, radiusY, rotation, largeArc, positive, c2));
        path.closed = closed;
        return path;
    }

    apply(transformation: Transformation) {
        if (transformation.span() !== 2) return null;
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2, radiusX: rx, radiusY: ry, rotation: phi, largeArc: la, positive: p } = this;
        const ep = endpointParameterizationTransform(
            {
                point1X: x1,
                point1Y: y1,
                point2X: x2,
                point2Y: y2,
                radiusX: rx,
                radiusY: ry,
                largeArc: la,
                positive: p,
                rotation: phi
            },
            transformation.matrix
        );
        return new Arc(ep.point1X, ep.point1Y, ep.point2X, ep.point2Y, ep.radiusX, ep.radiusY, ep.largeArc, ep.positive, ep.rotation);
    }

    getGraphics(viewport: ViewportDescriptor) {
        const g = new GeometryGraphics();
        if (!this.initialized_()) return g;
        const { point1Coordinates: c1, point2Coordinates: c2, radiusX: rx, radiusY: ry, rotation: rotation, largeArc: largeArc, positive: positive } = this;
        g.moveTo(...c1);
        g.endpointArcTo(rx, ry, rotation, largeArc, positive, ...c2);
        return g;
    }

    clone() {
        return new Arc(this.point1X, this.point1Y, this.point2X, this.point2Y, this.radiusX, this.radiusY, this.largeArc, this.positive, this.rotation);
    }

    copyFrom(shape: Arc | null) {
        if (shape === null) shape = new Arc();
        // make `_inputRadiusX` and `_inputRadiusY` to `NaN` first, avoid redundant calls of `_correctAndSetRadii`
        this._inputRadiusX = NaN;
        this._inputRadiusY = NaN;

        this._setPoint1X(shape._point1X);
        this._setPoint1Y(shape._point1Y);
        this._setPoint2X(shape._point2X);
        this._setPoint2Y(shape._point2Y);
        // assign `rotation` first for handling `radiusX` and `radiusY`
        this._setRotation(shape._rotation);
        this._setRadiusX(shape._radiusX);
        this._setRadiusY(shape._radiusY);
        this._setLargeArc(shape._largeArc);
        this._setPositive(shape._positive);
        return this;
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tpoint1X: ${this.point1X}`,
            `\tpoint1Y: ${this.point1Y}`,
            `\tpoint2X: ${this.point2X}`,
            `\tpoint2Y: ${this.point2Y}`,
            `\tradiusX: ${this.radiusX}`,
            `\tradiusY: ${this.radiusY}`,
            `\tlargeArc: ${this.largeArc}`,
            `\tpositive: ${this.positive}`,
            `\trotation: ${this.rotation}`,
            `}`
        ].join("\n");
    }
    toArray() {
        return [this.point1X, this.point1Y, this.point2X, this.point2Y, this.radiusX, this.radiusY, this.largeArc, this.positive, this.rotation];
    }
    toObject() {
        return {
            point1X: this.point1X,
            point1Y: this.point1Y,
            point2X: this.point2X,
            point2Y: this.point2Y,
            radiusX: this.radiusX,
            radiusY: this.radiusY,
            largeArc: this.largeArc,
            positive: this.positive,
            rotation: this.rotation
        };
    }
}

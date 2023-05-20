import { Angle, Assert, Coordinates, Float, Maths, Polynomial, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { eps } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import { centerToEndpointParameterization, endpointParameterizationTransform, endpointToCenterParameterization, flexCorrectRadii } from "../../misc/arc";
import { validGeometry, validGeometryArguments } from "../../misc/decor-geometry";
import { stated, statedWithBoolean } from "../../misc/decor-stated";
import { completeEllipticIntegralOfSecondKind, incompleteEllipticIntegralOfSecondKind } from "../../misc/elliptic-integral";
import { getCoordinates } from "../../misc/point-like";
import type Transformation from "../../transformation";
import type { FiniteOpenGeometry, PathCommand, ViewportDescriptor } from "../../types";
import Path from "../general/Path";
import Circle from "./Circle";
import Ellipse from "./Ellipse";
import LineSegment from "./LineSegment";
import Point from "./Point";
import type Vector from "./Vector";

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
        this.initState_();
    }

    static override events = {
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

    private _setPoint1X(value: number) {
        if (Utility.is(this._point1X, value)) return;
        this._point1X = value;
        this.trigger_(new EventSourceObject(this, Arc.events.point1XChanged));
        this._correctAndSetRadii();
    }
    private _setPoint1Y(value: number) {
        if (Utility.is(this._point1Y, value)) return;
        this._point1Y = value;
        this.trigger_(new EventSourceObject(this, Arc.events.point1YChanged));
        this._correctAndSetRadii();
    }
    private _setPoint2X(value: number) {
        if (Utility.is(this._point2X, value)) return;
        this._point2X = value;
        this.trigger_(new EventSourceObject(this, Arc.events.point2XChanged));
        this._correctAndSetRadii();
    }
    private _setPoint2Y(value: number) {
        if (Utility.is(this._point2Y, value)) return;
        this._point2Y = value;
        this.trigger_(new EventSourceObject(this, Arc.events.point2YChanged));
        this._correctAndSetRadii();
    }
    private _setRadiusX(value: number) {
        if (Utility.is(this._radiusX, value)) return;
        this._radiusX = value;
        this.trigger_(new EventSourceObject(this, Arc.events.radiusXChanged));
        this._correctAndSetRadii();
    }
    private _setRadiusY(value: number) {
        if (Utility.is(this._radiusY, value)) return;
        this._radiusY = value;
        this.trigger_(new EventSourceObject(this, Arc.events.radiusYChanged));
        this._correctAndSetRadii();
    }
    private _setLargeArc(value: boolean) {
        if (Utility.is(this._largeArc, value)) return;
        this._largeArc = value;
        this.trigger_(new EventSourceObject(this, Arc.events.largeArcChanged));
    }
    private _setPositive(value: boolean) {
        if (Utility.is(this._positive, value)) return;
        this._positive = value;
        this.trigger_(new EventSourceObject(this, Arc.events.positiveChanged));
    }
    private _setRotation(value: number) {
        if (Utility.is(this._rotation, value)) return;
        this._rotation = value;
        this.trigger_(new EventSourceObject(this, Arc.events.rotationChanged));
        this._correctAndSetRadii();
    }

    private _correctAndSetRadii() {
        // prettier-ignore
        const { _point1X, _point1Y, _point2X, _point2Y, _radiusX, _radiusY, _rotation } = this;
        // prettier-ignore
        const correctPrecondition = (
            !Number.isNaN(_point1X) &&
            !Number.isNaN(_point1Y) &&
            !Number.isNaN(_point2X) && 
            !Number.isNaN(_point2Y) &&
            !Number.isNaN(_radiusX) &&
            !Number.isNaN(_radiusY)
        )
        if (correctPrecondition) {
            let rx: number;
            let ry: number;
            if (_radiusX === 0 && _radiusY === 0) {
                Maths.random() > 0.5 ? (this._radiusX = 1) : (this._radiusY = 1);
            }
            if (_radiusX === 0 || _radiusY === 0) {
                [rx, ry] = [_radiusX, _radiusY];
            } else {
                [rx, ry] = flexCorrectRadii(_point1X, _point1Y, _point2X, _point2Y, _radiusX, _radiusY, _rotation);
            }
            if (!Utility.is(this._radiusX, rx)) {
                this._radiusX = rx;
                this.trigger_(new EventSourceObject(this, Arc.events.radiusXChanged));
            }
            if (!Utility.is(this._radiusY, ry)) {
                this._radiusY = ry;
                this.trigger_(new EventSourceObject(this, Arc.events.radiusYChanged));
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

    initialized() {
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
    degenerate(check: false): Point | LineSegment | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;
        const { _radiusX: rx, _radiusY: ry, point1Coordinates: c1, point2Coordinates: c2 } = this;
        const rx0 = Float.equalTo(rx, 0, Float.MACHINE_EPSILON);
        const ry0 = Float.equalTo(ry, 0, Float.MACHINE_EPSILON);
        const c12 = Coordinates.equalTo(c1, c2, Float.MACHINE_EPSILON);

        if (check) return rx0 || ry0 || c12;

        if (c12) return new Point(c1);
        if ((rx0 && !ry0) || (!rx0 && ry0)) return new LineSegment(c1, c2);
        return this;
    }

    @validGeometryArguments
    static fromCenterAndStartEndAnglesEtc(center: [number, number] | Point, radiusX: number, radiusY: number, startAngle: number, endAngle: number, positive: boolean, rotation = 0) {
        Assert.isNonNegativeNumber(radiusX, "radiusX");
        Assert.isNonNegativeNumber(radiusY, "radiusY");
        Assert.isRealNumber(startAngle, "startAngle");
        Assert.isRealNumber(endAngle, "endAngle");
        Assert.isRealNumber(rotation, "rotation");
        // This must be done to prevent a full arc(ellipse).
        startAngle = Angle.simplify(startAngle);
        endAngle = Angle.simplify(endAngle);

        const [cx, cy] = getCoordinates(center, "center");
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
    @validGeometryArguments
    static fromThreePointsCircular(point1: [number, number] | Point, point2: [number, number] | Point, radiusControlPoint: [number, number] | Point) {
        const [x1, y1] = getCoordinates(point1, "point1");
        const [x2, y2] = getCoordinates(point2, "point2");
        const [x3, y3] = getCoordinates(radiusControlPoint, "radiusControlPoint");

        if (Point.isThreePointsCollinear([x1, y1], [x2, y2], [x3, y3])) {
            return null; // circle center at infinity
        }

        const a = 2 * (x2 - x1);
        const b = 2 * (y2 - y1);
        const c = x2 ** 2 + y2 ** 2 - x1 ** 2 - y1 ** 2;
        const d = 2 * (x3 - x2);
        const e = 2 * (y3 - y2);
        const f = x3 ** 2 + y3 ** 2 - x2 ** 2 - y2 ** 2;
        const cx = (b * f - e * c) / (b * d - e * a);
        const cy = (d * c - a * f) / (b * d - e * a);
        const r = Maths.hypot(cx - x1, cy - y1);

        const v12 = Vector2.from([x1, y1], [x2, y2]);
        const v13 = Vector2.from([x1, y1], [x3, y3]);
        const positive = Vector2.cross(v12, v13) < 0;

        const cm = [(x1 + x2) / 2, (y1 + y2) / 2] as [number, number];
        const br = Vector2.magnitude(Vector2.from([x1, y1], [x2, y2])) / 2;
        const d3 = Vector2.magnitude(Vector2.from([x3, y3], cm));
        const largeArc = d3 > br;

        return new Arc(x1, y1, x2, y2, r, r, largeArc, positive, 0);
    }

    /**
     * Returns an array of angle indicate at what angle, arc `this` has max/min x/y coordinate value.
     */
    @stated
    extrema() {
        const [sa, ea] = this.getStartEndAngles();
        const { rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        // find the root of derivative of parametric equation
        const atanX = Maths.atan((-ry * sinPhi) / (rx * cosPhi));
        const xRoots = [Angle.simplify(atanX), Angle.simplify(atanX + Maths.PI)];
        const atanY = Maths.atan((ry * cosPhi) / (rx * sinPhi));
        const yRoots = [Angle.simplify(atanY), Angle.simplify(atanY + Maths.PI)];
        const roots = [...xRoots, ...yRoots].filter(a => Angle.between(a, sa, ea, this.positive, false, false, eps.angleEpsilon));
        return Utility.uniqWith(roots, (a, b) => Angle.equalTo(a, b, eps.angleEpsilon));
    }

    move(deltaX: number, deltaY: number) {
        this.point1Coordinates = Vector2.add(this.point1Coordinates, [deltaX, deltaY]);
        this.point2Coordinates = Vector2.add(this.point2Coordinates, [deltaX, deltaY]);
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
    // @stated _centerParameterization
    getCenter() {
        const { centerX, centerY } = this._centerParameterization();
        return new Point(centerX, centerY);
    }
    // @stated _centerParameterization
    getStartEndAngles() {
        const { startAngle, endAngle } = this._centerParameterization();
        return [startAngle, endAngle] as [number, number];
    }
    @stated
    getParametricEquation() {
        return this.toEllipse().getParametricEquation();
    }
    @stated
    getImplicitFunctionCoefs() {
        return this.toEllipse().getImplicitFunctionCoefs();
    }
    @stated
    toEllipse() {
        const { centerX: cx, centerY: cy } = this._centerParameterization();
        const { _rotation: phi, _radiusX: rx, _radiusY: ry } = this;
        const ellipse = new Ellipse(cx, cy, rx, ry, phi);
        return ellipse;
    }
    @stated
    isCircularArc() {
        return Float.equalTo(this.radiusX, this.radiusY, eps.epsilon);
    }
    @stated
    toCircleByRadiusX() {
        const { centerX: cx, centerY: cy } = this._centerParameterization();
        return new Circle(cx, cy, this._radiusX);
    }
    @stated
    toCircleByRadiusY() {
        const { centerX: cx, centerY: cy } = this._centerParameterization();
        return new Circle(cx, cy, this._radiusY);
    }
    reverse() {
        this._positive = !this._positive;
        // prettier-ignore
        [
            [this._point1X, this._point1Y],
            [this._point2X, this._point2Y]
        ] = [
            [this._point2X, this._point2Y],
            [this._point1X, this._point1Y]
        ];
        this.trigger_(new EventSourceObject(this, Arc.events.positiveChanged));
        this.trigger_(new EventSourceObject(this, Arc.events.point1XChanged));
        this.trigger_(new EventSourceObject(this, Arc.events.point1YChanged));
        this.trigger_(new EventSourceObject(this, Arc.events.point2XChanged));
        this.trigger_(new EventSourceObject(this, Arc.events.point2YChanged));
        return this;
    }
    @validGeometryArguments
    isPointOn(point: [number, number] | Point) {
        return !Number.isNaN(this.getAngleOfPoint(point));
    }
    @validGeometryArguments
    getAngleOfPoint(point: [number, number] | Point) {
        const a = this.toEllipse().getAngleOfPoint(point);
        if (Number.isNaN(a)) return a;
        const [sa, ea] = this.getStartEndAngles();
        const positive = this.positive;
        return Angle.between(a, sa, ea, positive, false, false, eps.angleEpsilon) ? Angle.clamp(a, sa, ea, positive) : NaN;
    }
    getPointAtAngle(a: number) {
        a = this._clampAngle(a, "a");
        return this.toEllipse().getPointAtAngle(a);
    }
    @stated
    getBoundingBox() {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        const extrema = this.extrema().map(a => this.getParametricEquation()(a));
        // Take endpoints into account
        extrema.concat([this.point1Coordinates, this.point2Coordinates]).forEach(c => {
            const [x, y] = c;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });
        return [minX, minY, maxX - minX, maxY - minY] as [number, number, number, number];
    }
    private _clampAngle(a: number, p: string) {
        Assert.isRealNumber(a, p);
        const { startAngle: sa, endAngle: ea } = this._centerParameterization();
        const positive = this.positive;
        if (!Angle.between(a, sa, ea, positive, false, false)) {
            console.warn(`[G]The \`${p}\` with value \`${a}\` is not ${positive ? "positively" : "negatively"} between \`${sa}\`(including) and \`${ea}\`(including). It will be clamped.`);
        }
        return Angle.clamp(a, sa, ea, positive);
    }
    getTangentVectorAtAngle(a: number, normalized = false) {
        a = this._clampAngle(a, "a");
        const tv = this.toEllipse().getTangentVectorAtAngle(a, normalized);
        return (this.positive ? tv : tv.negative()) as Vector; // help for dts-bundle-generator
    }
    getNormalVectorAtAngle(a: number, normalized = false) {
        a = this._clampAngle(a, "a");
        const nv = this.toEllipse().getNormalVectorAtAngle(a, normalized);
        return (this.positive ? nv : nv.negative()) as Vector; // help for dts-bundle-generator
    }
    getCurvatureAtAngle(a: number) {
        a = this._clampAngle(a, "a");
        const c = this.toEllipse().getCurvatureAtAngle(a);
        return this.positive ? c : -c; // ellipse is defined with positive rotation but arc may not
    }
    getOsculatingCircleAtAngle(a: number) {
        a = this._clampAngle(a, "a");
        return this.toEllipse().getOsculatingCircleAtAngle(a);
    }
    // Sort the angles by the `this.positive` from start angle to end angle, this is very important.
    private _anglesOrder(as: number[]) {
        const { startAngle: sa, endAngle: ea } = this._centerParameterization();
        return Utility.sortBy(
            [...as],
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
    }
    splitAtAngle(a: number) {
        a = this._clampAngle(a, "a");
        const { centerX, centerY, startAngle, endAngle } = this._centerParameterization();
        const portion1 = Arc.fromCenterAndStartEndAnglesEtc([centerX, centerY], this.radiusX, this.radiusY, startAngle, a, this.positive, this.rotation);
        const portion2 = Arc.fromCenterAndStartEndAnglesEtc([centerX, centerY], this.radiusX, this.radiusY, a, endAngle, this.positive, this.rotation);
        // Do this to get better precision.
        portion1._point1X = this._point1X;
        portion1._point1Y = this._point1Y;
        portion2._point2X = this._point2X;
        portion2._point2Y = this._point2Y;
        return [portion1, portion2] as [Arc, Arc];
    }
    splitAtAngles(as: number[]) {
        const [sa, ea] = this.getStartEndAngles();
        const ret: Arc[] = [];
        as = as.map(a => this._clampAngle(a, "element of as"));
        as = this._anglesOrder(Utility.uniqWith(as, (a, b) => Angle.equalTo(a, b, eps.angleEpsilon)));
        const cc = this.getCenter().coordinates;
        [sa, ...as, ea].forEach((_, index, arr) => {
            if (index !== arr.length - 1) {
                ret.push(Arc.fromCenterAndStartEndAnglesEtc(cc, this.radiusX, this.radiusY, arr[index], arr[index + 1], this.positive, this.rotation));
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
    portionOf(a1: number, a2: number) {
        a1 = this._clampAngle(a1, "a1");
        a2 = this._clampAngle(a2, "a2");
        const { centerX, centerY } = this._centerParameterization();
        [a1, a2] = this._anglesOrder([a1, a2]);
        return Arc.fromCenterAndStartEndAnglesEtc([centerX, centerY], this.radiusX, this.radiusY, a1, a2, this.positive, this.rotation);
    }
    portionOfExtend(a1: number, a2: number) {
        Assert.isRealNumber(a1, "t1");
        Assert.isRealNumber(a2, "t2");
        const { centerX, centerY } = this._centerParameterization();
        [a1, a2] = this._anglesOrder([a1, a2]);
        return Arc.fromCenterAndStartEndAnglesEtc([centerX, centerY], this.radiusX, this.radiusY, a1, a2, this.positive, this.rotation);
    }
    @validGeometryArguments
    getClosestPointFromPoint(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const [cx, cy] = this.getCenter().coordinates;
        const [sa, ea] = this.getStartEndAngles();
        const { rotation: phi, radiusX: rx, radiusY: ry } = this;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const cosPhi2 = cosPhi ** 2;
        const sinPhi2 = sinPhi ** 2;
        const rx2 = rx ** 2;
        const ry2 = ry ** 2;

        const fn = this.getParametricEquation();

        if (cx === x && cy === y && rx === ry) {
            return [new Point(fn(sa)), rx2] as [point: Point, distanceSquare: number]; // circle and at center
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
        const as = roots.map(r => Angle.simplify(Maths.atan(r) * 2)).filter(a => Angle.between(a, sa, ea, this.positive, true, true, eps.angleEpsilon));
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
        return [new Point(fn(minA)), minSd] as [point: Point, distanceSquare: number];
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
        const commands: PathCommand[] = [];
        const { point1Coordinates: c1, point2Coordinates: c2, radiusX, radiusY, rotation, largeArc, positive } = this;
        commands.push(Path.moveTo(c1));
        commands.push(Path.arcTo(radiusX, radiusY, rotation, largeArc, positive, c2));
        return new Path(commands, closed);
    }
    apply(transformation: Transformation) {
        const { _point1X: x1, _point1Y: y1, _point2X: x2, _point2Y: y2, _radiusX: rx, _radiusY: ry, _rotation: phi, _largeArc: la, _positive: p } = this;
        const ep = endpointParameterizationTransform({ point1X: x1, point1Y: y1, point2X: x2, point2Y: y2, radiusX: rx, radiusY: ry, largeArc: la, positive: p, rotation: phi }, transformation.matrix);
        return new Arc(ep.point1X, ep.point1Y, ep.point2X, ep.point2Y, ep.radiusX, ep.radiusY, ep.largeArc, ep.positive, ep.rotation);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>).getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const { point1Coordinates: c1, point2Coordinates: c2, radiusX: rx, radiusY: ry, rotation: rotation, largeArc: largeArc, positive: positive } = this;
        gg.moveTo(...c1);
        gg.endpointArcTo(rx, ry, rotation, largeArc, positive, ...c2);
        return g;
    }
    clone() {
        const ret = new Arc();
        ret._point1X = this._point1X;
        ret._point1Y = this._point1Y;
        ret._point2X = this._point2X;
        ret._point2Y = this._point2Y;
        ret._radiusX = this._radiusX;
        ret._radiusY = this._radiusY;
        ret._largeArc = this._largeArc;
        ret._positive = this._positive;
        ret._rotation = this._rotation;
        return ret;
    }
    copyFrom(shape: Arc | null) {
        if (shape === null) shape = new Arc();
        // make `_inputRadiusX` and `_inputRadiusY` to `NaN` first, avoid redundant calls of `_correctAndSetRadii`
        this._radiusX = NaN;
        this._radiusY = NaN;

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
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            point1X: this._point1X,
            point1Y: this._point1Y,
            point2X: this._point2X,
            point2Y: this._point2Y,
            radiusX: this._radiusX,
            radiusY: this._radiusY,
            largeArc: this._largeArc,
            positive: this._positive,
            rotation: this._rotation
        };
    }
}

import { Angle, Assert, Coordinates, Maths, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { optioner } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import Inversion from "../../inversion";
import { centerToEndpointParameterization } from "../../misc/arc";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import { validGeometry } from "../../misc/decor-geometry";
import { getCoordinates } from "../../misc/point-like";
import type Transformation from "../../transformation";
import type { ClosedGeometry, ViewportDescriptor, WindingDirection } from "../../types";
import Path from "../general/Path";
import Arc from "./Arc";
import Line from "./Line";
import Point from "./Point";
import RegularPolygon from "./RegularPolygon";
import Vector from "./Vector";

@validGeometry
export default class Circle extends Geometry implements ClosedGeometry {
    private _centerX = NaN;
    private _centerY = NaN;
    private _radius = NaN;

    constructor(centerX: number, centerY: number, radius: number);
    constructor(centerCoordinates: [number, number], radius: number);
    constructor(centerPoint: Point, radius: number);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { centerX: a0, centerY: a1, radius: a2 });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { centerCoordinates: a0, radius: a1 });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { centerPoint: a0, radius: a1 });
        }
    }

    static override events = {
        centerXChanged: "centerX" as const,
        centerYChanged: "centerY" as const,
        radiusChanged: "radius" as const
    };

    private _setCenterX(value: number) {
        if (!Utility.isEqualTo(this._centerX, value)) this.trigger_(new EventSourceObject(this, Circle.events.centerXChanged));
        this._centerX = value;
    }
    private _setCenterY(value: number) {
        if (!Utility.isEqualTo(this._centerY, value)) this.trigger_(new EventSourceObject(this, Circle.events.centerYChanged));
        this._centerY = value;
    }
    private _setRadius(value: number) {
        if (!Utility.isEqualTo(this._radius, value)) this.trigger_(new EventSourceObject(this, Circle.events.radiusChanged));
        this._radius = value;
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
    get radius() {
        return this._radius;
    }
    set radius(value) {
        Assert.isNonNegativeNumber(value, "radius");
        this._setRadius(value);
    }

    @stated
    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._centerX) &&
            !Number.isNaN(this._centerY) &&
            !Number.isNaN(this._radius)
        );
    }
    degenerate(check: false): Point | this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;

        const r0 = Maths.equalTo(this._radius, 0, optioner.options.epsilon);
        if (check) return r0;

        if (r0) return new Point(this._centerX, this._centerY);
        return this;
    }

    move(deltaX: number, deltaY: number) {
        this.centerCoordinates = Vector2.add(this.centerCoordinates, [deltaX, deltaY]);
        return this;
    }

    static fromTwoPoints(centerPoint: [number, number] | Point, radiusControlPoint: [number, number] | Point) {
        const cc = getCoordinates(centerPoint, "centerPoint");
        const cr = getCoordinates(radiusControlPoint, "radiusControlPoint");
        const r = Vector2.magnitude(Vector2.from(cc, cr));
        return new Circle(cc, r);
    }
    static fromThreePoints(point1: [number, number] | Point, point2: [number, number] | Point, point3: [number, number] | Point) {
        const [x1, y1] = getCoordinates(point1, "point1");
        const [x2, y2] = getCoordinates(point2, "point2");
        const [x3, y3] = getCoordinates(point3, "point3");

        if (Point.isThreePointsCollinear([x1, y1], [x2, y2], [x3, y3])) {
            return null; // circle centerPoint at infinity
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

        return new Circle(cx, cy, r);
    }

    /**
     * Returns the length of circle `this`.
     */
    getLength() {
        return 2 * Maths.PI * this.radius;
    }
    /**
     * Returns the area of circle `this`.
     */
    getArea() {
        return Maths.PI * this.radius ** 2;
    }
    /**
     * Returns a function as parametric equation of circle `this`.
     */
    getParametricEquation() {
        const { centerCoordinates: cc, radius: r } = this;
        return function (angle: number) {
            return Vector2.add(cc, Vector2.from2(angle, r));
        };
    }
    /**
     * Returns the winding direction of circle `this`.
     * @note
     * This method always returns 1(WindingDirection.positive).
     */
    getWindingDirection(): WindingDirection {
        return 1;
    }
    /**
     * Returns the point
     * @param angle
     */
    getPointAtAngle(angle: number) {
        return new Point(this.getParametricEquation()(angle));
    }
    getAngleOfPoint(point: [number, number] | Point) {
        const { centerCoordinates: cc } = this;
        const c = getCoordinates(point, "point");
        if (this.isPointOn(c)) return Angle.simplify(Vector2.angle(Vector2.from(cc, c)));
        return NaN;
    }
    /**
     * Returns the coefficients of the implicit function $ax^2+bx+cxy+dy+ey^2+f=0$
     */
    getImplicitFunctionCoefs() {
        const { centerX: cx, centerY: cy, radius: r } = this;
        const a = 1;
        const b = -2 * cx;
        const c = 0;
        const d = -2 * cy;
        const e = 1;
        const f = cx ** 2 + cy ** 2 - r ** 2;
        return [a, b, c, d, e, f];
    }
    getArcBetweenAngles(startAngle: number, endAngle: number, positive = true): null | Arc {
        const sa = Angle.simplify(startAngle);
        const ea = Angle.simplify(endAngle);
        return Arc.fromCenterPointAndStartEndAnglesEtc(this.centerCoordinates, this.radius, this.radius, sa, ea, positive);
    }
    isPointOn(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const sd = Vector2.squaredMagnitude(Vector2.from(this.centerCoordinates, c));
        const sr = this.radius ** 2;
        return Maths.equalTo(sd, sr, optioner.options.epsilon);
    }
    isPointOutside(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const sd = Vector2.squaredMagnitude(Vector2.from(this.centerCoordinates, c));
        const sr = this.radius ** 2;
        return Maths.greaterThan(sd, sr, optioner.options.epsilon);
    }
    isPointInside(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const sd = Vector2.squaredMagnitude(Vector2.from(this.centerCoordinates, c));
        const sr = this.radius ** 2;
        return Maths.lessThan(sd, sr, optioner.options.epsilon);
    }

    getClosestPointFrom(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const [cx, cy] = this.centerCoordinates;
        // if `point` is exactly the same as the `centerPoint`, then zero vector, then angle 0.
        const angle = Vector2.angle(Vector2.from([cx, cy], [x, y]));
        return this.getPointAtAngle(angle);
    }

    /**
     * Get the tangent vector of circle `this` at angle `a`.
     * @param a
     * @param normalized
     */
    getTangentVectorAtAngle(a: number, normalized = false) {
        const r = this.radius;
        const [dx, dy] = [-r * Maths.sin(a), r * Maths.cos(a)];
        const tv = [dx, dy] as [number, number];
        const c = this.getParametricEquation()(a);
        return normalized ? new Vector(c, Vector2.normalize(tv)) : new Vector(c, tv);
    }
    /**
     * Get the normal vector of circle `this` at angle `a`.
     * @param a
     * @param normalized
     */
    getNormalVectorAtAngle(a: number, normalized = false) {
        const c = this.getParametricEquation()(a);
        const nv = Vector2.from(c, this.centerCoordinates);
        return normalized ? new Vector(c, Vector2.normalize(nv)) : new Vector(c, nv);
    }
    /**
     * Returns the tangent line of circle `this` from point `point` outside circle `this`.
     * @description
     * Cases:
     * - If `point` is outside `this`, return the tangent lines.
     * - If `point` is not outside `this`, return `[]`.
     */
    getTangentLinesFromPointOutside(point: [number, number] | Point): [] | [[line: Line, tangentPoint: Point], [line: Line, tangentPoint: Point]] {
        if (!this.isPointOutside(point)) return [];
        const ci = getCoordinates(point, "point");
        const cc = this.centerCoordinates;
        const vi = Vector2.from(cc, ci);
        const d = Vector2.magnitude(vi);
        const ia = Maths.acos(this.radius / d);
        const angles = [-ia, ia];

        let ret = angles.map(a => {
            const vt = Vector2.scalarMultiply(Vector2.rotate(vi, a), this.radius / d);
            const c = Vector2.add(cc, vt);
            return [Line.fromTwoPoints(ci, c), new Point(c)];
        });
        return ret as [[line: Line, tangentPoint: Point], [line: Line, tangentPoint: Point]];
    }
    /**
     * Whether circle `circle` is orthogonal to circle `this`.
     * @description
     * If two circles intersect in two points, and the radii drawn to the points of intersection meet at right angles,
     * then the circles are orthogonal to each other.
     */
    isOrthogonalToCircle(circle: Circle) {
        const { centerCoordinates: cc1, radius: r1 } = this;
        const { centerCoordinates: cc2, radius: r2 } = circle;
        const sd = Vector2.squaredMagnitude(Vector2.from(cc1, cc2));
        const epsilon = optioner.options.epsilon;
        return Maths.equalTo(r1 ** 2 + r2 ** 2, sd, epsilon);
    }
    /**
     * Returns the common tangent lines of circle `circle1` and circle `circle2`
     * @description
     * Cases:
     * - If two circles are equal/coinciding, no common tangent line (or infinite common tangent lines).
     * - If two circles are one containing another, no common tangent line.
     * - If two circles are touching each other internally, 1 common tangent line, the tangent line through touching point(coincident direct common tangent lines).
     * - If two circles are intersecting, 2 common tangent lines, the 2 direct common tangent lines.
     * - If two circles are touching each other externally, 3 common tangent lines, including the tangent line through touching point(coincident transverse common tangent lines) and 2 direct common tangent lines.
     * - If two circles are separating, 4 common tangent lines, including 2 transverse common tangent lines and 2 direct common tangent lines.
     * @param circle1
     * @param circle2
     */
    static getCommonTangentLinesOfTwoCircles(circle1: Circle, circle2: Circle): [] | [line: Line, points: [tangentPointOnCircle1: Point, tangentPointOnCircle2: Point]][] {
        const data = [] as [line: Line, points: [tangentPointOnCircle1: Point, tangentPointOnCircle2: Point]][];

        const epsilon = optioner.options.epsilon;

        const { centerCoordinates: cc1, radius: r1 } = circle1;
        const { centerCoordinates: cc2, radius: r2 } = circle2;

        const v = Vector2.from(cc1, cc2);
        const angle1 = Vector2.angle(v);
        const angle2 = angle1 + Maths.PI;
        const d = Vector2.magnitude(v);
        const sr = r1 + r2;
        const dr = Maths.abs(r1 - r2);

        // condition 0
        if (Maths.equalTo(d, 0, epsilon) && Maths.equalTo(dr, 0, epsilon)) {
            return data;
        }

        const drCosine = dr / d;
        if (Maths.equalTo(drCosine, 1, epsilon)) {
            const a = r1 > r2 ? angle1 : angle2;
            const c = r1 > r2 ? circle1 : circle2;
            const p = c.getPointAtAngle(a);
            data.push([c.getTangentVectorAtAngle(a).toLine()!, [p, p]]);
        } else if (Maths.lessThan(drCosine, 1, epsilon)) {
            const da = Maths.acos(drCosine);
            const a = r1 > r2 ? angle1 : angle2;
            const p1p = circle1.getPointAtAngle(a + da);
            const p2p = circle2.getPointAtAngle(a + da);
            const p1m = circle1.getPointAtAngle(a - da);
            const p2m = circle2.getPointAtAngle(a - da);
            data.push([Line.fromTwoPoints(p1p, p2p)!, [p1p, p2p]]);
            data.push([Line.fromTwoPoints(p1m, p2m)!, [p1m, p2m]]);
        } else {
            // greater than 1, acos NaN
        }

        const srCosine = sr / d;
        if (Maths.equalTo(srCosine, 1, epsilon)) {
            const p = circle1.getPointAtAngle(angle1);
            data.push([circle1.getTangentVectorAtAngle(angle1).toLine()!, [p, p]]);
        } else if (Maths.lessThan(srCosine, 1, epsilon)) {
            const da = Maths.acos(srCosine);
            const p1p = circle1.getPointAtAngle(angle1 + da);
            const p2p = circle2.getPointAtAngle(angle2 + da);
            const p1m = circle1.getPointAtAngle(angle1 - da);
            const p2m = circle2.getPointAtAngle(angle2 - da);
            data.push([Line.fromTwoPoints(p1p, p2p)!, [p1p, p2p]]);
            data.push([Line.fromTwoPoints(p1m, p2m)!, [p1m, p2m]]);
        } else {
            // greater than 1, acos NaN
        }
        return data;
    }
    /**
     * Returns the common tangent circle of circle `circle1` and circle `circle2` which passing through point `point`.
     * @description
     * Cases when there is no common tangent circle:
     * - If two circles are equal/coinciding, there are infinite common tangent circles from any point, `[]` will be returns.
     * - If two circles are one containing another:
     *      - If `point` is inside the contained circle, there is no common tangent circle, `[]` will be returned.
     *      - If `point` is outside both circles, there is no common tangent circle, `[]` will be returned.
     * - If two circles are touching each other internally:
     *      - If `point` is at the touching point, there are infinite common tangent circles, `[]` will be returned.
     * - If two circles are intersecting:
     *      - If `point` is at the intersecting point, there is no common tangent circle, `[]` will be returned.
     * - If two circles are touching each other externally:
     *      - If `point` is at the touching point, there are infinite common tangent circles, `[]` will be returned.
     * - If two circles are separating:
     *      - If `point` is inside either circle, there is no common tangent circle, `[]` will be returned.
     * @param  circle1
     * @param  circle2
     * @param  point
     */
    static getCommonTangentCirclesOfTwoCirclesThroughPoint(circle1: Circle, circle2: Circle, point: [number, number] | Point): Circle[] | [] {
        if (circle1.isPointOn(point) && circle2.isPointOn(point)) return [];
        const epsilon = optioner.options.epsilon;
        if (Maths.equalTo(circle1.radius, circle2.radius, epsilon) && Coordinates.isEqualTo(circle1.centerCoordinates, circle2.centerCoordinates, epsilon)) return [];

        const c = getCoordinates(point, "point");
        const inversion = new Inversion(c);
        const inverse1 = inversion.invertCircle(circle1);
        const inverse2 = inversion.invertCircle(circle2);
        const inverse1IsLine = inverse1 instanceof Line;
        const inverse2IsLine = inverse2 instanceof Line;

        if (!inverse1IsLine && !inverse2IsLine) {
            const data = Circle.getCommonTangentLinesOfTwoCircles(inverse1, inverse2);
            const ret: Circle[] = [];
            data.forEach(d => {
                const inv = inversion.invertLine(d[0]);
                if (inv instanceof Circle) {
                    ret.push(inv);
                }
            });
            return ret;
        }

        // treat line as infinite circle, and find the common tangent lines manually
        if ((inverse1IsLine && !inverse2IsLine) || (!inverse1IsLine && inverse2IsLine)) {
            const circle = (inverse1IsLine ? inverse2 : inverse1) as Circle;
            const line = (inverse1IsLine ? inverse1 : inverse2) as Line;
            const cc = circle.centerCoordinates;
            const cp = line.getClosestPointFrom(cc).coordinates;

            let angles: number[];
            if (circle.isPointOn(cp)) {
                // excluding the `circle` tangent line which equal to `line`, otherwise, it inverts to one of the original circles.
                angles = [Vector2.angle(Vector2.from(cp, cc))];
            } else {
                angles = [Vector2.angle(Vector2.from(cp, cc)), Vector2.angle(Vector2.from(cc, cp))];
            }
            const ret: Circle[] = [];
            angles.forEach(a => {
                const l = circle.getTangentVectorAtAngle(a).toLine()!;
                const inv = inversion.invertLine(l);
                if (inv instanceof Circle) {
                    ret.push(inv);
                }
            });
            return ret;
        }
        // inverse1IsLine && inverse2IsLine
        // there are infinite parallel lines between them, means infinite infinite circle.
        return [];
    }

    getInscribedRegularPolygon(sideCount: number, angle = 0) {
        return new RegularPolygon(this._centerX, this._centerY, this._radius, sideCount, angle);
    }

    getBoundingBox() {
        const { centerX: cx, centerY: cy, radius: r } = this;
        const w = r * 2;
        const h = r * 2;
        const x = cx - r;
        const y = cy - r;
        return [x, y, w, h] as [number, number, number, number];
    }

    getGraphics(viewport: ViewportDescriptor) {
        const dg = this.degenerate(false);
        if (dg === null) return new Graphics();
        if (dg !== this) return (dg as Exclude<typeof dg, this>).getGraphics(viewport);

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const { centerCoordinates: cc, radius: r } = this;
        gg.centerArcTo(...cc, r, r, 0, 0, 2 * Maths.PI);
        gg.close();
        return g;
    }

    /**
     * To path, using `Path.arcTo` command.
     */
    toPath() {
        const path = new Path();
        const {
            centerCoordinates: [cx, cy],
            radius: r
        } = this;
        const {
            point1X: x1,
            point1Y: y1,
            point2X: x2,
            point2Y: y2,
            radiusX: rx,
            radiusY: ry,
            largeArc,
            positive,
            rotation: phi
        } = centerToEndpointParameterization({
            centerX: cx,
            centerY: cy,
            radiusX: r,
            radiusY: r,
            startAngle: 0,
            endAngle: 2 * Maths.PI,
            positive: this.getWindingDirection() === 1,
            rotation: 0
        });

        path.appendCommand(Path.moveTo([x1, y1]));
        path.appendCommand(Path.arcTo(rx, ry, phi, largeArc, positive, [x2, y2]));
        path.closed = true;
        return path;
    }

    /**
     * To path, using `Path.bezierTo` command to do bezier approximating.
     * @see https://spencermortensen.com/articles/bezier-circle/
     * @see https://en.wikipedia.org/wiki/Composite_B%C3%A9zier_curve#Approximating_circular_arcs
     * @returns
     */
    toPath2() {
        const kappa = 0.5519150244935106;
        const { centerX: cx, centerY: cy, radius: r } = this;

        const offset = r * kappa; // control point offset
        const xs = cx - r; // x-start
        const ys = cy - r; // y-start
        const xe = cx + r; // x-end
        const ye = cy + r; // y-end
        const xm = cx; // x-middle
        const ym = cy; // y-middle

        const cp11 = [xs, ym - offset] as [number, number];
        const cp12 = [xm - offset, ys] as [number, number];
        const cp21 = [xm + offset, ys] as [number, number];
        const cp22 = [xe, ym - offset] as [number, number];
        const cp31 = [xe, ym + offset] as [number, number];
        const cp32 = [xm + offset, ye] as [number, number];
        const cp41 = [xm - offset, ye] as [number, number];
        const cp42 = [xs, ym + offset] as [number, number];

        const path = new Path();
        path.appendCommand(Path.moveTo([xs, ym]));
        path.appendCommand(Path.bezierTo(cp11, cp12, [xm, ys]));
        path.appendCommand(Path.bezierTo(cp21, cp22, [xe, ym]));
        path.appendCommand(Path.bezierTo(cp31, cp32, [xm, ye]));
        path.appendCommand(Path.bezierTo(cp41, cp42, [xs, ym]));
        path.closed = true;
        return path;
    }

    apply(transformation: Transformation) {
        const { centerCoordinates: cc, radius: r } = this;

        const {
            skew: [kx, ky],
            scale: [sx, sy]
        } = transformation.decomposeQr();
        const epsilon = optioner.options.epsilon;

        if (Maths.equalTo(kx, 0, epsilon) && Maths.equalTo(ky, 0, epsilon) && Maths.equalTo(sx, sy, epsilon)) {
            const ncc = transformation.transformCoordinates(cc);
            const nr = r * sx;
            return new Circle(ncc, nr);
        } else {
            return this.toPath().apply(transformation);
        }
    }
    clone() {
        return new Circle(this.centerX, this.centerY, this.radius);
    }
    copyFrom(shape: Circle | null) {
        if (shape === null) shape = new Circle();
        this._setCenterX(shape._centerX);
        this._setCenterY(shape._centerY);
        this._setRadius(shape._radius);
        return this;
    }
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
            `\tcenterX: ${this.centerX}`,
            `\tcenterY: ${this.centerY}`,
            `\tradius: ${this.radius}`,
            `}`
        ].join("\n");
    }
}

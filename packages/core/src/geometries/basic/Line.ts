import { Angle, Assert, Box, Coordinates, Maths, Matrix2, Type, Utility, Vector2 } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import { eps, optioner } from "../../geomtoy";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import ArrowGraphics from "../../helper/ArrowGraphics";
import { stated, statedWithBoolean } from "../../misc/decor-cache";
import { validGeometry } from "../../misc/decor-geometry";
import { getCoordinates } from "../../misc/point-like";
import type Transformation from "../../transformation";
import type { InfiniteOpenGeometry, ViewportDescriptor } from "../../types";
import Point from "./Point";

@validGeometry
export default class Line extends Geometry implements InfiniteOpenGeometry {
    private _x = NaN;
    private _y = NaN;
    private _slope = NaN;

    constructor(x: number, y: number, slope: number);
    constructor(coordinates: [number, number], slope: number);
    constructor(point: Point, slope: number);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { x: a0, y: a1, slope: a2 });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { coordinates: a0, slope: a1 });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { point: a0, slope: a1 });
        }
    }

    static override events = {
        xChanged: "x" as const,
        yChanged: "y" as const,
        slopeChanged: "slope" as const,
        angleChanged: "angle" as const
    };

    private _setX(value: number) {
        if (!Utility.is(this._x, value)) this.trigger_(new EventSourceObject(this, Line.events.xChanged, this._x));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.is(this._y, value)) this.trigger_(new EventSourceObject(this, Line.events.yChanged, this._y));
        this._y = value;
    }
    private _setSlope(value: number) {
        if (!Utility.is(this._slope, value)) {
            this.trigger_(new EventSourceObject(this, Line.events.slopeChanged, this._slope));
            this.trigger_(new EventSourceObject(this, Line.events.angleChanged, this.angle));
        }
        this._slope = value;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        Assert.isRealNumber(value, "x");
        this._setX(value);
    }
    get y() {
        return this._y;
    }
    set y(value) {
        Assert.isRealNumber(value, "y");
        this._setY(value);
    }
    get coordinates() {
        return [this._x, this._y] as [number, number];
    }
    set coordinates(value) {
        Assert.isCoordinates(value, "coordinates");
        this._setX(Coordinates.x(value));
        this._setY(Coordinates.y(value));
    }
    get point() {
        return new Point(this._x, this._y);
    }
    set point(value) {
        this._setX(value.x);
        this._setY(value.y);
    }
    /**
     * The slope of line `this`, the result is in $(-\infty,\infty]$.
     * @description
     * Due to lack of precision in floating point calculations, such as $\pi$ is not accurate,
     * the range of slope is internally reduced to $\left(\tan\left(-\frac{\pi}{2}\right),\tan\left(\frac{\pi}{2}\right)\right]$ which should be $(-16331239353195370, 16331239353195370]$
     * but we use $(-\infty,\infty]$ to represent. So we actually cut off the numbers of these two intervals:
     * $\left[-\infty,\tan\left(-\frac{\pi}{2}\right)\right]$, $\left(\tan\left(\frac{\pi}{2}\right), \infty\right]$.
     * Any number will be treated as $\infty$ if its absolute value is greater than $\tan\left(\frac{\pi}{2}\right)$.
     */
    get slope(): number {
        return this._slope;
    }
    set slope(value) {
        Assert.isExtendedRealNumber(value, "slope");
        const s = Maths.abs(value) >= Maths.tan(Maths.PI / 2) ? Infinity : value;
        this._setSlope(s);
    }
    /**
     * The angle between line `this` and the positive x-axis, the result is in the interval $\left(-\frac{\pi}{2},\frac{\pi}{2}\right]$.
     */
    get angle(): number {
        return Maths.atan(this.slope);
    }
    set angle(value) {
        Assert.isRealNumber(value, "angle");
        const a = Angle.convert2(value);
        const s = a === Maths.PI / 2 ? Infinity : Maths.tan(value);
        this._setSlope(s);
    }
    /**
     * The y-intercept of line `this`, the result is in the interval $(-\infty,\infty]$.
     * If line `this` is perpendicular to the x-axis, the y-intercept is $\infty$.
     */
    get yIntercept(): number {
        const { x, y, slope } = this;
        return slope === Infinity ? Infinity : -x * slope + y;
    }
    /**
     * The x-intercept of line `this`, the result is in the interval $(-\infty,\infty]$.
     * If line `this` is perpendicular to the y-axis, the x-intercept is $\infty$.
     */
    get xIntercept(): number {
        const { x, y, slope } = this;
        return slope === 0 ? Infinity : -y / slope + x;
    }

    @stated
    initialized() {
        // prettier-ignore
        return (
            !Number.isNaN(this._x) &&
            !Number.isNaN(this._y) &&
            !Number.isNaN(this._slope)
        );
    }
    degenerate(check: false): this | null;
    degenerate(check: true): boolean;
    @statedWithBoolean(undefined)
    degenerate(check: boolean) {
        if (!this.initialized()) return check ? true : null;
        return check ? false : this;
    }

    static yAxis() {
        return new Line(0, 0, Infinity);
    }
    static xAxis() {
        return new Line(0, 0, 0);
    }
    static yEqualPositiveX() {
        return new Line(0, 0, 1);
    }
    static yEqualNegativeX() {
        return new Line(0, 0, -1);
    }

    /**
     * Determine a line from two points `point1` and `point2`.
     * @param point1
     * @param point2
     * @param usePoint1
     */
    static fromTwoPoints(point1: [number, number] | Point, point2: [number, number] | Point, usePoint1 = true): Line | null {
        const [x1, y1] = getCoordinates(point1, "point1");
        const [x2, y2] = getCoordinates(point2, "point2");
        if (Coordinates.equalTo([x1, y1], [x2, y2], eps.epsilon)) {
            console.warn("[G]The points `point1` and `point2` are the same, they can NOT determine a `Line`.");
            return null;
        }
        if (Maths.equalTo(x1, x2, eps.epsilon)) return usePoint1 ? new Line(x1, y1, Infinity) : new Line(x2, y2, Infinity);
        if (Maths.equalTo(y1, y2, eps.epsilon)) return usePoint1 ? new Line(x1, y1, 0) : new Line(x2, y2, 0);
        const slope = (y2 - y1) / (x2 - x1);
        return usePoint1 ? new Line(x1, y1, slope) : new Line(x2, y2, slope);
    }

    /**
     * Determine a line from point `point` and angle `angle`.
     * @param point
     * @param angle
     */
    static fromPointAndAngle(point: [number, number] | Point, angle: number) {
        const c = getCoordinates(point, "point");
        const l = new Line();
        l.coordinates = c;
        l.angle = angle;
        return l;
    }
    /**
     * Determine a line from x-intercept `xIntercept` and y-intercept `yIntercept`.
     * @param xIntercept
     * @param yIntercept
     */
    static fromIntercepts(yIntercept: number, xIntercept: number, useYInterceptionPoint = true) {
        const xInt = Maths.abs(xIntercept);
        const yInt = Maths.abs(yIntercept);

        if (xInt === Infinity && yInt === Infinity) {
            console.warn("[G]When the `xIntercept` and `yIntercept` are both `Infinity`, a `Line` can NOT be determined.");
            return null;
        }
        if (xInt === Infinity) return new Line(0, yIntercept, 0);
        if (yInt === Infinity) return new Line(xIntercept, 0, Infinity);
        return Line.fromTwoPoints([0, yIntercept], [xIntercept, 0], useYInterceptionPoint);
    }

    static fromImplicitFunctionCoefs(coefs: [a: number, b: number, c: number]) {
        const [a, b, c] = coefs;
        if (a === 0 && b === 0) {
            console.warn("[G]The coefs `a` and `b` can not be both equal to 0.");
        }
        if (b === 0) {
            return new Line([-c / a, 0], Infinity);
        }
        const slope = -a / b;
        return new Line([0, -c / b], slope);
    }

    move(deltaX: number, deltaY: number) {
        if (deltaX === 0 && deltaY === 0) return this;
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }

    /**
     * Returns the coefficients of the implicit function $ax+by+c=0$
     */
    getImplicitFunctionCoefs(): [a: number, b: number, c: number] {
        const { x, y, slope } = this;
        if (slope === Infinity) return [-1, 0, x];
        if (slope === 0) return [0, -1, y];
        return [slope, -1, y - slope * x];
    }
    isPointOn(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        const [a, b, c] = this.getImplicitFunctionCoefs();
        return Maths.equalTo(a * x + b * y + c, 0, eps.epsilon);
    }
    isParallelToXAxis() {
        return this.slope === Infinity;
    }
    isParallelToYAxis(): boolean {
        return this.slope === 0;
    }
    getXWhereYEqualTo(y: number) {
        return this.slope === Infinity ? this.x : this.slope === 0 ? NaN : (y - this.y) / this.slope + this.x;
    }
    getYWhereXEqualTo(x: number) {
        return this.slope === 0 ? this.y : this.slope === Infinity ? NaN : (x - this.x) * this.slope + this.y;
    }
    /**
     * Get the point on line `this` where y is equal to `y`.
     * @param y
     */
    getPointWhereYEqualTo(y: number): null | Point {
        const x = this.getXWhereYEqualTo(y);
        if (Type.isNaN(x)) return null;
        return new Point(x, y);
    }
    /**
     * Get the point on line `this` where x is equal to `x`.
     * @param x
     */
    getPointWhereXEqualTo(x: number): null | Point {
        const y = this.getYWhereXEqualTo(x);
        if (Type.isNaN(y)) return null;
        return new Point(x, y);
    }

    /**
     * Whether line `this` is parallel(including identical) to line `line`.
     * @param line
     */
    isParallelToLine(line: Line) {
        if (this === line) return true;
        if (this.slope === line.slope) return true; // for `Infinity`
        return Maths.equalTo(this.slope, line.slope, eps.epsilon);
    }
    /**
     * Whether line `this` is coincident with line `line`.
     * @param line
     */
    isCoincidentWith(line: Line) {
        if (this === line) return true;
        return Maths.equalTo(this.slope, line.slope, eps.epsilon) && Maths.equalTo(this.yIntercept, line.yIntercept, eps.epsilon);
    }
    /**
     * Whether line `this` is perpendicular to line `line`.
     * @param line
     */
    isPerpendicularToLine(line: Line): boolean {
        if (this.slope === Infinity || Maths.equalTo(line.slope, 0, eps.epsilon)) return true;
        if (line.slope === Infinity || Maths.equalTo(this.slope, 0, eps.epsilon)) return true;

        return Maths.equalTo(this.slope * line.slope, -1, eps.epsilon);
    }
    /**
     * Find the perpendicular line of line `this` from point `point`.
     * @param point
     */
    getPerpendicularLineFromPoint(point: [number, number] | Point) {
        const k1 = this.slope;
        const [x, y] = getCoordinates(point, "point");
        // If two line are perpendicular to each other, the slope multiplication is equal to -1.
        const k2 = k1 === Infinity ? 0 : k1 === 0 ? Infinity : -1 / k1;
        return new Line(x, y, k2);
    }
    /**
     * Find the parallel line of line `this` from point `point`.
     * @param point
     */
    getParallelLineFromPoint(point: [number, number] | Point) {
        const [x, y] = getCoordinates(point, "point");
        return new Line(x, y, this.slope);
    }

    /**
     * Returns the closest point(the foot of the perpendicular) on line `this` from point `point`.
     * @param point
     */
    getClosestPointFromPoint(point: [number, number] | Point) {
        const [a, b, c] = this.getImplicitFunctionCoefs();
        const [x, y] = getCoordinates(point, "point");
        const num = -(a * x + b * y + c);
        const den = a ** 2 + b ** 2;
        const r = num / den;
        const dist = Maths.abs(num) / Maths.sqrt(den);
        return [new Point(r * a + x, r * b + y), dist ** 2] as [point: Point, distanceSquare: number];
    }
    /**
     * If line `this` is parallel to line `line`, then return the distance between them, otherwise return NaN.
     * @param line
     */
    getDistanceToParallelLine(line: Line): number {
        if (!this.isParallelToLine(line)) return NaN;
        const [a1, b1, c1] = this.getImplicitFunctionCoefs();
        const [a2, b2, c2] = line.getImplicitFunctionCoefs();
        return Maths.abs(c1 - c2) / Maths.hypot(a1, b1);
    }

    getBoundingBox() {
        return this.point.getBoundingBox();
    }

    getGraphics(viewport: ViewportDescriptor) {
        if (!this.initialized()) return new Graphics();

        const g = new Graphics();
        const gg = new GeometryGraphic();
        g.append(gg);
        const gbb = viewport.globalViewBox;
        const [a, b, c] = this.getImplicitFunctionCoefs();
        const cs: [number, number][] = [];
        const [minX, minY, maxX, maxY] = [Box.minX(gbb), Box.minY(gbb), Box.maxX(gbb), Box.maxY(gbb)];

        const d1 = a * minX + b * minY + c;
        const d2 = a * maxX + b * minY + c;
        const d3 = a * maxX + b * maxY + c;
        const d4 = a * minX + b * maxY + c;
        const lerp1 = d1 / (d1 - d2);
        const lerp2 = d2 / (d2 - d3);
        const lerp3 = d3 / (d3 - d4);
        const lerp4 = d4 / (d4 - d1);

        if (lerp1 >= 0 && lerp1 < 1) cs.push([Maths.lerp(minX, maxX, lerp1), minY]);
        if (lerp2 >= 0 && lerp2 < 1) cs.push([maxX, Maths.lerp(minY, maxY, lerp2)]);
        if (lerp3 >= 0 && lerp3 < 1) cs.push([Maths.lerp(maxX, minX, lerp3), maxY]);
        if (lerp4 >= 0 && lerp4 < 1) cs.push([minX, Maths.lerp(maxY, minY, lerp4)]);
        // When `cs.length === 0`, there is no intersection between line `this` and the box.
        // When `cs.length === 1`, line `this` only passes through one vertex of the box.
        // When `cs.length === 2`, line `this` intersects the box or one of the lines of box.

        if (cs.length !== 2) return g;
        const [c1, c2] = cs;
        const a1 = Vector2.angle(Vector2.from(c2, c1));
        const a2 = Vector2.angle(Vector2.from(c1, c2));
        gg.moveTo(...c1);
        gg.lineTo(...c2);

        if (optioner.options.graphics.lineArrow) {
            g.concat(new ArrowGraphics(c1, a1).getGraphics(viewport));
            g.concat(new ArrowGraphics(c2, a2).getGraphics(viewport));
        }

        return g;
    }
    apply(transformation: Transformation) {
        const nc = transformation.transformCoordinates(this.coordinates);
        const [a, b, c, d] = transformation.matrix;
        const [nax, nay] = Matrix2.dotVector2([a, c, b, d], [Maths.cos(this.angle), Maths.sin(this.angle)]);
        const ns = nay / nax;
        return new Line(nc, ns);
    }
    clone() {
        return new Line(this.x, this.y, this.slope);
    }
    copyFrom(shape: Line | null) {
        if (shape === null) shape = new Line();
        this._setX(shape._x);
        this._setY(shape._y);
        this._setSlope(shape._slope);
        return this;
    }
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\tslope: ${this.slope}`,
            `}`
        ].join("\n")
    }
}

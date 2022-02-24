import { Angle, Assert, Vector2, Maths, Type, Utility, Coordinates, Box } from "@geomtoy/util";
import { validAndWithSameOwner } from "../../decorator";

import Arrow from "../../helper/Arrow";
import { optionerOf } from "../../helper/Optioner";

import Shape from "../../base/Shape";
import Point from "./Point";
import LineSegment from "./LineSegment";
import Rectangle from "./Rectangle";
import Circle from "./Circle";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../../geomtoy";
import type { OwnerCarrier, InfiniteOpenShape, TransformableShape, ViewportDescriptor } from "../../types";
import type Transformation from "../../transformation";

class Line extends Shape implements InfiniteOpenShape, TransformableShape {
    private _x = NaN;
    private _y = NaN;
    private _slope = NaN;

    constructor(owner: Geomtoy, x: number, y: number, slope: number);
    constructor(owner: Geomtoy, coordinates: [number, number], slope: number);
    constructor(owner: Geomtoy, point: Point, slope: number);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any) {
        super(o);
        if (Type.isNumber(a1)) {
            Object.assign(this, { x: a1, y: a2, slope: a3 });
        }
        if (Type.isArray(a1)) {
            Object.assign(this, { coordinates: a1, slope: a2 });
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point: a1, slope: a2 });
        }

        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        xChanged: "x" as const,
        yChanged: "y" as const,
        slopeChanged: "slope" as const,
        angleChanged: "angle" as const
    });

    private _setX(value: number) {
        if (!Utility.isEqualTo(this._x, value)) this.trigger_(EventObject.simple(this, Line.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.isEqualTo(this._y, value)) this.trigger_(EventObject.simple(this, Line.events.yChanged));
        this._y = value;
    }
    private _setSlope(value: number) {
        if (!Utility.isEqualTo(this._slope, value)) {
            this.trigger_(EventObject.simple(this, Line.events.slopeChanged));
            this.trigger_(EventObject.simple(this, Line.events.angleChanged));
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
        return new Point(this.owner, this._x, this._y);
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
        const s = Maths.abs(value) >= Maths.TAN90 ? Infinity : value;
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
        const s = Maths.abs(a) === Maths.PI / 2 ? Infinity : Maths.tan(value);
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

    isValid() {
        const { coordinates: c, slope: slope } = this;
        if (!Coordinates.isValid(c)) return false;
        if (!Type.isExtendedRealNumber(slope)) return false;
        return true;
    }

    static yAxis(owner: Geomtoy) {
        return new Line(owner, 0, 0, Infinity);
    }
    static xAxis(owner: Geomtoy) {
        return new Line(owner, 0, 0, 0);
    }
    static yEqualPositiveX(owner: Geomtoy) {
        return new Line(owner, 0, 0, 1);
    }
    static yEqualNegativeX(owner: Geomtoy) {
        return new Line(owner, 0, 0, -1);
    }
    static fromGeneralEquationParameters(owner: Geomtoy, params: [number, number, number]): null | Line {
        const [a, b, c] = params;
        if (a === 0 && b === 0) {
            console.warn("[G]The `a` and `b` of a `Line` should not be equal to 0 at the same time.");
            return null;
        }
        if (b === 0) return new Line(owner, -(c / a), 0, Infinity);
        if (a === 0) return new Line(owner, 0, -(c / b), 0);
        return new Line(owner, 0, -(c / b), -(a / b));
    }

    /**
     * Determine a line from two points `point1` and `point2`.
     * @param this
     * @param point1
     * @param point2
     * @param usePoint1
     * @returns
     */
    static fromTwoPoints(this: OwnerCarrier, point1: [number, number] | Point, point2: [number, number] | Point, usePoint1 = true): Line | null {
        const [x1, y1] = point1 instanceof Point ? point1.coordinates : (Assert.isCoordinates(point1, "point1"), point1);
        const [x2, y2] = point2 instanceof Point ? point2.coordinates : (Assert.isCoordinates(point2, "point2"), point2);
        const epsilon = optionerOf(this.owner).options.epsilon;
        if (Coordinates.isEqualTo([x1, y1], [x2, y2], epsilon)) {
            console.warn("[G]The points `point1` and `point2` are the same, they can NOT determine a `Line`.");
            return null;
        }
        if (Maths.equalTo(x1, x2, epsilon)) return usePoint1 ? new Line(this.owner, x1, y1, Infinity) : new Line(this.owner, x2, y2, Infinity);
        if (Maths.equalTo(y1, y2, epsilon)) return usePoint1 ? new Line(this.owner, x1, y1, 0) : new Line(this.owner, x2, y2, 0);
        const slope = (y2 - y1) / (x2 - x1);
        return usePoint1 ? new Line(this.owner, x1, y1, slope) : new Line(this.owner, x2, y2, slope);
    }
    /**
     * Determine a line from point `point` and angle `angle`.
     * @param owner
     * @param point
     * @param angle
     * @returns
     */
    static fromPointAndAngle(owner: Geomtoy, point: Point, angle: number): Line {
        const l = new Line(owner);
        l.point = point;
        l.angle = angle;
        return l;
    }
    /**
     * Determine a line from x-intercept `xIntercept` and y-intercept `yIntercept`.
     * @param owner
     * @param xIntercept
     * @param yIntercept
     * @returns
     */
    static fromIntercepts(this: OwnerCarrier, yIntercept: number, xIntercept: number, useYInterceptionPoint = true) {
        const xInt = Maths.abs(xIntercept);
        const yInt = Maths.abs(yIntercept);

        if (xInt === Infinity && yInt === Infinity) {
            console.warn("[G]When the `xIntercept` and `yIntercept` are both `Infinity`, a `Line` can NOT be determined.");
            return null;
        }
        if (xInt === Infinity) return new Line(this.owner, 0, yIntercept, 0);
        if (yInt === Infinity) return new Line(this.owner, xIntercept, 0, Infinity);
        return Line.fromTwoPoints.call(this, [0, yIntercept], [xIntercept, 0], useYInterceptionPoint);
    }

    /**
     * Whether line `this` is the same as line `line`.
     * @param line
     * @returns
     */
    isSameAs(line: Line): boolean {
        if (this === line) return true;
        const epsilon = this.options_.epsilon;
        return Maths.equalTo(this.slope, line.slope, epsilon) && Maths.equalTo(this.yIntercept, line.yIntercept, epsilon);
    }
    /**
     * Move line `this` by `offsetX` and `offsetY` to get new line.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move line `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        if (deltaX === 0 && deltaY === 0) return this;
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }
    /**
     * Move line `this` with `distance` along `angle` to get new line.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move line `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        if (distance === 0) return this;
        this.coordinates = Vector2.add(this.coordinates, Vector2.from2(angle, distance));
        return this;
    }

    getGeneralEquationParameters() {
        const { x, y, slope } = this;
        if (slope === Infinity) return [-1, 0, x];
        if (slope === 0) return [0, -1, y];
        return [slope, -1, y - slope * x];
    }
    isPointOn(point: [number, number] | Point) {
        const [x, y] = point instanceof Point ? point.coordinates : (Assert.isCoordinates(point, "point"), point);
        const [a, b, c] = this.getGeneralEquationParameters();
        const epsilon = this.options_.epsilon;
        return Maths.equalTo(a * x + b * y + c, 0, epsilon);
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
     * @returns
     */
    getPointWhereYEqualTo(y: number): null | Point {
        const x = this.getXWhereYEqualTo(y);
        if (Type.isNaN(x)) return null;
        return new Point(this.owner, [x, y]);
    }
    /**
     * Get the point on line `this` where x is equal to `x`.
     * @param x
     * @returns
     */
    getPointWhereXEqualTo(x: number): null | Point {
        const y = this.getYWhereXEqualTo(x);
        if (Type.isNaN(y)) return null;
        return new Point(this.owner, [x, y]);
    }

    // #region Positional relationships of line to line
    // (IdenticalTo)
    // ParallelTo
    // PerpendicularTo
    // IntersectedWith
    /**
     * Whether line `this` is parallel(including identical) to line `line`.
     * @param line
     */
    isParallelToLine(line: Line): boolean {
        if (this === line) return true;
        if (this.slope === line.slope) return true;
        const epsilon = this.options_.epsilon;
        return Maths.equalTo(this.slope, line.slope, epsilon);
    }
    /**
     * Whether line `this` is perpendicular to line `line`.
     * @param line
     */
    isPerpendicularToLine(line: Line): boolean {
        const epsilon = this.options_.epsilon;
        if (this.slope === Infinity || Maths.equalTo(line.slope, 0, epsilon)) return true;
        if (line.slope === Infinity || Maths.equalTo(this.slope, 0, epsilon)) return true;

        return Maths.equalTo(this.slope * line.slope, -1, epsilon);
    }
    /**
     * Whether line `this` is intersected with line `line`.
     * @param line
     */
    isIntersectedWithLine(line: Line): boolean {
        return !this.isParallelToLine(line);
    }
    /**
     * Get the intersection point with line `line`.
     * @param line
     */
    getIntersectionPointWithLine(line: Line): null | Point {
        if (this.isParallelToLine(line)) return null;
        const [a1, b1, c1] = this.getGeneralEquationParameters();
        const [a2, b2, c2] = line.getGeneralEquationParameters();
        //`m` will not be equal to 0, we call `isParallelToLine` already
        const m = a1 * b2 - a2 * b1;
        const x = (c2 * b1 - c1 * b2) / m;
        const y = (c1 * a2 - c2 * a1) / m;
        return new Point(this.owner, x, y);
    }
    // #endregion

    // #region Positional relationships of line to circle
    // IntersectedWith
    // TangentTo
    // SeparatedFrom
    /**
     * Whether line `this` is intersected with circle `circle`.
     * @param circle
     */
    isIntersectedWithCircle(circle: Circle): boolean {
        let epsilon = this.options_.epsilon;
        return Maths.lessThan(circle.centerPoint.getSquaredDistanceBetweenLine(this), circle.radius ** 2, epsilon);
    }
    /**
     * Get the intersection points of line `this` and circle `circle`.
     * @param circle
     */
    getIntersectionPointsWithCircle(circle: Circle): null | [Point, Point] {
        if (!this.isIntersectedWithCircle(circle)) return null;
        let p0 = circle.centerPoint,
            r = circle.radius,
            p1 = this.getPerpendicularPointFromPoint(p0),
            sd = p0.getSquaredDistanceBetweenPoint(p1),
            d1i = Maths.sqrt(r ** 2 - sd),
            a = this.angle,
            ip1 = p1.moveAlongAngle(a, d1i),
            ip2 = p1.moveAlongAngle(a + Maths.PI, d1i);
        return [ip1, ip2];
    }
    /**
     * Whether line `this` is tangent to circle `circle`.
     * @param circle
     */
    isTangentToCircle(circle: Circle): boolean {
        let epsilon = this.options_.epsilon;
        return Maths.equalTo(circle.centerPoint.getSquaredDistanceBetweenLine(this), circle.radius ** 2, epsilon);
    }
    /**
     * Get the tangency point of line `this` and circle `circle`.
     * @param circle
     */
    getTangencyPointToCircle(circle: Circle): null | Point {
        if (!this.isTangentToCircle(circle)) return null;
        return this.getPerpendicularPointFromPoint(circle.centerPoint);
    }
    /**
     * Whether line `this` is separated from circle `circle`.
     * @param circle
     */
    isSeparatedFromCircle(circle: Circle): boolean {
        let epsilon = this.options_.epsilon;
        return Maths.greaterThan(circle.centerPoint.getSquaredDistanceBetweenLine(this), circle.radius ** 2, epsilon);
    }
    // #endregion

    // #region Positional relationships of line to line segment
    // ParallelTo
    // PerpendicularTo
    // CollinearWith
    // SeparatedFrom
    // IntersectedWith
    /**
     * Whether line `this` is parallel to line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isParallelToLineSegment(lineSegment: LineSegment): boolean {
        /* 
        If `line` is parallel to `lineSegment`, the signed distances of endpoints of `lineSegment` between `line` are equal,
        and we can eliminate the denominator "sqrt(a^2+b^2)", just compare the numerator.
        */
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment;
        const [a, b] = this.getGeneralEquationParameters();
        const epsilon = this.options_.epsilon;
        return Maths.equalTo(a * x1 + b * y1, a * x2 + b * y2, epsilon);
    }
    /**
     * Whether line `this` is perpendicular to line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isPerpendicularToLineSegment(lineSegment: LineSegment): boolean {
        /* 
        If `line` is perpendicular to `lineSegment`, then `lineSegment` should parallel to the line which is perpendicular to `line`.
        The perpendicular line of "y=-(a/b)x-(c/b)" is written as "y=(b/a)x-(c/b)", simplify it to "bx-ay=0".
        */
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment;
        const [a, b] = this.getGeneralEquationParameters();
        const epsilon = this.options_.epsilon;
        return Maths.equalTo(b * x1 - a * y1, b * x2 - a * y2, epsilon);
    }
    /**
     * Whether line `this` is collinear with line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isCollinearWithLineSegment(lineSegment: LineSegment): boolean {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment;
        const [a, b, c] = this.getGeneralEquationParameters();
        const epsilon = this.options_.epsilon;
        const s1 = Maths.sign(a * x1 + b * y1 + c, epsilon);
        const s2 = Maths.sign(a * x2 + b * y2 + c, epsilon);
        return s1 === 0 && s2 === 0;
    }
    /**
     * Whether line `this` is separated from line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isSeparatedFromLineSegment(lineSegment: LineSegment): boolean {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment;
        const [a, b, c] = this.getGeneralEquationParameters();
        const epsilon = this.options_.epsilon;
        const s1 = Maths.sign(a * x1 + b * y1 + c, epsilon);
        const s2 = Maths.sign(a * x2 + b * y2 + c, epsilon);
        return s1 * s2 === 1;
    }
    /**
     * Whether line `this` is intersected with line segment `lineSegment`.
     * @param {LineSegment} lineSegment
     */
    isIntersectedWithLineSegment(lineSegment: LineSegment): boolean {
        // If `line` is intersected with `lineSegment`, the signed distance of endpoints of `lineSegment` between `line` have different sign.
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment;
        const [a, b, c] = this.getGeneralEquationParameters();
        const epsilon = this.options_.epsilon;
        const s1 = Maths.sign(a * x1 + b * y1 + c, epsilon);
        const s2 = Maths.sign(a * x2 + b * y2 + c, epsilon);
        return (s1 === 0) !== (s2 === 0) || s1 * s2 === -1;
    }
    /**
     * Get the intersection point of line `this` and line segment `lineSegment`
     * @param {LineSegment} lineSegment
     */
    getIntersectionPointWithLineSegment(lineSegment: LineSegment): null | Point {
        if (!this.isIntersectedWithLineSegment(lineSegment)) return null;
        const w = lineSegment.getLerpingRatioByLine(this);
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = lineSegment;
        return new Point(this.owner, Maths.lerp(x1, x2, w), Maths.lerp(y1, y2, w));
    }

    /**
     * Find the perpendicular line of line `this` from point `point`.
     * @param coordinates
     */
    getPerpendicularLineFromPoint(point: [number, number] | Point): Line {
        const k1 = this.slope;
        const [x, y] = point instanceof Point ? point.coordinates : point;
        // If two line are perpendicular to each other, the slope multiplication is equal to -1.
        const k2 = k1 === Infinity ? 0 : k1 === 0 ? Infinity : -1 / k1;
        return new Line(this.owner, [x, y], k2);
    }
    /**
     * Find the perpendicular point(the foot of the perpendicular) on line `this` from point `point`.
     * @param point
     */
    // change function name
    getClosestPointFromPoint() {}

    getPerpendicularPointFromPoint(point: [number, number] | Point): Point {
        const [a, b, c] = this.getGeneralEquationParameters();
        const [x, y] = point instanceof Point ? point.coordinates : point;
        const d = -(a * x + b * y + c) / (a ** 2 + b ** 2);
        return new Point(this.owner, [d * a + x, d * b + y]);
    }
    /**
     * 若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回NaN
     * @param line
     */
    getDistanceToParallelLine(line: Line): number {
        if (!this.isParallelToLine(line)) return NaN;
        const [a1, b1, c1] = this.getGeneralEquationParameters();
        const [a2, b2, c2] = line.getGeneralEquationParameters();
        return Maths.abs(c1 - c2) / Maths.hypot(a1, b1);
    }

    getIntersectionPointsWithRectangle(rectangle: Rectangle): Point[] {
        const { originX: x, originY: y, width: w, height: h } = rectangle;

        const s1 = new LineSegment(this.owner, [x, y], [x + w, y]),
            s2 = new LineSegment(this.owner, [x + w, y], [x + w, y + h]),
            s3 = new LineSegment(this.owner, [x + w, y + h], [x, y + h]),
            s4 = new LineSegment(this.owner, [x, y + h], [x, y]),
            ret1 = this.getIntersectionPointWithLineSegment(s1),
            ret2 = this.getIntersectionPointWithLineSegment(s2),
            ret3 = this.getIntersectionPointWithLineSegment(s3),
            ret4 = this.getIntersectionPointWithLineSegment(s4);

        return [ret1, ret2, ret3, ret4].filter(v => v !== null) as Point[];
    }

    getGraphics(viewport: ViewportDescriptor) {
        const g = new Graphics();
        if (!this.isValid()) return g;

        const gbb = viewport.globalViewBox;
        const [a, b, c] = this.getGeneralEquationParameters();
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

        if (Maths.between(lerp1, 0, 1, false, true)) cs.push([Maths.lerp(minX, maxX, lerp1), minY]);
        if (Maths.between(lerp2, 0, 1, false, true)) cs.push([maxX, Maths.lerp(minY, maxY, lerp2)]);
        if (Maths.between(lerp3, 0, 1, false, true)) cs.push([Maths.lerp(maxX, minX, lerp3), maxY]);
        if (Maths.between(lerp4, 0, 1, false, true)) cs.push([minX, Maths.lerp(maxY, minY, lerp4)]);
        // When `cs.length === 0`, there is no intersection between line `this` and the box.
        // When `cs.length === 1`, line `this` only passes through one vertex of the box.
        // When `cs.length === 2`, line `this` intersects the box or one of the lines of box.

        if (cs.length !== 2) return g;
        const [c1, c2] = Utility.sort(cs, [Coordinates.x, Coordinates.y]);
        g.moveTo(...c1);
        g.lineTo(...c2);

        if (this.options_.graphics.lineArrow) {
            const arrowGraphics1 = new Arrow(this.owner, c1, this.angle - Maths.PI).getGraphics(viewport);
            const arrowGraphics2 = new Arrow(this.owner, c2, this.angle).getGraphics(viewport);
            g.append(arrowGraphics1);
            g.append(arrowGraphics2);
        }

        return g;
    }
    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.");
    }
    clone() {
        return new Line(this.owner, this.x, this.y, this.slope);
    }
    copyFrom(shape: Line | null) {
        if (shape === null) shape = new Line(this.owner);
        this._setX(shape._x);
        this._setY(shape._y);
        this._setSlope(shape._slope);
        return this;
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\tslope: ${this.slope}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [this.x, this.y, this.slope];
    }
    toObject() {
        return { x: this.x, y: this.y, slope: this.slope };
    }
}

validAndWithSameOwner(Line);

export default Line;

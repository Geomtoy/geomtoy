import { Angle, Assert, Vector2, Type, Utility, Coordinates, Maths } from "@geomtoy/util";
import { validAndWithSameOwner } from "../../decorator";

import Shape from "../../base/Shape";
import Point from "./Point";
import Line from "./Line";
import RegularPolygon from "./RegularPolygon";
import Arc from "./Arc";
import Vector from "./Vector";
import LineSegment from "./LineSegment";
import Inversion from "../../inversion";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../../geomtoy";
import type Transformation from "../../transformation";
import type { OwnerCarrier, Direction, AnglePointLineData, PointLineData, PointsLineData, ClosedShape, TransformableShape } from "../../types";

class Circle extends Shape implements ClosedShape, TransformableShape {
    private _centerX = NaN;
    private _centerY = NaN;
    private _radius = NaN;
    private _windingDirection = "positive" as Direction;

    constructor(owner: Geomtoy, centerX: number, centerY: number, radius: number);
    constructor(owner: Geomtoy, centerCoordinates: [number, number], radius: number);
    constructor(owner: Geomtoy, centerPoint: Point, radius: number);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any) {
        super(o);
        if (Type.isNumber(a1)) {
            Object.assign(this, { centerX: a1, centerY: a2, radius: a3 });
        }
        if (Type.isArray(a1)) {
            Object.assign(this, { centerCoordinates: a1, radius: a2 });
        }
        if (a1 instanceof Point) {
            Object.assign(this, { centerPoint: a1, radius: a2 });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        centerXChanged: "centerX" as const,
        centerYChanged: "centerY" as const,
        radiusChanged: "radius" as const
    });

    private _setCenterX(value: number) {
        if (!Utility.isEqualTo(this._centerX, value)) this.trigger_(EventObject.simple(this, Circle.events.centerXChanged));
        this._centerX = value;
    }
    private _setCenterY(value: number) {
        if (!Utility.isEqualTo(this._centerY, value)) this.trigger_(EventObject.simple(this, Circle.events.centerYChanged));
        this._centerY = value;
    }
    private _setRadius(value: number) {
        if (!Utility.isEqualTo(this._radius, value)) this.trigger_(EventObject.simple(this, Circle.events.radiusChanged));
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
        return new Point(this.owner, this._centerX, this._centerY);
    }
    set centerPoint(value) {
        this._setCenterX(value.x);
        this._setCenterY(value.y);
    }
    get radius() {
        return this._radius;
    }
    set radius(value) {
        Assert.isPositiveNumber(value, "radius");
        this._setRadius(value);
    }

    get diameter() {
        return this.radius * 2;
    }
    get eccentricity() {
        return 0;
    }

    isValid() {
        const { centerCoordinates: cc, radius: r } = this;
        if (!Coordinates.isValid(cc)) return false;
        if (!Type.isPositiveNumber(r)) return false;
        return true;
    }
    getLength(): number {
        throw new Error("Method not implemented.");
    }
    /**
     * Move circle `this` by `offsetX` and `offsetY` to get new circle.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move circle `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.centerCoordinates = Vector2.add(this.centerCoordinates, [deltaX, deltaY]);
        return this;
    }
    /**
     * Move circle `this` with `distance` along `angle` to get new circle.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move circle `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.centerCoordinates = Vector2.add(this.centerCoordinates, Vector2.from2(angle, distance));
        return this;
    }

    getWindingDirection(): Direction {
        return this._windingDirection;
    }

    setWindingDirection(direction: Direction) {
        this._windingDirection = direction;
    }

    isSameAs(circle: Circle): boolean {
        if (this === circle) return true;
        const epsilon = this.options_.epsilon;
        return Coordinates.isEqualTo(this.centerCoordinates, circle.centerCoordinates, epsilon) && Maths.equalTo(this.radius, circle.radius, epsilon);
    }
    isConcentricWithCircle(circle: Circle): boolean {
        const epsilon = this.options_.epsilon;
        return Coordinates.isEqualTo(this.centerCoordinates, circle.centerCoordinates, epsilon);
    }

    // #region Positional relationships of circle to circle
    // (IdenticalTo)
    // IntersectedWith
    // InternallyTangentTo
    // ExternallyTangentTo
    // TangentTo = InternallyTangentTo | ExternallyTangentTo
    // ContainedBy(or Containing)
    // SeparatedFrom
    isIntersectedWithCircle(circle: Circle) {
        let sd = Vector2.squaredMagnitude(Vector2.from(circle.centerCoordinates, this.centerCoordinates)),
            ssr = (circle.radius + this.radius) ** 2,
            sdr = (circle.radius - this.radius) ** 2,
            epsilon = this.options_.epsilon;
        return Maths.lessThan(sd, ssr, epsilon) && Maths.greaterThan(sd, sdr, epsilon);
    }
    isInternallyTangentToCircle(circle: Circle): boolean {
        let sd = Vector2.squaredMagnitude(Vector2.from(circle.centerCoordinates, this.centerCoordinates)),
            sdr = (circle.radius - this.radius) ** 2,
            epsilon = this.options_.epsilon;
        return Maths.equalTo(sd, sdr, epsilon);
    }
    isExternallyTangentToCircle(circle: Circle): boolean {
        let sd = Vector2.squaredMagnitude(Vector2.from(circle.centerCoordinates, this.centerCoordinates)),
            ssr = (circle.radius + this.radius) ** 2,
            epsilon = this.options_.epsilon;
        return Maths.equalTo(sd, ssr, epsilon);
    }
    isTangentToCircle(circle: Circle): boolean {
        return this.isInternallyTangentToCircle(circle) || this.isExternallyTangentToCircle(circle);
    }
    // #endregion

    getPerimeter() {
        return 2 * Maths.PI * this.radius;
    }
    getArea() {
        return Maths.PI * this.radius ** 2;
    }

    getPointAtAngle(angle: number): Point {
        let cc = this.centerCoordinates,
            r = this.radius;
        return new Point(this.owner, Vector2.add(cc, Vector2.from2(angle, r)));
    }

    // todo
    getArcBetweenAngle(startAngle: number, endAngle: number, positive = true): null | Arc {
        const epsilon = this.options_.epsilon;
        if (Maths.equalTo(Angle.simplify(startAngle), Angle.simplify(endAngle), epsilon)) return null;
        return new Arc(this.owner, this.centerCoordinates, this.radius, this.radius, startAngle, endAngle, positive);
    }
    getChordLineSegmentBetweenAngle(startAngle: number, endAngle: number) {
        let cc = this.centerCoordinates,
            r = this.radius;
        return new LineSegment(this.owner, Vector2.add(cc, Vector2.from2(startAngle, r)), Vector2.add(cc, Vector2.from2(endAngle, r)));
    }

    isPointOn(point: [number, number] | Point) {
        const c = point instanceof Point ? point.coordinates : point;
        const sd = Vector2.squaredMagnitude(Vector2.from(this.centerCoordinates, c));
        const sr = this.radius ** 2;
        const epsilon = this.options_.epsilon;
        return Maths.equalTo(sd, sr, epsilon);
    }
    isPointOutside(point: [number, number] | Point) {
        const c = point instanceof Point ? point.coordinates : point;
        const sd = Vector2.squaredMagnitude(Vector2.from(this.centerCoordinates, c));
        const sr = this.radius ** 2;
        const epsilon = this.options_.epsilon;
        return Maths.greaterThan(sd, sr, epsilon);
    }
    isPointInside(point: [number, number] | Point) {
        const c = point instanceof Point ? point.coordinates : point;
        const sd = Vector2.squaredMagnitude(Vector2.from(this.centerCoordinates, c));
        const sr = this.radius ** 2;
        const epsilon = this.options_.epsilon;
        return Maths.lessThan(sd, sr, epsilon);
    }

    /**
     * 若`点point`在`圆this`上，则求过`点point`的`圆this`的切线
     *
     */
    getTangentLineAtPoint(point: Point): Line | null {
        if (!this.isPointOn(point)) return null;

        let [x1, y1] = point.coordinates,
            [x2, y2] = this.centerCoordinates,
            r = this.radius,
            a = x1 - x2,
            b = y1 - y2,
            c = -(x2 * (x1 - x2) + y2 * (y1 - y2) + r ** 2);
        return new Line(this.owner, a, b, c);
    }
    getTangentLineAtAngle(angle: number): Line {
        throw new Error();
    }

    /**
     * If point `point` is outside circle `this`, find the tangent line data of circle `this` through point `point`.
     * @description
     * The returns depends:
     * - If `point` is outside `this`, return the tangent data.
     * - If `point` is not outside `this`, return null.
     */
    getTangentDataWithPointOutside(point: Point): [AnglePointLineData, AnglePointLineData] | null {
        if (!this.isPointOutside(point)) return null;

        let p1 = point,
            v0 = this.centerCoordinates,
            v1 = point.coordinates,
            v01 = Vector2.from(v0, v1),
            dist = Vector2.magnitude(v01),
            ia = Maths.acos(this.radius / dist),
            angles = [-ia, ia];

        let ret = angles.map(a => {
            let v02 = Vector2.scalarMultiply(Vector2.rotate(v01, a), this.radius / dist),
                v2 = Vector2.add(v0, v02),
                p2 = new Point(this.owner, v2);
            return {
                angle: a,
                point: p2,
                line: Line.fromTwoPoints.bind(this)(p1, p2)
            };
        });
        return ret as [AnglePointLineData, AnglePointLineData];
    }

    getInternallyTangentDataWithCircle(circle: Circle): PointLineData | null {
        if (!this.isInternallyTangentToCircle(circle)) return null;
        let p = this.getPointAtAngle(Vector2.angle(Vector2.from(this.centerCoordinates, circle.centerCoordinates))),
            l = this.getTangentLineAtPoint(p)!;
        return {
            point: p,
            line: l
        };
    }
    getExternallyTangentDataWithCircle(circle: Circle): PointLineData | null {
        if (!this.isExternallyTangentToCircle(circle)) return null;
        let p = this.getPointAtAngle(Vector2.angle(Vector2.from(this.centerCoordinates, circle.centerCoordinates))),
            l = this.getTangentLineAtPoint(p)!;
        return {
            point: p,
            line: l
        };
    }
    /**
     * `圆this`是否在`圆circle`的内部，被circle包含
     */
    isInsideCircle(circle: Circle) {
        const c1 = circle.centerCoordinates;
        const c2 = this.centerCoordinates;
        const sd = Vector2.squaredMagnitude(Vector2.from(c1, c2));
        const epsilon = this.options_.epsilon;
        return Maths.lessThan(sd, (circle.radius - this.radius) ** 2, epsilon);
    }
    /**
     * `圆this`是否在`圆circle`的外部，包含circle
     */
    isOutsideCircle(circle: Circle) {
        const c1 = circle.centerCoordinates;
        const c2 = this.centerCoordinates;
        const sd = Vector2.squaredMagnitude(Vector2.from(c1, c2));
        const epsilon = this.options_.epsilon;
        return Maths.greaterThan(sd, (circle.radius + this.radius) ** 2, epsilon);
    }

    getIntersectionPointsWithCircle(circle: Circle) {
        if (!this.isIntersectedWithCircle(circle)) return null;
        let pO = this.centerPoint,
            pP = circle.centerPoint,
            vOP = new Vector(this.owner, pO, pP),
            dist = pO.getDistanceBetweenPoint(pP),
            angle = Maths.acos((this.radius ** 2 + dist ** 2 - circle.radius ** 2) / (2 * this.radius * dist)),
            baseAngle = vOP.angle,
            points = [this.getPointAtAngle(baseAngle + angle), this.getPointAtAngle(baseAngle - angle)];
        return points;
    }

    /**
     * 是否与`圆this`正交，过其中一交点分别作两圆的切线，两切线夹角（圆的交角）为直角
     */
    isOrthogonalWithCircle(circle: Circle): boolean {
        let c = circle;
        return true;
    }

    /**
     * 获取`圆circle1`和`圆circle2`的公切线信息
     *
     * @description
     *
     *
     * @param {circle} circle1
     * @param {circle} circle2
     */
    //1.两圆内含，没有公切线
    //2.两圆内切，有1个条公切线，其中：1条两圆自有的内切切线
    //3.两圆重合，有无数条公切线（或者说没有公切线）
    //4.两圆相交。有2条公切线，其中：2条外公切线
    //5.两圆外切，有3条公切线，其中：1条两圆自有的外切切线，2条外公切线
    //6.两圆相离，有4条公切线，其中：2条外公切线，2条内公切线
    static getCommonTangentDataOfTwoCircles(this: OwnerCarrier, circle1: Circle, circle2: Circle): PointsLineData[] | null {
        let data: PointsLineData[] = [],
            sd = circle1.centerPoint.getSquaredDistanceBetweenPoint(circle2.centerPoint), // 圆心距平方,
            radiusDiff = circle1.radius - circle2.radius, // 半径差
            radiusSum = circle1.radius + circle2.radius, //半径和
            baseAngle = new Vector(this.owner, circle2.centerPoint, circle1.centerPoint).angle;

        //情况3，重合，无限多切线
        if (sd == 0 && circle1.radius == circle2.radius) return null;
        //情况1，内含,没有公切线
        if (sd < radiusDiff ** 2) return null;

        //情况2，内切，1条两圆自有的内切切线
        if (sd == radiusDiff ** 2) {
            let selfTanData = circle1.getInternallyTangentDataWithCircle(circle2)!;
            data.push({
                line: selfTanData.line,
                points: [selfTanData.point]
            });
        }
        // 情况5，外切，1条两圆自有的相切切线
        if (sd == radiusSum ** 2) {
            let selfTanData = circle1.getExternallyTangentDataWithCircle(circle2)!;
            data.push({
                line: selfTanData.line,
                points: [selfTanData.point]
            });
        }
        // 2条外公切线
        let angle = Maths.acos(radiusDiff / Maths.sqrt(sd)),
            p1 = circle1.getPointAtAngle(baseAngle + angle),
            p2 = circle2.getPointAtAngle(baseAngle + angle),
            p3 = circle1.getPointAtAngle(baseAngle - angle),
            p4 = circle2.getPointAtAngle(baseAngle - angle);

        data.push({
            line: Line.fromTwoPoints.call(this, p1, p2)!,
            points: [p1, p2]
        });
        data.push({
            line: Line.fromTwoPoints.call(this, p3, p4)!,
            points: [p3, p4]
        });

        //情况6，相离，再求出内公切线
        if (sd > radiusSum ** 2) {
            let angle = Maths.acos(radiusSum / Maths.sqrt(sd)),
                p1 = circle1.getPointAtAngle(baseAngle + angle),
                p2 = circle2.getPointAtAngle(baseAngle + angle),
                p3 = circle1.getPointAtAngle(baseAngle - angle),
                p4 = circle2.getPointAtAngle(baseAngle - angle);
            data.push({
                line: Line.fromTwoPoints.call(this, p1, p2)!,
                points: [p1, p2]
            });
            data.push({
                line: Line.fromTwoPoints.call(this, p3, p4)!,
                points: [p3, p4]
            });
        }
        //情况4，两圆相交，已求
        else if (sd < radiusSum ** 2) {
            //do nothing
        }
        return data;
    }

    /**
     * 过不在两圆`circle1`和`circle2`上的一点`point`，求两圆的公切圆
     * @param {Circle} circle1
     * @param {Circle} circle2
     * @param {Point} point
     */
    static getCommonTangentCirclesOfTwoCirclesThroughPointNotOn(owner: Geomtoy, circle1: Circle, circle2: Circle, point: Point): Circle[] | null {
        //如果点在其中一个圆上，并不一定能作出公切圆
        //比如半径一样的且相切的两个圆，在圆心连线垂线方向与圆的交点处，无法做出公切圆，此时公切圆的半径无穷大（切线）
        //而且点在其上的这个圆的反演图形是直线，无法求公切线，无法用反演做
        if (circle1.isPointOn(point) || circle2.isPointOn(point)) return null;

        let inversion = new Inversion(owner, point),
            ivCircle1 = inversion.invertCircle(circle1),
            ivCircle2 = inversion.invertCircle(circle2);

        // @ts-ignore
        let ctData = Circle.getCommonTangentDataOfTwoCircles(ivCircle1, ivCircle2);
        if (ctData === null) return null;
        // @ts-ignore
        return ctData.map(d => inversion.invertLine(d.line));
    }

    getInscribedRegularPolygon(sideCount: number, angle = 0) {
        return new RegularPolygon(this.owner, this.radius, this.centerX, this.centerY, sideCount, angle);
    }

    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;

        const c = this.centerCoordinates;
        g.centerArcTo(...c, this.radius, this.radius, 0, 0, 2 * Maths.PI);
        g.close();
        return g;
    }

    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.");
    }
    clone() {
        return new Circle(this.owner, this.centerX, this.centerY, this.radius);
    }
    copyFrom(shape: Circle | null) {
        if (shape === null) shape = new Circle(this.owner);
        this._setCenterX(shape._centerX);
        this._setCenterY(shape._centerY);
        this._setRadius(shape._radius);
        return this;
    }
    toString() {
        //prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tcenterX: ${this.centerX}`,
            `\tcenterY: ${this.centerY}`,
            `\tradius: ${this.radius}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n");
    }
    toArray() {
        return [this.centerX, this.centerY, this.radius];
    }
    toObject() {
        return { centerX: this.centerX, centerY: this.centerY, radius: this.radius };
    }
}

validAndWithSameOwner(Circle);

export default Circle;

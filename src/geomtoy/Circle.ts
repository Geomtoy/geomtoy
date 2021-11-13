import math from "./utility/math"
import util from "./utility"
import angle from "./utility/angle"
import vec2 from "./utility/vec2"

import Point from "./Point"
import Line from "./Line"
import RegularPolygon from "./RegularPolygon"

import Vector from "./Vector"
import LineSegment from "./LineSegment"
import Inversion from "./inversion"
import { GraphicsCommand, Direction, AnglePointLineData, PointLineData, PointsLineData } from "./types"
import { validAndWithSameOwner } from "./decorator"
import assert from "./utility/assertion"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import Graphics from "./graphics"
import Geomtoy from "."
import coord from "./utility/coordinate"
import Arc from "./Arc"
import Shape from "./base/Shape"
import { ClosedShape } from "./interfaces"

class Circle extends Shape implements ClosedShape {
    private _radius: number = NaN
    private _centerCoordinate: [number, number] = [NaN, NaN]
    private _windingDirection: Direction = "positive"

    constructor(owner: Geomtoy, centerX: number, centerY: number, radius: number)
    constructor(owner: Geomtoy, centerCoordinate: [number, number], radius: number)
    constructor(owner: Geomtoy, centerPoint: Point, radius: number)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { centerX: a1, centerY: a2, radius: a3 })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { centerCoordinate: a1, radius: a2 })
        }
        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        centerXChanged: "centerXChanged",
        centerYChanged: "centerYChanged",
        radiusChanged: "radiusChanged"
    })

    private _setCenterX(value: number) {
        this.willTrigger_(coord.x(this._centerCoordinate), value, [Circle.events.centerXChanged])
        coord.x(this._centerCoordinate, value)
    }
    private _setCenterY(value: number) {
        this.willTrigger_(coord.y(this._centerCoordinate), value, [Circle.events.centerYChanged])
        coord.y(this._centerCoordinate, value)
    }
    private _setRadius(value: number) {
        this.willTrigger_(this._radius, value, [Circle.events.radiusChanged])
        this._radius = value
    }

    get centerX() {
        return coord.x(this._centerCoordinate)
    }
    set centerX(value) {
        assert.isRealNumber(value, "centerX")
        this._setCenterX(value)
    }
    get centerY() {
        return coord.y(this._centerCoordinate)
    }
    set centerY(value) {
        assert.isRealNumber(value, "centerY")
        this._setCenterY(value)
    }
    get centerCoordinate() {
        return coord.clone(this._centerCoordinate)
    }
    set centerCoordinate(value) {
        assert.isCoordinate(value, "centerCoordinate")
        this._setCenterX(coord.x(value))
        this._setCenterY(coord.y(value))
    }
    get centerPoint() {
        return new Point(this.owner, this._centerCoordinate)
    }
    set centerPoint(value) {
        assert.isPoint(value, "centerPoint")
        this._setCenterX(value.x)
        this._setCenterY(value.y)
    }
    get radius() {
        return this._radius
    }
    set radius(value) {
        assert.isPositiveNumber(value, "radius")
        this._setRadius(value)
    }

    get diameter() {
        return this.radius * 2
    }
    get eccentricity() {
        return 0
    }

    isValid() {
        const [cc, r] = [this._centerCoordinate, this._radius]
        if (!coord.isValid(cc)) return false
        if (!util.isPositiveNumber(r)) return false
        return true
    }
    /**
     * Move circle `this` by `offsetX` and `offsetY` to get new circle.
     */
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move circle `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.centerCoordinate = coord.move(this.centerCoordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move circle `this` with `distance` along `angle` to get new circle.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move circle `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.centerCoordinate = coord.moveAlongAngle(this.centerCoordinate, angle, distance)
        return this
    }

    getWindingDirection(): Direction {
        return this._windingDirection
    }

    setWindingDirection(direction: Direction) {
        this._windingDirection = direction
    }

    isSameAs(circle: Circle): boolean {
        if (this === circle) return true
        const epsilon = this.options_.epsilon
        return coord.isSameAs(this.centerCoordinate, circle.centerCoordinate, epsilon) && math.equalTo(this.radius, circle.radius, epsilon)
    }
    isConcentricWithCircle(circle: Circle): boolean {
        const epsilon = this.options_.epsilon
        return coord.isSameAs(this.centerCoordinate, circle.centerCoordinate, epsilon)
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
        let sd = vec2.squaredMagnitude(vec2.from(circle.centerCoordinate, this._centerCoordinate)),
            ssr = (circle.radius + this.radius) ** 2,
            sdr = (circle.radius - this.radius) ** 2,
            epsilon = this.options_.epsilon
        return math.lessThan(sd, ssr, epsilon) && math.greaterThan(sd, sdr, epsilon)
    }
    isInternallyTangentToCircle(circle: Circle): boolean {
        let sd = vec2.squaredMagnitude(vec2.from(circle.centerCoordinate, this._centerCoordinate)),
            sdr = (circle.radius - this.radius) ** 2,
            epsilon = this.options_.epsilon
        return math.equalTo(sd, sdr, epsilon)
    }
    isExternallyTangentToCircle(circle: Circle): boolean {
        let sd = vec2.squaredMagnitude(vec2.from(circle.centerCoordinate, this._centerCoordinate)),
            ssr = (circle.radius + this.radius) ** 2,
            epsilon = this.options_.epsilon
        return math.equalTo(sd, ssr, epsilon)
    }
    isTangentToCircle(circle: Circle): boolean {
        return this.isInternallyTangentToCircle(circle) || this.isExternallyTangentToCircle(circle)
    }
    // #endregion

    getPerimeter() {
        return 2 * Math.PI * this.radius
    }
    getArea() {
        return Math.PI * this.radius ** 2
    }

    getPointAtAngle(angle: number): Point {
        let cc = this.centerCoordinate,
            r = this.radius
        return new Point(this.owner, vec2.add(cc, vec2.from2(angle, r)))
    }

    // todo
    getArcBetweenAngle(startAngle: number, endAngle: number, positive = true): null | Arc {
        const epsilon = this.options_.epsilon
        if (math.equalTo(angle.simplify(startAngle), angle.simplify(endAngle), epsilon)) return null
        return new Arc(this.owner, this.centerCoordinate, this.radius, this.radius, startAngle, endAngle, positive)
    }
    getChordLineSegmentBetweenAngle(startAngle: number, endAngle: number) {
        let cc = this.centerCoordinate,
            r = this.radius
        return new LineSegment(this.owner, vec2.add(cc, vec2.from2(startAngle, r)), vec2.add(cc, vec2.from2(endAngle, r)))
    }

    isPointOn(point: Point) {
        const sd = vec2.squaredMagnitude(vec2.from(this.centerCoordinate, point.coordinate))
        const sr = this.radius ** 2
        const epsilon = this.options_.epsilon
        return math.equalTo(sd, sr, epsilon)
    }
    isPointOutside(point: Point) {
        const sd = vec2.squaredMagnitude(vec2.from(this.centerCoordinate, point.coordinate))
        const sr = this.radius ** 2
        const epsilon = this.options_.epsilon
        return math.greaterThan(sd, sr, epsilon)
    }
    isPointInside(point: Point) {
        const sd = vec2.squaredMagnitude(vec2.from(this.centerCoordinate, point.coordinate))
        const sr = this.radius ** 2
        const epsilon = this.options_.epsilon
        return math.lessThan(sd, sr, epsilon)
    }

    /**
     * 若`点point`在`圆this`上，则求过`点point`的`圆this`的切线
     *
     */
    getTangentLineAtPoint(point: Point): Line | null {
        if (!this.isPointOn(point)) return null

        let [x1, y1] = point.coordinate,
            [x2, y2] = this.centerCoordinate,
            r = this.radius,
            a = x1 - x2,
            b = y1 - y2,
            c = -(x2 * (x1 - x2) + y2 * (y1 - y2) + r ** 2)
        return new Line(this.owner, a, b, c)
    }
    getTangentLineAtAngle(angle: number): Line {
        throw new Error()
    }

    /**
     * If point `point` is outside circle `this`, find the tangent line data of circle `this` through point `point`.
     * @description
     * The returns depends:
     * - If `point` is outside `this`, return the tangent data.
     * - If `point` is not outside `this`, return null.
     */
    getTangentDataWithPointOutside(point: Point): [AnglePointLineData, AnglePointLineData] | null {
        if (!this.isPointOutside(point)) return null

        let p1 = point,
            v0 = this.centerCoordinate,
            v1 = point.coordinate,
            v01 = vec2.from(v0, v1),
            dist = vec2.magnitude(v01),
            ia = math.acos(this.radius / dist),
            angles = [-ia, ia]

        let ret = angles.map(a => {
            let v02 = vec2.scalarMultiply(vec2.rotate(v01, a), this.radius / dist),
                v2 = vec2.add(v0, v02),
                p2 = new Point(this.owner, v2)
            return {
                angle: a,
                point: p2,
                line: Line.fromTwoPoints.bind(this)(p1, p2)
            }
        })
        return ret as [AnglePointLineData, AnglePointLineData]
    }

    getInternallyTangentDataWithCircle(circle: Circle): PointLineData | null {
        if (!this.isInternallyTangentToCircle(circle)) return null
        let p = this.getPointAtAngle(vec2.angle(vec2.from(this.centerCoordinate, circle.centerCoordinate))),
            l = this.getTangentLineAtPoint(p)!
        return {
            point: p,
            line: l
        }
    }
    getExternallyTangentDataWithCircle(circle: Circle): PointLineData | null {
        if (!this.isExternallyTangentToCircle(circle)) return null
        let p = this.getPointAtAngle(vec2.angle(vec2.from(this.centerCoordinate, circle.centerCoordinate))),
            l = this.getTangentLineAtPoint(p)!
        return {
            point: p,
            line: l
        }
    }
    /**
     * `圆this`是否在`圆circle`的内部，被circle包含
     */
    isInsideCircle(circle: Circle) {
        const c1 = circle.centerCoordinate
        const c2 = this.centerCoordinate
        const sd = vec2.squaredMagnitude(vec2.from(c1, c2))
        const epsilon = this.options_.epsilon
        return math.lessThan(sd, (circle.radius - this.radius) ** 2, epsilon)
    }
    /**
     * `圆this`是否在`圆circle`的外部，包含circle
     */
    isOutsideCircle(circle: Circle) {
        const c1 = circle.centerCoordinate
        const c2 = this.centerCoordinate
        const sd = vec2.squaredMagnitude(vec2.from(c1, c2))
        const epsilon = this.options_.epsilon
        return math.greaterThan(sd, (circle.radius + this.radius) ** 2, epsilon)
    }

    getIntersectionPointsWithCircle(circle: Circle) {
        if (!this.isIntersectedWithCircle(circle)) return null
        let pO = this.centerPoint,
            pP = circle.centerPoint,
            vOP = new Vector(this.owner, pO, pP),
            dist = pO.getDistanceBetweenPoint(pP),
            angle = math.acos((this.radius ** 2 + dist ** 2 - circle.radius ** 2) / (2 * this.radius * dist)),
            baseAngle = vOP.angle,
            points = [this.getPointAtAngle(baseAngle + angle), this.getPointAtAngle(baseAngle - angle)]
        return points
    }

    /**
     * 是否与`圆this`正交，过其中一交点分别作两圆的切线，两切线夹角（圆的交角）为直角
     */
    isOrthogonalWithCircle(circle: Circle): boolean {
        let c = circle
        return true
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
    static getCommonTangentDataOfTwoCircles(owner: Geomtoy, circle1: Circle, circle2: Circle): PointsLineData[] | null {
        let data: PointsLineData[] = [],
            sd = circle1.centerPoint.getSquaredDistanceBetweenPoint(circle2.centerPoint), // 圆心距平方,
            radiusDiff = circle1.radius - circle2.radius, // 半径差
            radiusSum = circle1.radius + circle2.radius, //半径和
            baseAngle = new Vector(owner, circle2.centerPoint, circle1.centerPoint).angle

        //情况3，重合，无限多切线
        if (sd == 0 && circle1.radius == circle2.radius) return null
        //情况1，内含,没有公切线
        if (sd < radiusDiff ** 2) return null

        //情况2，内切，1条两圆自有的内切切线
        if (sd == radiusDiff ** 2) {
            let selfTanData = circle1.getInternallyTangentDataWithCircle(circle2)!
            data.push({
                line: selfTanData.line,
                points: [selfTanData.point]
            })
        }
        // 情况5，外切，1条两圆自有的相切切线
        if (sd == radiusSum ** 2) {
            let selfTanData = circle1.getExternallyTangentDataWithCircle(circle2)!
            data.push({
                line: selfTanData.line,
                points: [selfTanData.point]
            })
        }
        // 2条外公切线
        let angle = math.acos(radiusDiff / math.sqrt(sd)),
            p1 = circle1.getPointAtAngle(baseAngle + angle),
            p2 = circle2.getPointAtAngle(baseAngle + angle),
            p3 = circle1.getPointAtAngle(baseAngle - angle),
            p4 = circle2.getPointAtAngle(baseAngle - angle)

        data.push({
            line: Line.fromTwoPoints.call(this, p1, p2),
            points: [p1, p2]
        })
        data.push({
            line: Line.fromTwoPoints.call(this, p3, p4),
            points: [p3, p4]
        })

        //情况6，相离，再求出内公切线
        if (sd > radiusSum ** 2) {
            let angle = math.acos(radiusSum / math.sqrt(sd)),
                p1 = circle1.getPointAtAngle(baseAngle + angle),
                p2 = circle2.getPointAtAngle(baseAngle + angle),
                p3 = circle1.getPointAtAngle(baseAngle - angle),
                p4 = circle2.getPointAtAngle(baseAngle - angle)
            data.push({
                line: Line.fromTwoPoints.call(this, p1, p2),
                points: [p1, p2]
            })
            data.push({
                line: Line.fromTwoPoints.call(this, p3, p4),
                points: [p3, p4]
            })
        }
        //情况4，两圆相交，已求
        else if (sd < radiusSum ** 2) {
            //do nothing
        }
        return data
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
        if (circle1.isPointOn(point) || circle2.isPointOn(point)) return null

        let inversion = new Inversion(owner, point),
            ivCircle1 = inversion.invertCircle(circle1),
            ivCircle2 = inversion.invertCircle(circle2)

        // @ts-ignore
        let ctData = Circle.getCommonTangentDataOfTwoCircles(ivCircle1, ivCircle2)
        if (ctData === null) return null
        // @ts-ignore
        return ctData.map(d => inversion.invertLine(d.line))
    }

    getInscribedRegularPolygon(sideCount: number, angle = 0) {
        return new RegularPolygon(this.owner, this.radius, this.centerX, this.centerY, sideCount, angle)
    }

    getGraphics(): GraphicsCommand[] {
        let c = this.centerCoordinate,
            g = new Graphics()
        g.centerArcTo(...c, this.radius, this.radius, 0, 0, 2 * Math.PI)
        g.close()
        return g.commands
    }

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    clone() {
        return new Circle(this.owner, this.centerCoordinate, this.radius)
    }
    copyFrom(circle: Circle | null) {
        if (circle === null) circle = new Circle(this.owner)
        this._setCenterX(coord.x(circle._centerCoordinate))
        this._setCenterY(coord.y(circle._centerCoordinate))
        this._setRadius(circle._radius)
        return this
    }
    toArray() {
        return [this.radius, this.centerX, this.centerY]
    }
    toObject() {
        return { radius: this.radius, centerX: this.centerX, centerY: this.centerY }
    }
    toString() {
        return `Circle(${this.radius}, ${this.centerX}, ${this.centerY})`
    }
}

validAndWithSameOwner(Circle)
/**
 * @category GeomObject
 */
export default Circle

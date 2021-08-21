import math from "./utility/math"
import util from "./utility"
import angle from "./utility/angle"
import vec2 from "./utility/vec2"

import Point from "./Point"
import Line from "./Line"
import RegularPolygon from "./RegularPolygon"

import Vector from "./Vector"
import Segment from "./Segment"
import Inversion from "./inversion"
import { CanvasDirective, GraphicImplType, SvgDirective } from "./types"
import { is, sameOwner, sealed } from "./decorator"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"
import Graphic from "./graphic"
import Geomtoy from "."
import coord from "./helper/coordinate"

interface TangentDataOfCircleWithPointOutside {
    [index: number]: {
        // the angle from line(`point` to center of `circle`) to tangent point radius, positive if tangent point radius is on the positive rotation direction
        angle: number
        line: Line
        point: Point
    }
}
interface CommonTangentDataOfTwoCircles {}

@sealed
class Circle extends GeomObject {
    #name = "Circle"
    #uuid = util.uuid()

    #radius: number = NaN
    #centerCoordinate: [number, number] = [NaN, NaN]

    constructor(owner: Geomtoy, radius: number, centerX: number, centerY: number)
    constructor(owner: Geomtoy, radius: number, centerCoordinate: [number, number])
    constructor(owner: Geomtoy, radius: number, centerPoint: Point)
    constructor(o: Geomtoy, a1: number, a2: any, a3?: any) {
        super(o)
        if (util.isNumber(a2) && util.isNumber(a3)) {
            return Object.seal(Object.assign(this, { radius: a1, centerX: a2, centerY: a3 }))
        }
        if (util.isArray(a2)) {
            return Object.seal(Object.assign(this, { radius: a1, centerCoordinate: a2 }))
        }
        if (a2 instanceof Point) {
            return Object.seal(Object.assign(this, { radius: a1, centerPoint: a2 }))
        }
        throw new Error("[G]Arguments can NOT construct a `Circle`.")
    }
    get name() {
        return this.#name
    }
    get uuid() {
        return this.#uuid
    }

    @is("positiveNumber")
    get radius() {
        return this.#radius
    }
    set radius(value) {
        this.#radius = value
    }
    @is("realNumber")
    get centerX() {
        return coord.x(this.#centerCoordinate)
    }
    set centerX(value) {
        coord.x(this.#centerCoordinate, value)
    }
    @is("realNumber")
    get centerY() {
        return coord.y(this.#centerCoordinate)
    }
    set centerY(value) {
        coord.y(this.#centerCoordinate, value)
    }
    @is("coordinate")
    get centerCoordinate() {
        return coord.copy(this.#centerCoordinate)
    }
    set centerCoordinate(value) {
        coord.assign(this.#centerCoordinate, value)
    }
    @sameOwner
    @is("point")
    get centerPoint() {
        return new Point(this.owner, this.#centerCoordinate)
    }
    set centerPoint(value) {
        coord.assign(this.#centerCoordinate, value.coordinate)
    }

    get eccentricity(){
        return 0
    }


    isSameAs(circle: Circle): boolean {
        if (this === circle) return true
        let epsilon = this.owner.getOptions().epsilon
        return coord.isSameAs(this.centerCoordinate, circle.centerCoordinate, epsilon) && math.equalTo(this.radius, circle.radius, epsilon)
    }
    isConcentricWithCircle(circle: Circle): boolean {
        let epsilon = this.owner.getOptions().epsilon
        return coord.isSameAs(this.centerCoordinate, circle.centerCoordinate, epsilon)
    }

    // #region Positional relationships of circle to circle
    // (IdenticalTo)
    // IntersectedWith
    // InternallyTangentTo
    // ExternallyTangentTo
    // TangentTo = InternallyTangentTo | ExternallyTangentTo
    // WrappedInside
    // WrappingOutside
    // SeparatedFrom

    isIntersectedWithCircle(circle: Circle) {
        let sd = circle.centerPoint.getSquaredDistanceBetweenPoint(this.centerPoint),
            ssr = (circle.radius + this.radius) ** 2,
            sdr = (circle.radius - this.radius) ** 2,
            epsilon = this.owner.getOptions().epsilon
        return math.lessThan(sd, ssr, epsilon) && math.greaterThan(sd, sdr, epsilon)
    }
    isInternallyTangentToCircle(circle: Circle): boolean {
        let sd = circle.centerPoint.getSquaredDistanceBetweenPoint(this.centerPoint),
            sdr = (circle.radius - this.radius) ** 2,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(sd, sdr, epsilon)
    }
    isExternallyTangentToCircle(circle: Circle): boolean {
        let sd = circle.centerPoint.getSquaredDistanceBetweenPoint(this.centerPoint),
            ssr = (circle.radius + this.radius) ** 2,
            epsilon = this.owner.getOptions().epsilon
        return math.equalTo(sd, ssr, epsilon)
    }
    isTangentToCircle(circle: Circle): boolean {
        return this.isInternallyTangentToCircle(circle) || this.isExternallyTangentToCircle(circle)
    }
    isWrappingOutsideCircle(circle: Circle): boolean {
        let sd = this.centerPoint.getSquaredDistanceBetweenPoint(circle.centerPoint),
            sdr = (circle.radius - this.radius) ** 2,
            epsilon = this.owner.getOptions().epsilon
        return math.greaterThan(this.radius, circle.radius, epsilon) && math.lessThan(sd, sdr, epsilon)
    }
    isWrappedInsideCircle(circle: Circle): boolean {
        return circle.isWrappingOutsideCircle(this)
    }
    isSeparatedFromCircle(circle: Circle): boolean {
        let sd = circle.centerPoint.getSquaredDistanceBetweenPoint(this.centerPoint),
            ssr = (circle.radius + this.radius) ** 2,
            epsilon = this.owner.getOptions().epsilon
        return math.greaterThan(sd, ssr, epsilon)
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
    getAngleOfPoint(point: Point): number {
        if (!point.isOnCircle(this)) return NaN
        let v = vec2.from(this.centerCoordinate, point.coordinate)
        return angle.simplify(vec2.angle(v))
    }
    // getArcBetweenPoints(point1:Point,point2:Point,positive= true):Arc{

    // }
    // getArcBetweenPoints2(point1:Point,point2:Point,large = true):Arc{

    // }
    // getArcsBetweenPoints(point1:Point,point2:Point){
    //     let ret = {
    //         minor: null, positive:null,  //Minor arc
    //         major: null, positive:null   //major arc
    //     }

    // }

    // getArcBetweenPoints(point1:Point,point2:Point,positive = true):Arc{

    // }


    getArcAngleBetweenPoints(point1: Point, point2: Point, positive = true): number {
        if (point1.isSameAs(point2)) return NaN
        let a1 = this.getAngleOfPoint(point1),
            a2 = this.getAngleOfPoint(point2)
        if (a1 > a2) {
            if (positive) {
                return 2 * Math.PI + (a1 - a2)
            } else {
                return a1 - a2
            }
        } else {
            if (positive) {
                return a2 - a1
            } else {
                return -2 * Math.PI + (a2 - a1)
            }
        }
    }

    getArcLengthBetweenPoints(point1: Point, point2: Point, positive = true) {
        if (point1.isSameAs(point2)) return NaN

        let angle = this.getArcAngleBetweenPoints(point1, point2, positive)
        return this.getPerimeter() * (math.abs(angle) / (2 * Math.PI))
    }

    /**
     * 若`点point`在`圆this`上，则求过`点point`的`圆this`的切线
     * @param {Point} point
     * @returns {Line | null}
     */
    getTangentLineAtPoint(point: Point): Line | null {
        if (!point.isOnCircle(this)) return null

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
     * - If point `point` is outside circle `this`, return `TangentDataOfCircleWithPointOutside`
     * - If point `point` is not outside circle `this`, return null
     * @param {Point} point
     * @returns
     */
    getTangentDataWithPointOutside(point: Point): TangentDataOfCircleWithPointOutside | null {
        if (!point.isOutsideCircle(this)) return null

        //设圆心为O，圆外一点为P，切线与圆的切点为Q
        let p1 = point,
            v0 = this.centerCoordinate,
            v1 = point.coordinate,
            v01 = vec2.from(v0, v1),
            dist = vec2.magnitude(v01),
            ia = math.acos(this.radius / dist),
            data: any = [{ angle: -ia }, { angle: ia }]

        util.forEach(data, obj => {
            let v02 = vec2.scalarMultiply(vec2.rotate(v01, ia), this.radius / dist),
                v2 = vec2.add(v0, v02),
                p2 = new Point(this.owner, v2)
            obj.point = p2
            obj.line = Line.fromTwoPoints(this.owner, p1, p2)
        })
        return data as TangentDataOfCircleWithPointOutside
    }

    getInternallyTangentDataWithCircle(circle: Circle): object {
        if (!this.isInternallyTangentToCircle(circle)) return {}
        let p = this.getPointAtAngle(new Vector(this.owner, this.centerPoint, circle.centerPoint).angle),
            l = this.getTangentLineAtPoint(p)
        return {
            point: p,
            line: l
        }
    }
    getExternallyTangentDataWithCircle(circle: Circle) {
        if (!this.isExternallyTangentToCircle(circle)) return null
        let p = this.getPointAtAngle(new Vector(this.owner, this.centerPoint, circle.centerPoint).angle),
            l = this.getTangentLineAtPoint(p)
        return {
            point: p,
            line: l
        }
    }
    /**
     * `圆this`是否在`圆circle`的内部，被circle包含
     * @param {Circle} circle
     * @returns {boolean}
     */
    isInsideCircle(circle: Circle): boolean {
        let sd = circle.centerPoint.getSquaredDistanceBetweenPoint(this.centerPoint),
            epsilon = this.owner.getOptions().epsilon
        return math.lessThan(sd, (circle.radius - this.radius) ** 2, epsilon)
    }
    /**
     * `圆this`是否在`圆circle`的外部，包含circle
     * @param {Circle} circle
     * @returns {boolean}
     */
    isOutsideCircle(circle: Circle): boolean {
        let sd = circle.centerPoint.getSquaredDistanceBetweenPoint(this.centerPoint)
        return math.greaterThan(sd, (circle.radius + this.radius) ** 2)
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
     * @param {Circle} circle
     * @returns {boolean}
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
     * @returns {Array<object> | null}
     */
    //1.两圆内含，没有公切线
    //2.两圆内切，有1个条公切线，其中：1条两圆自有的内切切线
    //3.两圆重合，有无数条公切线（或者说没有公切线）
    //4.两圆相交。有2条公切线，其中：2条外公切线
    //5.两圆外切，有3条公切线，其中：1条两圆自有的外切切线，2条外公切线
    //6.两圆相离，有4条公切线，其中：2条外公切线，2条内公切线
    static getCommonTangentDataOfTwoCircles(owner: Geomtoy, circle1: Circle, circle2: Circle) {
        let data = [],
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
            let selfTanData = circle1.getInternallyTangentDataWithCircle(circle2)

            data.push({
                // @ts-ignore
                line: selfTanData.line,
                // @ts-ignore
                points: [selfTanData.point]
            })
        }
        // 情况5，外切，1条两圆自有的相切切线
        if (sd == radiusSum ** 2) {
            let selfTanData = circle1.getExternallyTangentDataWithCircle(circle2)
            data.push({
                // @ts-ignore
                line: selfTanData.line,
                // @ts-ignore
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
            line: Line.fromTwoPoints(owner, p1, p2),
            points: [p1, p2]
        })
        data.push({
            line: Line.fromTwoPoints(owner, p3, p4),
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
                line: Line.fromTwoPoints(owner, p1, p2),
                points: [p1, p2]
            })
            data.push({
                line: Line.fromTwoPoints(owner, p3, p4),
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
     * @returns {Array<Circle> | null}
     */
    static getCommonTangentCirclesOfTwoCirclesThroughPointNotOn(owner: Geomtoy, circle1: Circle, circle2: Circle, point: Point): Array<Circle> | null {
        //如果点在其中一个圆上，并不一定能作出公切圆
        //比如半径一样的且相切的两个圆，在圆心连线垂线方向与圆的交点处，无法做出公切圆，此时公切圆的半径无穷大（切线）
        //而且点在其上的这个圆的反演图形是直线，无法求公切线，无法用反演做

        if (point.isOnCircle(circle1) || point.isOnCircle(circle2)) return null

        let inversion = new Inversion(owner, 10000, point),
            ivCircle1 = inversion.invertCircle(circle1),
            ivCircle2 = inversion.invertCircle(circle2)

        // @ts-ignore
        let ctData = Circle.getCommonTangentDataOfTwoCircles(ivCircle1, ivCircle2)
        if (ctData === null) return null
        // @ts-ignore
        return util.map(ctData, d => inversion.invertLine(d.line))
    }

    getInscribedRegularPolygon(sideCount: number, angle = 0) {
        return new RegularPolygon(this.owner, this.radius, this.centerX, this.centerY, sideCount, angle)
    }

    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[] {
        let { x, y } = this.centerPoint,
            g = new Graphic()

        g.moveTo(x, y)
        g.centerArcTo(x, y, this.radius, this.radius, 0, 2 * Math.PI, 0)
        g.close()
        return g.valueOf(type)
    }

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    clone() {
        return new Circle(this.owner, this.radius, this.centerPoint)
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

/**
 *
 * @category GeomObject
 */
export default Circle

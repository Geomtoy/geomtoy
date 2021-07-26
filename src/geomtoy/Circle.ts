import util from "./utility"
import Point from "./Point"
import Line from "./Line"
import RegularPolygon from "./RegularPolygon"
import _ from "lodash"
import Vector from "./Vector"
import Segment from "./Segment"
import Inversion from "./inversion/Inversion"
import { CanvasDirective, Coordinate, GraphicImplType, RsPointToCircle, SvgDirective } from "./types"
import { is, sealed } from "./decorator"
import GeomObject from "./base/GeomObject"
import Transformation from "./transformation"

@sealed
class Circle extends GeomObject {
    #radius: number | undefined
    #centerPoint: Point | undefined

    constructor(radius: number, centerX: number, centerY: number)
    constructor(radius: number, centerCoordinate: Coordinate)
    constructor(radius: number, centerPoint: Point)
    constructor(r: number, cx?: any, cy?: any) {
        super()
        this.#radius = r
        if (_.isNumber(cx) && _.isNumber(cy)) {
            let p = new Point(cx, cy)
            Object.seal(Object.assign(this, { centerPoint: p }))
            return this
        }
        if (util.type.isCoordinate(cx)) {
            let p = new Point(cx)
            Object.seal(Object.assign(this, { centerPoint: p }))
            return this
        }
        if (cx instanceof Point) {
            Object.seal(Object.assign(this, { centerPoint: cx.clone() }))
            return this
        }
        throw new Error(`[G]Arguments can NOT construct a circle.`)
    }
    @is("positiveNumber")
    get radius() {
        return this.#radius!
    }
    set radius(value) {
        this.#radius = value
    }
    @is("realNumber")
    get cx() {
        return this.#centerPoint!.x
    }
    set cx(value) {
        this.#centerPoint!.x = value
    }
    @is("realNumber")
    get cy() {
        return this.#centerPoint!.y
    }
    set cy(value) {
        this.#centerPoint!.y = value
    }
    @is("point")
    get centerPoint() {
        return this.#centerPoint!
    }
    set centerPoint(value) {
        this.#centerPoint = value
    }

    isSameAs(circle: Circle) {
        return this.centerPoint.isSameAs(circle.centerPoint) && util.apxEqualsTo(this.radius, circle.radius)
    }

    getEccentricity() {
        return 0
    }

    /**
     * 获得圆上某个角度的点
     * @param {number} angle
     * @returns {Point}
     */
    getPointAtAngle(angle: number): Point {
        return this.centerPoint.walk(angle, this.radius)
    }
    /**
     * 若`点point`在`圆this`上，则求过`点point`的`圆this`的切线
     * @param {Point} point
     * @returns {Line | null}
     */
    getTangentLineAtPoint(point: Point): Line | null {
        if (point.getRelationshipToCircle(this) & RsPointToCircle.NotOn) return null
        let x0 = point.x,
            y0 = point.y,
            a = this.cx,
            b = this.cy,
            r = this.radius,
            aa = x0 - a,
            bb = y0 - b,
            cc = -(a * (x0 - a) + b * (y0 - b) + r * r)
        return new Line(aa, bb, cc)
    }

    getPerimeter() {
        return 2 * Math.PI * this.radius
    }

    getArcLengthBetween(p1: Point, p2: Point, clockwise = false) {
        if (p1.isSameAs(p2)) return NaN
        let angle = this.getArcAngleBetween(p1, p2, clockwise)
        return this.getPerimeter() * (Math.abs(angle) / (2 * Math.PI))
    }

    getArcAngleBetween(p1: Point, p2: Point, clockwise = false): number {
        if (p1.isSameAs(p2)) return NaN
        let aP1 = new Vector(this.centerPoint, p1).angle,
            aP2 = new Vector(this.centerPoint, p2).angle

        if (aP2 > aP1) {
            if (clockwise) {
                return -(2 * Math.PI - (aP2 - aP1))
            } else {
                return aP2 - aP1
            }
        } else {
            if (clockwise) {
                return -(aP1 - aP2)
            } else {
                return 2 * Math.PI - (aP1 - aP2)
            }
        }
    }

    /**
     * 若`点point`在`圆this`外，则求过`点point`的`圆this`的切线，一共有两个
     * @param {Point} point
     * @returns {object | null}
     */
    getTangleLineDataWithPointOutside(point: Point): object | null {
        if (!(point.getRelationshipToCircle(this) & RsPointToCircle.Outside)) return null

        //设圆心为O，圆外一点为P，切线与圆的切点为Q
        let pO = this.centerPoint,
            vO = new Vector(pO),
            pP = point,
            vOP = new Vector(pO, pP),
            dist = pO.getDistanceBetweenPoint(pP),
            includedAngle = Math.asin(this.radius / dist),
            data: { [key: string]: any } = {
                clockwise: { angle: -includedAngle },
                anticlockwise: { angle: includedAngle }
            }
        _.forEach(data, element => {
            let vQ = vO.add(vOP.rotate(includedAngle).scalarMultiply(this.radius / dist)),
                pQ = Point.fromVector(vQ)
            element.point = pQ
            element.line = Line.fromPoints(pQ, pP)
        })
        return data
    }

    /**
     * `圆point`和`圆this`是否相切（内切、外切）
     * @param {Circle} circle
     * @returns {boolean}
     */
    isTangentWithCircle(circle: Circle): boolean {
        return this.isInternallyTangentWithCircle(circle) || this.isExternallyTangentWithCircle(circle)
    }
    isInternallyTangentWithCircle(circle: Circle) {
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint)
        return util.apxEqualsTo(dSquare, (circle.radius - this.radius) ** 2)
    }
    isExternallyTangentWithCircle(circle: Circle) {
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint)
        return util.apxEqualsTo(dSquare, (circle.radius + this.radius) ** 2)
    }
    getInternallyTangentDataWithCircle(circle: Circle): object {
        if (!this.isInternallyTangentWithCircle(circle)) return {}
        let p = this.getPointAtAngle(new Vector(this.centerPoint, circle.centerPoint).angle),
            l = this.getTangentLineAtPoint(p)
        return {
            point: p,
            line: l
        }
    }
    getExternallyTangentDataWithCircle(circle: Circle) {
        if (!this.isExternallyTangentWithCircle(circle)) return null
        let p = this.getPointAtAngle(new Vector(this.centerPoint, circle.centerPoint).angle),
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
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint),
            epsilon = this.options.epsilon
        return util.defLessThan(dSquare, (circle.radius - this.radius) ** 2, epsilon)
    }
    /**
     * `圆this`是否在`圆circle`的外部，包含circle
     * @param {Circle} circle
     * @returns {boolean}
     */
    isOutsideCircle(circle: Circle): boolean {
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint)
        return util.defGreaterThan(dSquare, (circle.radius + this.radius) ** 2)
    }
    isIntersectedWithCircle(circle: Circle) {
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint),
            epsilon = this.options.epsilon
        return util.defLessThan(dSquare, (circle.radius + this.radius) ** 2, epsilon) && util.defGreaterThan(dSquare, (circle.radius - this.radius) ** 2, epsilon)
    }

    getIntersectionPointsWithCircle(circle: Circle) {
        if (!this.isIntersectedWithCircle(circle)) return null
        let pO = this.centerPoint,
            pP = circle.centerPoint,
            vOP = new Vector(pO, pP),
            dist = pO.getDistanceBetweenPoint(pP),
            angle = Math.acos((this.radius ** 2 + dist ** 2 - circle.radius ** 2) / (2 * this.radius * dist)),
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
    static getCommonTangentDataOfTwoCircles(circle1: Circle, circle2: Circle) {
        let data = [],
            distSquare = circle1.centerPoint.getDistanceSquareFromPoint(circle2.centerPoint), // 圆心距平方,
            radiusDiff = circle1.radius - circle2.radius, // 半径差
            radiusSum = circle1.radius + circle2.radius, //半径和
            baseAngle = new Vector(circle2.centerPoint, circle1.centerPoint).angle

        //情况3，重合，无限多切线
        if (distSquare == 0 && circle1.radius == circle2.radius) return null
        //情况1，内含,没有公切线
        if (distSquare < radiusDiff ** 2) return null

        //情况2，内切，1条两圆自有的内切切线
        if (distSquare == radiusDiff ** 2) {
            let selfTanData = circle1.getInternallyTangentDataWithCircle(circle2)

            data.push({
                // @ts-ignore
                line: selfTanData.line,
                // @ts-ignore
                points: [selfTanData.point]
            })
        }
        // 情况5，外切，1条两圆自有的相切切线
        if (distSquare == radiusSum ** 2) {
            let selfTanData = circle1.getExternallyTangentDataWithCircle(circle2)
            data.push({
                // @ts-ignore
                line: selfTanData.line,
                // @ts-ignore
                points: [selfTanData.point]
            })
        }
        // 2条外公切线
        let angle = Math.acos(radiusDiff / Math.sqrt(distSquare)),
            p1 = circle1.getPointAtAngle(baseAngle + angle),
            p2 = circle2.getPointAtAngle(baseAngle + angle),
            p3 = circle1.getPointAtAngle(baseAngle - angle),
            p4 = circle2.getPointAtAngle(baseAngle - angle)

        data.push({
            line: Line.fromPoints(p1, p2),
            points: [p1, p2]
        })
        data.push({
            line: Line.fromPoints(p3, p4),
            points: [p3, p4]
        })

        //情况6，相离，再求出内公切线
        if (distSquare > radiusSum ** 2) {
            let angle = Math.acos(radiusSum / Math.sqrt(distSquare)),
                p1 = circle1.getPointAtAngle(baseAngle + angle),
                p2 = circle2.getPointAtAngle(baseAngle + angle),
                p3 = circle1.getPointAtAngle(baseAngle - angle),
                p4 = circle2.getPointAtAngle(baseAngle - angle)
            data.push({
                line: Line.fromPoints(p1, p2),
                points: [p1, p2]
            })
            data.push({
                line: Line.fromPoints(p3, p4),
                points: [p3, p4]
            })
        }
        //情况4，两圆相交，已求
        else if (distSquare < radiusSum ** 2) {
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
    static getCommonTangentCirclesOfTwoCirclesThroughPointNotOn(circle1: Circle, circle2: Circle, point: Point): Array<Circle> | null {
        //如果点在其中一个圆上，并不一定能作出公切圆
        //比如半径一样的且相切的两个圆，在圆心连线垂线方向与圆的交点处，无法做出公切圆，此时公切圆的半径无穷大（切线）
        //而且点在其上的这个圆的反演图形是直线，无法求公切线，无法用反演做
        let rs1 = point.getRelationshipToCircle(circle1),
            rs2 = point.getRelationshipToCircle(circle2)

        if (rs1 & RsPointToCircle.On || rs2 & RsPointToCircle.On) return null

        let inversion = new Inversion(10000, point),
            ivCircle1 = inversion.invertCircle(circle1),
            ivCircle2 = inversion.invertCircle(circle2)

        // @ts-ignore
        let ctData = Circle.getCommonTangentDataOfTwoCircles(ivCircle1, ivCircle2)
        if (ctData === null) return null
        // @ts-ignore
        return _.map(ctData, d => inversion.invertLine(d.line))
    }

    getInscribedRegularPolygon(sideCount: number, angle = 0) {
        return new RegularPolygon(this.radius, this.cx, this.cy, sideCount, angle)
    }

    getGraphic(type: GraphicImplType): (SvgDirective | CanvasDirective)[] {
        throw new Error("Method not implemented.")
    }

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    clone(): GeomObject {
        throw new Error("Method not implemented.")
    }

    toArray() {
        return [this.radius, this.cx, this.cy]
    }
    toObject() {
        return { radius: this.radius, cx: this.cx, cy: this.cy }
    }
    toString() {
        return `Circle(${this.radius}, ${this.cx}, ${this.cy})`
    }
}

export default Circle

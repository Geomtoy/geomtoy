import utility from "./utility"
import Point from "./Point"
import Line from "./Line"
import RegularPolygon from "./RegularPolygon"
import _ from "lodash"
import Vector from "./Vector"
import Segment from "./Segment"
import Inversion from "./transformation/Inversion"
import { Coordinate } from "./types"

//Circle stands for `(x-cx) ** 2 + (y-cy) ** 2 = r ** 2`
class Circle {
    radius!: number
    cx!: number
    cy!: number

    constructor(radius: number, cx: number, cy: number)
    constructor(radius: number, centerPointCoordinate: Coordinate)
    constructor(radius: number, centerPoint: Point)
    constructor(radius: number, cx?: any, cy?: any) {
        if (!utility.defGreaterThan(radius, 0)) {
            throw new Error(`[G]The \`radius\` of \`Circle\` can NOT be 0 or less than 0.`)
        }
        this.radius = radius
        if (_.isNumber(cx) && _.isNumber(cy)) {
            Object.assign(this, { cx, cy })
            return this
        }
        if (utility.type.isCoordinate(cx)) {
            Object.assign(this, { cx: cx[0], cy: cx[1] })
            return this
        }
        if (cx instanceof Point) {
            Object.assign(this, { cx: cx.x, cy: cx.y })
        }
    }

    get centerPoint() {
        return new Point(this.cx, this.cy)
    }

    isSameAs(circle: Circle) {
        return this.centerPoint.isSameAs(circle.centerPoint) && utility.apxEqualsTo(this.radius, circle.radius)
    }

    /**
     * 获得圆上某个角度的点
     * @param {number} angle
     * @returns {Point}
     */
    getPointAtAngle(angle:number): Point {
        return this.centerPoint.goTo(angle, this.radius)
    }
    /**
     * 若`点point`在`圆this`上，则求过`点point`的`圆this`的切线
     * @param {Point} point
     * @returns {Line | null}
     */
    getTangentLineAtPoint(point: Point): Line | null {
        if (!point.isOnCircle(this)) return null
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

    getArcLengthBetween(p1:Point, p2:Point, clockwise = false) {
        if (p1.isSameAs(p2)) return NaN
        let angle = this.getArcAngleBetween(p1, p2, clockwise)
        return this.getPerimeter() * (Math.abs(angle) / (2 * Math.PI))
    }

    getArcAngleBetween(p1:Point, p2:Point, clockwise = false):number {
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
    getTangleDataWithPointOutside(point: Point): object | null {
        if (!point.isOutsideCircle(this)) return null

        //设圆心为O，圆外一点为P，切线与圆的切点为Q
        let pO = this.centerPoint,
            vO = new Vector(pO),
            pP = point,
            vOP = new Vector(pO, pP),
            dist = pO.getDistanceFromPoint(pP),
            includedAngle = Math.asin(this.radius / dist),
            data = {
                clockwise: { angle: -includedAngle },
                anticlockwise: { angle: includedAngle }
            }
        _.forEach(data, element => {
            let vQ = vO.add(vOP.rotate(includedAngle).multiply(this.radius / dist)),
                pQ = Point.fromVector(vQ)
            element.point = pQ
            element.line = Line.fromPoints(pQ, pP)
        })
        return data
    }

    /**
     * `圆point`和`圆this`是否相切（内切、外切）
     * @param {Circle} circle
     * @returns {Boolean}
     */
    isTangentWithCircle(circle: Circle): boolean {
        return this.isInternallyTangentWithCircle(circle) || this.isExternallyTangentWithCircle(circle)
    }
    isInternallyTangentWithCircle(circle:Circle) {
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint)
        return utility.apxEqualsTo(dSquare, (circle.radius - this.radius) ** 2)
    }
    isExternallyTangentWithCircle(circle:Circle) {
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint)
        return utility.apxEqualsTo(dSquare, (circle.radius + this.radius) ** 2)
    }
    getInternallyTangentDataWithCircle(circle:Circle) {
        if (!this.isInternallyTangentWithCircle(circle)) return null
        let p = this.getPointAtAngle(new Vector(this.centerPoint, circle.centerPoint).angle),
            l = this.getTangentLineAtPoint(p)
        return {
            point: p,
            line: l
        }
    }
    getExternallyTangentDataWithCircle(circle:Circle) {
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
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint)
        return utility.defLessThan(dSquare, (circle.radius - this.radius) ** 2)
    }
    /**
     * `圆this`是否在`圆circle`的外部，包含circle
     * @param {Circle} circle
     * @returns {boolean}
     */
    isOutsideCircle(circle: Circle): boolean {
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint)
        return utility.defGreaterThan(dSquare, (circle.radius + this.radius) ** 2)
    }
    isIntersectedWithCircle(circle) {
        let dSquare = circle.centerPoint.getDistanceSquareFromPoint(this.centerPoint)
        return utility.defLessThan(dSquare, (circle.radius + this.radius) ** 2) && utility.defGreaterThan(dSquare, (circle.radius - this.radius) ** 2)
    }

    getIntersectionPointsWithCircle(circle) {
        if (!this.isIntersectedWithCircle(circle)) return null
        let pO = this.centerPoint,
            pP = circle.centerPoint,
            vOP = new Vector(pO, pP),
            dist = pO.getDistanceFromPoint(pP),
            angle = Math.acos((this.radius ** 2 + dist ** 2 - circle.radius ** 2) / (2 * this.radius * dist)),
            baseAngle = vOP.angle,
            points = [this.getPointAtAngle(baseAngle + angle), this.getPointAtAngle(baseAngle - angle)]
        return points
    }

    /**
     * 是否与`圆this`正交，过其中一交点分别作两圆的切线，两切线夹角（圆的交角）为直角
     * @param {circle} circle
     */
    isOrthogonalWithCircle(circle) {}

    /**
     * 获取`圆circle1`和`圆circle2`的公切线信息
     * @param {circle} circle1
     * @param {circle} circle2
     * @returns {Array<Object> | null}
     */
    //1.两圆内含，没有公切线
    //2.两圆内切，有1个条公切线，其中：1条两圆自有的内切切线
    //3.两圆重合，有无数条公切线（或者说没有公切线）
    //4.两圆相交。有2条公切线，其中：2条外公切线
    //5.两圆外切，有3条公切线，其中：1条两圆自有的外切切线，2条外公切线
    //6.两圆相离，有4条公切线，其中：2条外公切线，2条内公切线
    static getCommonTangentDataOfTwoCircles(circle1, circle2) {
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
                line: selfTanData.line,
                points: [selfTanData.point]
            })
        }
        // 情况5，外切，1条两圆自有的相切切线
        if (distSquare == radiusSum ** 2) {
            let selfTanData = circle1.getExternallyTangentDataWithCircle(circle2)
            data.push({
                line: selfTanData.line,
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
     * 过不在两圆`圆circle1`和`圆circle2`上的一点`点point`，求两圆的公切圆
     * @param {*} circle1
     * @param {*} circle2
     * @param {*} point
     * @returns {Array<Circle>}
     */
    static getCommonTangentCirclesOfTwoCirclesThroughPointNotOn(circle1, circle2, point) {
        //如果点在其中一个圆上，并不一定能作出公切圆
        //比如半径一样的且相切的两个圆，在圆心连线垂线方向与圆的交点处，无法做出公切圆，此时公切圆的半径无穷大（切线）
        //而且点在其上的这个圆的反演图形是直线，无法求公切线，无法用反演做
        if (point.isOnCircle(circle1) || point.isOnCircle(circle2)) return null

        let inversion = new Inversion(undefined, point),
            ivCircle1 = inversion.invertCircle(circle1),
            ivCircle2 = inversion.invertCircle(circle2)

        let ctData = Circle.getCommonTangentDataOfTwoCircles(ivCircle1, ivCircle2)
        if (ctData === null) return null
        return _.map(ctData, d => inversion.invertLine(d.line))
    }

    getInscribedRegularPolygon(number, angle = 0) {
        return new RegularPolygon(this.radius, this.cx, this.cy, number, angle)
    }

    getGraphic() {}
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

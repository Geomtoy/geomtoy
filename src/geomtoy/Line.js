import _ from "lodash"
import utility from "./utility"
import Point from "./Point"
import Segment from "./Segment"
import Graphic from "./graphic"
import Rectangle from "./Rectangle"
import G from "."

//Line stands for `ax + by + c = 0`
class Line {
    a
    b
    c

    constructor(a, b, c) {
        if (_.isArrayLike(a)) {
            Object.assign(this, { a: a[0], b: a[1], c: a[2] })
        } else if (a instanceof Line) {
            Object.assign(this, { a: a.a, b: a.b, c: a.c })
        } else {
            Object.assign(this, { a, b, c })
        }

        if (!_.isNumber(this.a)) this.a = Number(this.a) || 0
        if (!_.isNumber(this.b)) this.b = Number(this.b) || 0
        if (!_.isNumber(this.c)) this.c = Number(this.c) || 0

        if (a === 0 && b === 0) {
            throw new Error(`[G]\`Line\` param \`a\` and \`b\` can NOT equal to 0 at the same time.`)
        }
    }

    /**
     * 从`点point1`,`点point2`两个点确定一条直线
     * @param {Point} point1
     * @param {Point} point2
     * @returns this
     */
    static #fromPoints(point1, point2) {
        let x1 = point1.x,
            y1 = point1.y,
            x2 = point2.x,
            y2 = point2.y,
            a = y2 - y1,
            b = x1 - x2,
            c = (x2 - x1) * y1 - (y2 - y1) * x1
        return new Line(a, b, c)
    }
    static fromPoints(point1, point2) {
        if (point1.isSameAs(point2)) {
            throw new Error(`[G]Points point1 and point2 are the same, they can NOT determine a line.`)
        }
        return Line.#fromPoints(point1, point2)
    }
    static fromPointAndAngle(point, angle) {}

    static fromSegment(segment) {
        return this.#fromPoints(segment.p1, segment.p2)
    }

    /**
     * `直线this`的斜率
     * @returns {Number}
     */
    getSlope() {
        //ax+c = 0 垂直于x轴的直线，与x轴的夹角为Math.PI / 2, 斜率无穷大或不存在（Math.tan(Math.PI / 2)的结果有bug）
        if (utility.apxEqualsTo(this.b, 0)) return null
        return -(this.a / this.b)
    }
    /**
     * `直线this`的截距
     * @returns {Number}
     */
    getInterceptY() {
        //ax+c = 0 垂直于x轴的直线，不与y轴相交，截距无穷大或不存在
        if (utility.apxEqualsTo(this.b, 0)) return null
        return -(this.c / this.b)
    }
    getInterceptX() {
        //by+c = 0 垂直于y轴的直线，不与x轴相交，截距无穷大或不存在
        if (utility.apxEqualsTo(this.a, 0)) return null
        return -(this.c / this.a)
    }

    getRandomPointOnLine() {
        if (utility.apxEqualsTo(this.b, 0)) {
            k = -(this.b / this.a) //ax+by+c = 0  x=(-by-c)/a  x=-(b/a)y-c/a
            b = -(this.c / this.a)
            let y = _.random(1000, true)
            x = -(b / a) * y - c / a
        } else {
            k = -(this.a / this.b) //ax+by+c = 0  y=(-ax-c)/b  y=-(a/b)x-c/b
            b = -(this.c / this.b)
            let x = _.random(1000, true)
            y = -(a / b) * x - c / b
        }
        return new Point(x, y)
    }

    /**
     * 是否与`圆circle`相交
     * @param {Circle} circle
     * @returns {Boolean | Array<Point>}
     */
    #isIntersectedWithCircle(circle) {
        if (circle.centerPoint.getDistanceToLine(this) > circle.radius) {
            return false
        }
        let k,
            b,
            m = circle.cx,
            n = circle.cy,
            r = circle.radius

        if (utility.apxEqualsTo(this.b, 0)) {
            k = -(this.b / this.a) //ax+by+c = 0  x=(-by-c)/a  x=-(b/a)y-c/a
            b = -(this.c / this.a)
            let aY = 1 + k ** 2,
                bY = 2 * k * (b - m) - 2 * n,
                cY = n ** 2 + (b - m) ** 2 - r ** 2,
                roots = utility.solveQuadraticEquation(aY, bY, cY)
            return _.map(roots, root => {
                return new Point(k * root + b, root)
            })
        } else {
            k = -(this.a / this.b) //ax+by+c = 0  y=(-ax-c)/b  y=-(a/b)x-c/b
            b = -(this.c / this.b)
            let aX = 1 + k ** 2,
                bX = 2 * k * (b - n) - 2 * m,
                cX = m ** 2 + (b - n) ** 2 - r ** 2,
                roots = utility.solveQuadraticEquation(aX, bX, cX)
            return _.map(roots, root => {
                return new Point(root, k * root + b)
            })
        }
    }
    isIntersectedWithCircle(circle) {
        return Boolean(this.#isIntersectedWithCircle(circle))
    }
    getIntersectionPointsWithCircle(circle) {
        let ret = this.#isIntersectedWithCircle(circle)
        if (ret) return ret
        return null
    }

    /**
     * 是否与`直线line`相交
     * @param {Line} line
     * @returns {Boolean | Point}
     */
    #isIntersectedWithLine(line) {
        let a1 = this.a,
            b1 = this.b,
            c1 = this.c,
            a2 = line.a,
            b2 = line.b,
            c2 = line.c,
            m = a1 * b2 - a2 * b1
        //两直线平行或重合
        if (m == 0) return false
        let x = (c2 * b1 - c1 * b2) / m,
            y = (c1 * a2 - c2 * a1) / m
        return new Point(x, y)
    }
    isIntersectedWithLine(line) {
        return Boolean(this.#isIntersectedWithLine(line))
    }
    getIntersectionPointWithLine(line) {
        let ret = this.#isIntersectedWithLine(line)
        if (ret) return ret
        return null
    }

    /**
     * 是否与`线段segment`相交
     * @param {Segment} segment
     * @returns {Boolean | Point}
     */
    #isIntersectedWithSegment(segment) {
        let l = Line.fromSegment(segment),
            ret = this.#isIntersectedWithLine(l)
        if (ret && ret.isBetweenPoints(segment.p1, segment.p2)) return ret
        return false
    }
    isIntersectedWithSegment(segment) {
        return Boolean(this.#isIntersectedWithSegment(segment))
    }
    getIntersectionPointWithSegment(segment) {
        let ret = this.#isIntersectedWithSegment(segment)
        if (ret) return ret
        return null
    }

    /**
     * 是否与`矩形rectangle`相交
     * @param {Rectangle} rectangle
     * @returns {Boolean | Array<Point>}
     */
    #isIntersectedWithRectangle(rectangle) {
        let s1 = Segment.fromPoints(rectangle.p1, rectangle, p2),
            s2 = Segment.fromPoints(rectangle.p2, rectangle.p3),
            s3 = Segment.fromPoints(rectangle.p3, rectangle.p4),
            s4 = Segment.fromPoints(rectangle.p4, rectangle.p1),
            ret1 = this.#isIntersectedWithSegment(s1),
            ret2 = this.#isIntersectedWithSegment(s2),
            ret3 = this.#isIntersectedWithSegment(s3),
            ret4 = this.#isIntersectedWithSegment(s4),
            //去掉相交于顶点出现重复的情况
            ret = _.uniqWith(_.compact([ret1, ret2, ret3, ret4]), (i, j) => i.isSameAs(j))

        if (ret) return ret
        return false
    }
    isIntersectedWithRectangle(rectangle) {
        return Boolean(this.#isIntersectedWithRectangle(rectangle))
    }
    getIntersectionPointWithRectangle(rectangle) {
        let ret = this.#isIntersectedWithRectangle(rectangle)
        if (ret) return ret
        return null
    }

    getNormalLineAtPoint() {}

    /**
     * 过`直线this`上一点`点point`的垂线
     * @param {Point} point
     * @returns {Line}
     */
    getPerpendicularLineWithPointOn(point) {
        if (!point.isOnLine(this)) return null
        let a = this.a,
            b = this.b,
            c = this.c,
            x0 = point.x,
            y0 = point.y

        if (utility.apxEqualsTo(this.b, 0)) {
            //ax+by+c = 0  x=-(b/a)y-c/a，斜率为-(b/a)，直线垂直斜率乘积为-1，故垂线：x-x0=a/b(y-y0)
            // bx-ay+ay0-bx0=0
            return new Line(b, -a, a * y0 - b * x0)
        } else {
            //ax+by+c = 0  y=-(a/b)x-c/b，斜率为-(a/b)，直线垂直斜率乘积为-1，故垂线：y-y0=b/a(x-x0)
            // -bx+ay-ay0+bx0=0
            return new Line(-b, a, -a * y0 + b * x0)
        }
    }

    /**
     * `直线this`外一点`点point`到`直线this`的垂点（垂足）
     * @param {Line} l
     * @returns {Point | null}
     */
    getPerpendicularPointWithPointNotOn(point) {
        if (point.isOnLine(this)) return null

        let a = this.a,
            b = this.b,
            c = this.c,
            x0 = point.x,
            y0 = point.y,
            x,
            y
        x = (b ** 2 * x0 - a * b * y0 - a * c) / (a ** 2 + b ** 2)
        y = (-a * b * x0 + a ** 2 * y0 - b * c) / (a ** 2 + b ** 2)
        return new Point(x, y)
    }

    /**
     * `直线this`与`直线line`是否平行（包括重合）
     * @param {Line} line
     * @returns
     */
    isParallelToLine(line) {
        if (this.b === 0 && line.b === 0) return true
        if (this.a === 0 && line.a === 0) return true
        return utility.apxEqualsTo(this.a * line.b, this.b * line.a)
    }
    /**
     * 若`直线this`与`直线line`平行，则返回它们之间的距离，否则返回null
     * @param {Line} line
     * @returns {Number | null}
     */
    getDistanceToParallelLine(line) {
        if (!this.isParallelToLine(line)) return null
        let l1 = this,
            l2 = line
        return Math.abs(l1.c - l2.c) / Math.hypot(l1.a, l1.b)
    }

    getGraphic(type) {
        let lowerBound = -G.options.graphic.lineRange,
            upperBound = G.options.graphic.lineRange,
            { a, b, c } = this,
            x1,
            x2,
            y1,
            y2
        //x=-(b/a)y-c/a
        //y=-(a/b)x-c/b
        if (this.b === 0) {
            y1 = lowerBound
            y2 = upperBound
            x1 = -(b / a) * y1 - c / a
            x2 = -(b / a) * y2 - c / a
        } else {
            x1 = lowerBound
            x2 = upperBound
            y1 = -(a / b) * x1 - c / b
            y2 = -(a / b) * x2 - c / b
        }
        let p1 = new Point(x1, y1),
            p2 = new Point(x2, y2),
            g = new Graphic()
        g.moveTo(x1, y1)
        g.lineTo(x2, y2)
        g.close()
        return g.valueOf(type)
    }

    clone() {
        return new Line(this)
    }
    toArray() {
        return [this.a, this.b, this.c]
    }
    toObject() {
        return { a: this.a, b: this.b, c: this.c }
    }
    toString() {
        return `Line(${this.a}, ${this.b}, ${this.c})`
    }
}

export default Line

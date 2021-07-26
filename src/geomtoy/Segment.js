import Point from "./Point"
import Line from "./Line"
import Vector from "./Vector"
import util from "./utility"

class Segment {
    p1
    p2

    constructor(x1, y1, x2, y2) {
        if (_.isArrayLike(x1)) {
            Object.assign(this, { p1: new Point(x1[0], x1[1]), p2: new Point(x1[2], x1[3]) })
        } else if (x1 instanceof Point && y1 instanceof Point) {
            Object.assign(this, { p1: x1.clone(), p2: y1.clone() })
        } else {
            Object.assign(this, { p1: new Point(x1, y1), p2: new Point(x2, y2) })
        }
        if (this.p1.isSameAs(this.p2)) {
            throw new Error(`[G]The two end points of a \`Segment\` must be distinct.`)
        }
    }

    static fromPoints(p1, p2) {
        return new Segment(p1, p2)
    }

    /**
     * `线段this`与`线段s`是否相同
     * @param {Segment} s
     * @returns {boolean}
     */
    isSameAs(s) {
        return (this.p1.isSameAs(s.p1) && this.p2.isSameAs(s.p2)) || (this.p1.isSameAs(s.p2) && this.p2.isSameAs(s.p1))
    }
    /**
     * `线段this`与`线段s`是否垂直，无论是否相交，夹角为Math.PI / 2
     * @param {Segment} s
     * @returns {boolean}
     */
    isPerpendicularToSegment(s) {
        let v1 = new Vector(this.p1, this.p2),
            v2 = new Vector(s.p1, s.p2),
            dp = v1.dotProduct(v2)
        return util.apxEqualsTo(dp, 0)
    }
    /**
     * `线段this`与`线段s`是否平行，无论是否共线乃至相同，夹角为0或者Math.PI
     * @param {Segment} s
     * @returns {boolean}
     */
    isParallelToSegment(s) {
        let v1 = new Vector(this.p1, this.p2),
            v2 = new Vector(s.p1, s.p2),
            cp = v1.crossProduct(v2)
        return util.apxEqualsTo(cp, 0)
    }
    /**
     * `线段this`与`线段s`是否共线，无论是否相接乃至相同
     * @param {Segment} s
     * @returns {boolean}
     */
    isCollinearWithSegment(s) {
        let v1 = new Vector(this.p1, this.p2),
            v2 = new Vector(s.p1, s.p2),
            v3 = new Vector(this.p1, s.p1),
            cp1 = v1.crossProduct(v2),
            cp2 = v3.crossProduct(v2)
        return util.apxEqualsTo(cp1, 0) && util.apxEqualsTo(cp2, 0)
    }
    /**
     * `线段this`与`线段s`是否相接，即有且只有一个端点被共用(若两个共用则相同)，无论夹角为多少
     * @param {Segment} s
     * @returns {boolean | Point} 接点
     */
    #isJointedWithSegment(s) {
        let j1 = this.p1.isSameAs(s.p1),
            j2 = this.p2.isSameAs(s.p2),
            j3 = this.p1.isSameAs(s.p2),
            j4 = this.p2.isSameAs(s.p1)

        if (j1 ^ j2 || j3 ^ j4) {
            return ((j1 || j3) && this.p1) || ((j2 || j4) && this.p2)
        }
        return false
    }
    isJointedWithSegment(s) {
        return Boolean(this.#isJointedWithSegment(s))
    }
    getJointPointWithSegment(s) {
        let ret = this.#isJointedWithSegment(s)
        if (ret) return ret
        return null
    }
    /**
     * `线段this`与`线段s`是否有重合，即有部分重合的一段(线段)
     * @param {Segment} s
     * @returns {boolean | Segment} 重合部分
     */
    #isOverlappedWithSegment(s) {
        if (!this.isCollinearWithSegment(s)) return false //重合的前提是共线

        let arrP = []

        if (this.p1.isBetweenPoints(s.p1, s.p2)) arrP.push(this.p1)
        if (this.p2.isBetweenPoints(s.p1, s.p2)) arrP.push(this.p2)
        if (s.p1.isBetweenPoints(this.p1, this.p2)) arrP.push(s.p1)
        if (s.p2.isBetweenPoints(this.p1, this.p2)) arrP.push(s.p2)

        //去掉相接的情况，相接uniq之后，元素个数为1，其余情况为2
        arrP = _.uniqWith(arrP, (i, j) => i.isSameAs(j))
        if (arrP.length == 2) return new Segment(arrP[0], arrP[1])

        return false
    }
    isOverlappedWithSegment(s) {
        return Boolean(this.#isOverlappedWithSegment(s))
    }
    getOverlapSegmentWithSegment(s) {
        let ret = this.#isOverlappedWithSegment(s)
        if (ret) return ret
        return null
    }
    /**
     * `线段this`与`线段s`是否相交，相交不仅要求有且仅有一个点重合，且要求夹角不等于0或者Math.PI
     * 包含了不共线的相接和线段的端点在另一个线段上的特殊情况
     * @param {Segment} segment
     * @returns {boolean | Point} 交点
     */
    #isIntersectedWithSegment(segment) {
        if (this.isParallelTo(segment)) return false //相交的前提是不平行

        let v1 = new Vector(this.p1, this.p2),
            v2 = new Vector(segment.p1, segment.p2),
            v3 = new Vector(this.p1, segment.p1),
            cp1 = v1.crossProduct(v2),
            cp2 = v3.crossProduct(v2),
            cp3 = v3.crossProduct(v1)

        if (util.apxEqualsTo(cp1, 0)) {
            return false
        }
        let t1 = cp3 / cp1,
            t2 = cp2 / cp1
        if (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) {
            return Point.fromVector(new Vector(p1).add(v1.multiply(t2)))
        }
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

    getMiddlePoint() {
        let x1 = this.p1.x,
            y1 = this.p1.y,
            x2 = this.p2.x,
            y2 = this.p2.y
        return new Point((x1 + x2) / 2, (y1 + y2) / 2)
    }

    /**
     * 获得从线段起点开始的lambda定比分点P
     * @description 当P为内分点时，lambda > 0；当P为外分点时，lambda < 0 && lambda !== -1；当P与A重合时，lambda === 0,当P与B重合时，lambda===1
     * @param {number} lambda
     * @returns {Point}
     */
    getInterpolatePoint(lambda){
        if (lambda === -1) throw new Error(`[G]Can NOT divide \`Segment\` by -1.`)
        let x = (this.p1.x + lambda * this.p2.x) / (1 + lambda),
            y = (this.p1.y + lambda * this.p2.y) / (1 + lambda)
        return new Point(x, y)
    }

    /**
     * `直线l`分线段成两部分之间的比例
     * @param {Line} l
     * @returns {number}
     */
    getDivisionRatioByLine(l) {
        return -(l.a * this.p1.x + l.b * this.p1.y + l.c) / (l.a * this.p2.x + l.b * this.p2.y + l.c)
    }

    /**
     * `线段this`与x轴正方向的夹角，范围[-Math.PI, Math.PI]
     * @param {*} p
     * @returns
     */
    getAngle = function () {
        let p1 = this.p1,
            p2 = this.p2
        return Math.atan2(p2.y - p1.y, p2.x - p1.x)
    }

    getIntersectionPointWithLine(l) {}

    toArray() {
        return [this.p1.x, this.p1.y, this.p2.x, this.p2.y]
    }
    toObject() {
        return { p1x: this.p1.x, p1y: this.p1.y, p2x: this.p2.x, p2y: this.p2.y }
    }
    toString() {
        return `Segment(${this.p1.x}, ${this.p1.y}, ${this.p2.x}, ${this.p2.y})`
    }
}

export default Segment

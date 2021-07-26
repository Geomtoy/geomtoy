import _ from "lodash"
import Point from "./Point"
import util from "./utility"

//Size代表的是一个点和另一个点的x，y轴坐标的差值关系，所以两个值可以为负
//一个矩形的size如果为Size(-1，-1)，而起始点为Point(0, 0)，则Rectangle是处于在笛卡尔坐标系第三象限中边长为1的正方形
//即 Rectangle(Point(0 , 0), Size(-1, -1))和Rectangle(Point(-1, 0), Size(1, 1))是同一个矩形

class Size {
    width
    height

    constructor(w, h) {
        if (_.isArrayLike(w)) {
            this.width = w[0]
            this.height = w[1]
        } else if (w instanceof Point) {
            this.width = w.x
            this.height = w.y
        } else if (w instanceof Size) {
            this.width = w.width
            this.height = w.height
        } else {
            this.width = w
            this.height = h
        }
        if (!_.isNumber(this.width)) {
            this.width = Number(this.width) || 0
        }
        if (!_.isNumber(this.height)) {
            this.height = Number(this.height) || 0
        }
    }

    static fromPoints(p1, p2) {
        return new Size(p2.x - p1.x, p2.y - p1.y)
    }

    static isSize(s) {
        return s instanceof Size
    }

    static zero() {
        return new Size(0, 0)
    }
    static fromPoint(p) {
        return new Size(p)
    }
    static standardize(s) {
        return new Size(Math.abs(s.width), Math.abs(s.height))
    }
    static add(s1, s2) {
        return new Size(s1.width + s2.width, s1.height + s2.height)
    }
    static translate(s1, s2) {
        return Size.add(s1, s2)
    }

    static subtract(s1, s2) {
        return new Size(s1.width - s2.width, s1.height - s2.height)
    }
    static multiply(s, n) {
        return new Size(s.width * n, s.height * n)
    }
    static scale(s, n) {
        return Size.multiply(s, n)
    }

    static divide(s, n) {
        if (n === 0) throw new Error(`[G]Can NOT divide by 0.`)
        return new Size(s.width / n, s.height / n)
    }

    isZeroSize() {
        return this.width === 0 && this.height === 0
    }

    isEqualTo(s) {
        return util.apxEqualsTo(this.width, s.width) && util.apxEqualsTo(this.height, s.height)
    }
    standardize() {
        this.width = Math.abs(this.width)
        this.height = Math.abs(this.height)
        return this
    }

    keepAspectRadioAndFit(size, keepInside = true) {
        if (this.width === 0) {
            return new Size(0, size.height)
        }
        if (this.height === 0) {
            return new Size(size.width, 0)
        }
        let nw = (this.width / this.height) * size.height,
            nh = (this.height / this.width) * size.width

        if (nw === size.width && nh === size.height) {
            return new Size(size)
        }
        if ((nw < size.width) ^ keepInside) {
            return new Size(nw, size.height)
        } else {
            return new Size(size.width, nh)
        }
    }

    add(s) {
        this.width += s.width
        this.height += s.height
        return this
    }
    translate(s) {
        return this.add(s)
    }

    subtract(s) {
        this.width -= s.width
        this.height -= s.height
        return this
    }
    multiply(n) {
        this.width *= n
        this.height *= n
        return this
    }
    scale(n) {
        return this.multiply(n)
    }

    divide(n) {
        if (n === 0) throw new Error(`[G]Can NOT divide by 0.`)
        this.width /= n
        this.height /= n
        return this
    }

    toArray() {
        return [this.width, this.height]
    }
    toObject() {
        return { width: this.width, height: this.height }
    }
    toString() {
        return `Size(${this.width}, ${this.height})`
    }
}

export default Size

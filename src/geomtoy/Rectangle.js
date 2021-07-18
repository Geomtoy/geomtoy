import Point from "./Point"
import Size from "./Size"
import _ from "lodash"

class Rectangle {
    x
    y
    width
    height

    constructor(x, y, w, h, r) {
        if (_.isArrayLike(w)) {
            Object.assign(this, { x: x[0], y: x[1], width: x[2], height: x[3] })
        } else if (x instanceof Point && y instanceof Size) {
            Object.assign(this, { x: x.x, y: x.y, width: y.width, height: y.height })
        } else if (x instanceof Point && !y instanceof Size) {
            Object.assign(this, { x: x.x, y: x.y, width: y, height: w })
        } else if (!x instanceof Point && width instanceof Size) {
            Object.assign(this, { x: x.x, y: x.y, width: w.width, height: w.height })
        } else {
            Object.assign(this, { x, y, width: w, height: h })
        }
        this.rotation = r || 0
    }

    get size() {
        return new Size(this.width, this.height)
    }
    set size(s) {
        if (_.isArrayLike(s)) {
            Object.assign(this, { width: s[0], height: s[1] })
        } else if (s instanceof Size) {
            Object.assign(this, { width: s.width, height: s.height })
        }
    }
    get origin() {
        return new Point(this.x, this.y)
    }
    set origin(p) {
        if (_.isArrayLike(p)) {
            Object.assign(this, { x: p[0], y: p[1] })
        } else if (p instanceof Point) {
            Object.assign(this, { x: p.x, y: p.y })
        }
    }

    get p1() {
        return new Point(this.x, this.y)
    }
    get p2() {
        return new Point(this.x + this.width, y)
    }
    get p3() {
        return new Point(this.x + this.width, this.y + this.height)
    }
    get p4() {
        return new Point(this.x, this.y + this.height)
    }

    static fromPoints(p1, p2) {
        return new Rectangle(p1, Size.fromPoints(p1, p2))
    }

    static standardize(rect) {
        return this.#standardize(true, rect)
    }
    static #standardize(_new, rect) {
        let x = rect.x,
            y = rect.y,
            w = rect.width,
            h = rect.height
        if (x > x + w) {
            x = x + w
            w = Math.abs(w)
        }
        if (y > y + h) {
            y = y + h
            h = Math.abs(h)
        }
        if (_new) {
            return new Rectangle(x, y, w, h)
        }
        rect.x = x
        rect.y = y
        rect.width = w
        rect.height = h
    }

    static pad(rect, s) {
        return Rectangle.#pad(true, rect, s)
    }

    /**
     *
     * @param {Boolean} _new
     * @param {Rectangle} rect
     * @param {Size} s
     * @returns {Rectangle | undefined}
     */
    static #pad(_new, rect, s) {
        let x = rect.x
        y = rect.y
        w = rect.width
        h = rect.height

        x += s.width
        y += s.height
        w -= s.width * 2
        h -= s.height * 2
        if (_new) {
            return new Rectangle(x, y, w, h)
        }
        rect.x = x
        rect.y = y
        rect.width = w
        rect.height = h
    }

    static #scale() {}
    static #translate() {}
    static #rotate() {}

    static #inflate() {}

    standardize() {
        Rectangle.#standardize(false, this)
        return this
    }

    pad(s) {
        Rectangle.#pad(false, this, s)
        return this
    }

    // getIntersectionPointWithLine (double a, double b, double c, double x1, double y1, double x2, double y2, double x3, double y3) {
    // 	double x4,y4;//定义矩形第四个点的横纵坐标
    // 	x4 = x1 + x3 - x2;
    // 	y4 = y1 + y3 - y2;
    // 	//接下来依次求解直线与构成矩形的四条线段的交点
    // 	boolean m1,m2,m3,m4;//设置是否有交点的标志
    // 	System.out.println("直线与矩形交点的计算结果为 ： ");
    // 	m1 = pointSegment(a, b, c, x1, y1, x2, y2);
    // 	m2 = pointSegment(a, b, c, x2, y2, x3, y3);
    // 	m3 = pointSegment(a, b, c, x3, y3, x4, y4);
    // 	m4 = pointSegment(a, b, c, x4, y4, x1, y1);
    // 	if(m1 == m2 == m3 == m4 == false)
    // 		System.out.println("直线与矩形没有交点");
    // }
}

export default Rectangle

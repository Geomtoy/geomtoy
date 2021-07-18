import Point from "./Point"
import Circle from "./Circle"
import Line from "./Line"

class RegularPolygon {
    radius
    cx
    cy
    number
    angle
    constructor(radius, cx, cy, number, angle) {
        if (_.isArrayLike(radius)) {
            Object.assign(this, { radius: radius[0], cx: radius[1], cy: radius[2], number: radius[3], angle: radius[4] })
        } else if (cx instanceof Point) {
            Object.assign(this, { radius: radius, cx: cx.x, cy: cx.y, number: cy, angle: number })
        } else {
            Object.assign(this, { radius, cx, cy, number, angle })
        }
        if (!this.angle) this.angle = 0
    }

    get points() {
        let ps = []
        _.forEach(_.range(this.number), i => {
            let p = Point.goTo(this.centerPoint, ((2 * Math.PI) / this.number) * i + this.angle, this.radius)
            ps.push(p)
        })
        return ps
    }
    get lines() {
        let ps = this.points,
            ls = []

        _.forEach(ps, (p, index) => {
            ls.push(Line.fromPoints(_.nth(ps, index - this.number), _.nth(ps, index - this.number + 1)))
        })
        return ls
    }

    get centerPoint() {
        return new Point(this.cx, this.cy)
    }
    set centerPoint(value) {
        this.cx = value.x
        this.cy = value.y
    }

    get apothem() {
        return this.radius * Math.cos(Math.PI / n)
    }
    set apothem(value) {
        this.radius = value / Math.cos(Math.PI / n)
    }

    get edgeLength() {
        return 2 * this.radius * Math.sin(Math.PI / n)
    }
    set edgeLength(value) {
        this.radius = value / (2 * Math.sin(Math.PI / n))
    }
}

export default RegularPolygon

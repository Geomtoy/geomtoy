import Point from "./geomtoy/Point"
import Segment from "./geomtoy/Segment"
import Triangle from "./geomtoy/Triangle"
import Circle from "./geomtoy/Circle"
import Polyline from "./geomtoy/Polyline"
import Polygon from "./geomtoy/Polygon"
import RegularPolygon from "./geomtoy/RegularPolygon"

const _reveal = (obj, resolve, duration, delay) => {
    obj.attr({
        "fill-opacity": 0,
        "stroke-opacity": 0
    })
        .animate(duration, delay, "now")
        .attr({
            "fill-opacity": 1,
            "stroke-opacity": 1
        })
        .after(() => {
            resolve(obj)
        })
}

Point.prototype.draw = async function (container, { duration = 2000, delay = 0 } = {}) {
    return new Promise((resolve, reject) => {
        let point = container.circle()

        point.attr({
            r: 1,
            cx: this.x,
            cy: this.y
        })
        _reveal(point, resolve, duration, delay)
    })
}

Polyline.prototype.draw = function (container) {
    return new Promise((resolve, reject) => {
        let polyline = container.polyline().plot([...this.points])
        _reveal(polyline, resolve, duration, delay)
    })
}

Polygon.prototype.draw = async function (container, { duration = 2000, delay = 0 } = {}) {
    return new Promise((resolve, reject) => {
        let polygon = container.polygon().plot([...this.points.map(p => p.toArray())])
        _reveal(polygon, resolve, duration, delay)
    })
}

Segment.prototype.draw = async function (container, { duration = 2000, delay = 0 } = {}) {
    return new Promise((resolve, reject) => {
        let segment = container.line()
        segment.plot([this.p1.toArray(), this.p2.toArray()])
        _reveal(segment, resolve, duration, delay)
    })
}

Triangle.prototype.draw = async function (container, { duration = 2000, delay = 0 } = {}) {
    return new Promise((resolve, reject) => {
        let triangle = container.polygon().plot([this.p1.toArray(), this.p2.toArray(), this.p3.toArray()])
        _reveal(triangle, resolve, duration, delay)
    })
}

Circle.prototype.draw = async function (container, { duration = 2000, delay = 0 } = {}) {
    return new Promise((resolve, reject) => {
        let circle = container.circle().attr({
            r: this.radius,
            cx: this.cx,
            cy: this.cy
        })
        _reveal(circle, resolve, duration, delay)
    })
}
RegularPolygon.prototype.draw = async function (container, { duration = 2000, delay = 0 } = {}) {
    return new Promise((resolve, reject) => {
        let regularPolygon = container.polygon()
        regularPolygon.plot([...this.points.map(p => p.toArray())])
        _reveal(regularPolygon, resolve, duration, delay)
    })
}

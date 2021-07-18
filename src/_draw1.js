import Point from "./geomtoy/Point"
import Segment from "./geomtoy/Segment"
import Triangle from "./geomtoy/Triangle"
import Circle from "./geomtoy/Circle"
import Polyline from "./geomtoy/Polyline"
import Polygon from "./geomtoy/Polygon"
import RegularPolygon from "./geomtoy/RegularPolygon"

Point.prototype.draw = function (container) {
    return container.circle().attr({
        r: 1,
        cx: this.x,
        cy: this.y,
        fill: "currentColor"
    })
}

Polyline.prototype.draw = function (container) {
    return container.polyline().plot([...this.points])
}

Polygon.prototype.draw = function (container) {
    return container.polygon().plot([...this.points.map(p => p.toArray())])
}

Segment.prototype.draw = function (container) {
    return container.line().plot([this.p1.toArray(), this.p2.toArray()])
}

Segment.drawBatch = function (container, segments) {
    return container.path().plot([
        ..._.map(segments, s => [
            [
                ["M", ...s.p1.toArray()],
                ["L", ...s.p2.toArray()]
            ]
        ])
    ])
}
Triangle.prototype.draw = function (container) {
    return container.polygon().plot([this.p1.toArray(), this.p2.toArray(), this.p3.toArray()])
}

Circle.prototype.draw = function (container) {
    return container.circle().attr({
        r: this.radius,
        cx: this.cx,
        cy: this.cy
    })
}
RegularPolygon.prototype.draw = function (container) {
    return container.polygon().plot([...this.points.map(p => p.toArray())])
}

import Arc from "../shapes/basic/Arc"
import Bezier from "../Bezier"
import Circle from "../Circle"
import { optionerOf } from "../helper/Optioner"
import LineSegment from "../LineSegment"
import QuadraticBezier from "../QuadraticBezier"
import { OwnerCarrier } from "../types"
import math from "../utility/math"
import vec2 from "../utility/vec2"

class Wrap {
    static verb = "Wraps" as const
    //#region Circle
    static circleWrapsCircle(this: OwnerCarrier, circle: Circle, otherCircle: Circle) {
        const sd = vec2.squaredMagnitude(vec2.from(circle.centerCoordinate, otherCircle.centerCoordinate))
        const sdr = (circle.radius - otherCircle.radius) ** 2
        const epsilon = optionerOf(this.owner).options.epsilon
        return math.greaterThan(circle.radius, otherCircle.radius, epsilon) && math.lessThan(sd, sdr, epsilon)
    }
    static circleWrapsLineSegment(this: OwnerCarrier, circle: Circle, lineSegment: LineSegment) {
        return circle.isPointInside(lineSegment.point1Coordinate) && circle.isPointInside(lineSegment.point2Coordinate)
    }
    static circleWrapsArc(this: OwnerCarrier, circle: Circle, arc: Arc) {}
    static circleWrapsBezier(this: OwnerCarrier, circle: Circle, bezier: Bezier) {}
    static circleWrapsQuadraticBezier(this: OwnerCarrier, circle: Circle, quadraticBezier: QuadraticBezier) {}
    //#endregion
}

export default Wrap

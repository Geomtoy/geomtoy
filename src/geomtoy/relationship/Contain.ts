import GeomObject from "../base/GeomObject"
import Circle from "../Circle"
import { optionerOf } from "../helper/Optioner"
import { OwnerCarrier } from "../types"
import math from "../utility/math"
import vec2 from "../utility/vec2"

class Contain {
    //#region  Circle
    static circleContainsCircle(this: OwnerCarrier, circle1: Circle, circle2: Circle) {
        const sd = vec2.squaredMagnitude(vec2.from(circle1.centerCoordinate, circle2.centerCoordinate))
        const sdr = (circle1.radius - circle2.radius) ** 2
        const epsilon = optionerOf(this.owner).options.epsilon
        return math.greaterThan(circle1.radius, circle2.radius, epsilon) && math.lessThan(sd, sdr, epsilon)
    }
    //#endregion
}

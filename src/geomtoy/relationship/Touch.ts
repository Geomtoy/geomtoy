import Circle from "../Circle"
import { optionerOf } from "../helper/Optioner"
import { OwnerCarrier } from "../types"
import math from "../utility/math"
import vec2 from "../utility/vec2"

//@ts-ignore
class Touch {
    static circleInTouchesCircle(this: OwnerCarrier, circle1: Circle, circle2: Circle) {
        const sd = vec2.squaredMagnitude(vec2.from(circle1.centerCoordinate, circle2.centerCoordinate))
        const sdr = (circle1.radius - circle2.radius) ** 2
        const epsilon = optionerOf(this.owner).options.epsilon
        return math.equalTo(sd, sdr, epsilon)
    }
    static circleExTouchesCircle(this: OwnerCarrier, circle1: Circle, circle2: Circle) {
        const sd = vec2.squaredMagnitude(vec2.from(circle1.centerCoordinate, circle2.centerCoordinate))
        const ssr = (circle1.radius + circle2.radius) ** 2
        const epsilon = optionerOf(this.owner).options.epsilon
        return math.equalTo(sd, ssr, epsilon)
    }
    static circleTouchesCircle(this: OwnerCarrier, circle1: Circle, circle2: Circle) {
        return Touch.circleInTouchesCircle.call(this, circle1, circle2) && Touch.circleExTouchesCircle.call(this, circle1, circle2)
    }
}
import { Vector2, Maths } from "@geomtoy/util";
import { optionerOf } from "../helper/Optioner";
import Circle from "../shapes/basic/Circle";

import type { OwnerCarrier } from "../types";

class Touch {
    static verb = "Touches" as const;
    static circleInTouchesCircle(this: OwnerCarrier, circle1: Circle, circle2: Circle) {
        const sd = Vector2.squaredMagnitude(Vector2.from(circle1.centerCoordinates, circle2.centerCoordinates));
        const sdr = (circle1.radius - circle2.radius) ** 2;
        const epsilon = optionerOf(this.owner).options.epsilon;
        return Maths.equalTo(sd, sdr, epsilon);
    }
    static circleExTouchesCircle(this: OwnerCarrier, circle1: Circle, circle2: Circle) {
        const sd = Vector2.squaredMagnitude(Vector2.from(circle1.centerCoordinates, circle2.centerCoordinates));
        const ssr = (circle1.radius + circle2.radius) ** 2;
        const epsilon = optionerOf(this.owner).options.epsilon;
        return Maths.equalTo(sd, ssr, epsilon);
    }
    static circleTouchesCircle(this: OwnerCarrier, circle1: Circle, circle2: Circle) {
        return Touch.circleInTouchesCircle.call(this, circle1, circle2) && Touch.circleExTouchesCircle.call(this, circle1, circle2);
    }
}

export default Touch;

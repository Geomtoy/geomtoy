import { Vector2, Math } from "@geomtoy/util";
import Circle from "../shapes/basic/Circle";
import { optionerOf } from "../helper/Optioner";
import { OwnerCarrier } from "../types";

class Separate {
    static verb = "Separates" as const;

    //#region Circle
    static circleSeparatesCircle(this: OwnerCarrier, circle1: Circle, circle2: Circle) {
        const sd = Vector2.squaredMagnitude(Vector2.from(circle1.centerCoordinates, circle2.centerCoordinates));
        const ssr = (circle1.radius + circle2.radius) ** 2;
        const epsilon = optionerOf(this.owner).options.epsilon;
        return Math.greaterThan(sd, ssr, epsilon);
    }
    //#endregion
}

export default Separate;

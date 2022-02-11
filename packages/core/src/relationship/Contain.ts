import { Maths, Coordinates, Angle } from "@geomtoy/util";
import { optionerOf } from "../helper/Optioner";

import Arc from "../shapes/basic/Arc";
import Circle from "../shapes/basic/Circle";
import Line from "../shapes/basic/Line";
import LineSegment from "../shapes/basic/LineSegment";
import Ray from "../shapes/basic/Ray";

import type { OwnerCarrier } from "../types";

class Contain {
    static verb = "Contains" as const;
    //#region  Circle
    static circleContainsArc(this: OwnerCarrier, circle: Circle, arc: Arc) {
        const epsilon = optionerOf(this.owner).options.epsilon;
        if (!Coordinates.isEqualTo(circle.centerCoordinates, arc.centerCoordinates, epsilon)) return false;
        if (!Maths.equalTo(arc.radiusX, arc.radiusY, epsilon)) return false;
        if (!Maths.equalTo(circle.radius, arc.radiusX, epsilon)) return false;
        return true;
    }
    //#endregion
    //#region  Line
    static lineContainsLineSegment(this: OwnerCarrier, line: Line, lineSegment: LineSegment) {
        if (!line.isPointOn(lineSegment.point1Coordinates)) return false;
        if (!line.isPointOn(lineSegment.point2Coordinates)) return false;
        return true;
    }
    static lineContainsRay(this: OwnerCarrier, line: Line, ray: Ray) {
        const epsilon = optionerOf(this.owner).options.epsilon;
        if (!line.isPointOn(ray.coordinates)) return false;
        if (!Maths.equalTo(line.angle, Angle.convert2(ray.angle), epsilon)) return false;
        return true;
    }
    //#endregion
    //#region  Ray
    static rayContainsLineSegment(this: OwnerCarrier, ray: Ray, lineSegment: LineSegment) {
        if (!ray.isPointOn(lineSegment.point1Coordinates)) return false;
        if (!ray.isPointOn(lineSegment.point2Coordinates)) return false;
        return true;
    }
    //#endregion
    //#region LineSegment
    static lineSegmentContainsLineSegment(this: OwnerCarrier, lineSegment: LineSegment, otherLineSegment: LineSegment) {}
    //#endregion
}

export default Contain;

import Arc from "../Arc"
import Circle from "../Circle"
import { optionerOf } from "../helper/Optioner"
import Line from "../Line"
import LineSegment from "../LineSegment"
import Ray from "../Ray"
import { OwnerCarrier } from "../types"
import angle from "../utility/angle"
import coord from "../utility/coordinate"
import math from "../utility/math"
import vec2 from "../utility/vec2"

class Contain {
    //#region  Circle
    static circleContainsArc(this: OwnerCarrier, circle: Circle, arc: Arc) {
        
    }
    //#endregion
    //#region  Line
    static lineContainsLineSegment(this:OwnerCarrier,line:Line, lineSegment:LineSegment){
        return line.isPointOn(lineSegment.point1Coordinate) && line.isPointOn(lineSegment.point2Coordinate)
    }
    static lineContainsRay(this:OwnerCarrier,line:Line,ray:Ray){
        const epsilon = optionerOf(this.owner).options.epsilon
        return line.isPointOn(ray.coordinate) && math.equalTo(line.angle, angle.convert2( ray.angle),epsilon)
    }
    //#endregion
    //#region  Ray
    static rayContainsLineSegment(this:OwnerCarrier,ray:Ray,lineSegment:LineSegment){
        return ray.isPointOn(lineSegment.point1Coordinate) && ray.isPointOn(lineSegment.point2Coordinate)
    }
    //#region LineSegment
    static lineSegmentContainsLineSegment(this:OwnerCarrier,lineSegment:LineSegment, otherLineSegment:LineSegment){
        
    }
}

export default Contain
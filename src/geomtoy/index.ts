import Point from "./Point"
import Line from "./Line"
import Segment from "./Segment"
import Vector from "./Vector"
import Triangle from "./Triangle"
import Circle from "./Circle"
import Angle from "./utility/Angle"
import Rectangle from "./Rectangle"
import Polyline from "./Polyline"
import Polygon from "./Polygon"
import RegularPolygon from "./RegularPolygon"
import Inversion from "./transformation/Inversion"
import Ellipse from "./Ellipse"
import { AnglePositive } from "./types"

type GStatic = {
    Point: typeof Point
    Line: typeof Line
    Segment: typeof Segment
    Vector: typeof Vector
    Triangle: typeof Triangle
    Circle: typeof Circle
    Ellipse: typeof Ellipse
    Angle: typeof Angle
    Rectangle: typeof Rectangle
    Polyline: typeof Polyline
    Polygon: typeof Polygon
    RegularPolygon: typeof RegularPolygon
    Inversion: typeof Inversion
    options: {
        epsilon: number
        pointSize: number
        anglePositive: AnglePositive
        [prop: string]: any
    }
}

const G: GStatic = {
    Point,
    Line,
    Segment,
    Vector,
    Triangle,
    Circle,
    Ellipse,
    Angle,
    Rectangle,
    Polyline,
    Polygon,
    RegularPolygon,
    Inversion,
    options: {
        epsilon: 2 ** -11,
        pointSize: 1,
        anglePositive: AnglePositive.Clockwise
    }
}

export default G

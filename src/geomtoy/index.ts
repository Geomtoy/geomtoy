import Point from "./Point"
import Line from "./Line"
import Segment from "./Segment"
import Vector from "./Vector"
import Triangle from "./Triangle"
import Circle from "./Circle"
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
    Rectangle: typeof Rectangle
    Polyline: typeof Polyline
    Polygon: typeof Polygon
    RegularPolygon: typeof RegularPolygon
    Inversion: typeof Inversion
    options: {
        epsilon: number
        anglePositive: AnglePositive
        graphic: {
            pointSize: number
            lineRange: number
        }
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
    Rectangle,
    Polyline,
    Polygon,
    RegularPolygon,
    Inversion,
    options: {
        epsilon: 2 ** -11,
        anglePositive: AnglePositive.Clockwise,
        graphic: {
            pointSize: 2,
            lineRange: 2 ** 10
        }
    }
}

export default G

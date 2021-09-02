import Line from "../Line"
import Point from "../Point"
import Ray from "../Ray"
import Segment from "../Segment"

export * from "./graphics"
export * from "./geomtoy"

// Geomtoy global options
export type Options = {
    epsilon: number
    graphics: {
        pointSize: number
        lineRange: number
        vectorArrow: {
            width: number
            length: number
            foldback: number
        }
    }
    pathSampleRatio: number
    coordinateSystem: {
        xAxisPositiveOnRight: boolean
        yAxisPositiveOnBottom: boolean
        originX: number
        originY: number
        scale: number
    }
}
export const defaultOptions: Options = {
    epsilon: 2 ** -32,
    graphics: {
        pointSize: 2,
        lineRange: 2 ** 10,
        vectorArrow: {
            width: 5,
            length: 10,
            foldback: 1
        }
    },
    pathSampleRatio: 100,
    coordinateSystem: {
        xAxisPositiveOnRight: true,
        yAxisPositiveOnBottom: true,
        originX: 0,
        originY: 0,
        scale: 1
    }
}

export type PointLineData = {
    point: Point
    line: Line
}
export type PointsLineData = {
    points: Point[]
    line: Line
}
export type AnglePointLineData = {
    angle: number
    point: Point
    line: Line
}
export type SegmentLineData = {
    segment: Segment
    line: Line
}
export type SegmentRayLineData = {
    segment: Segment
    ray: Ray
    line: Line
}

export type Direction = "positive" | "negative"

// Relationship here only means the positional relationship not belonging relationship.
// So if it is a special belonging, equaling object of other objects, it is not a positional relationship
export enum RsPointToLine {
    On = 2,
    NotOn = 2 ^ 1
}
export enum RsPointToSegment {
    On = 2,
    NotOn = 2 << 4,
    Collinear = 2 << 5
}
export enum RsPointToCircle {
    On = 2,
    Inside = 2 << 1,
    Outside = 2 << 2,
    NotOn = Inside | Outside
}
export enum RsLineToSegment {}
export enum RsLineToRectangle {
    Intersected = 2,
    IntersectedWith1Point = Intersected | (2 << 1),
    IntersectedWith2Points = Intersected | (2 << 2),
    Separated = 2 << 3
}

export enum RsSegmentToSegment {
    Perpendicular = 2,
    Parallel = 2 << 1,
    Collinear = Parallel | (2 << 2),
    Jointed = 2 << 3,
    Overlapped = Parallel | Collinear | (2 << 4),
    Intersected = 2 << 5,
    Separated = 2 << 6
}

export enum RsCircleToCircle {
    Intersected = 2,
    InternallyTangent = 2 << 1,
    ExternallyTangent = 2 << 2,
    WrapInside = 2 << 3,
    WrapOutside = 2 << 4,
    Separated = 2 << 5,
    Tangent = InternallyTangent | ExternallyTangent,
    NotIntersected = WrapInside | WrapOutside | Separated
}

export enum RsRectangleToRectangle {
    Inside,
    Outside,
    Separated = Inside | Outside,
    Overlapped,
    OverlappedWith1Rectangle,
    OverlappedWith1Line = 2,
    OverlappedWith2Line = 2
}

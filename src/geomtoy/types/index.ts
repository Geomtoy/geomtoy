export * from "./graphic"

// Geomtoy global options
export type Options = {
    epsilon: number
    graphic: {
        pointSize: number
        lineRange: number
        vectorArrow: {
            width: number
            length: number
            foldback: number
        }
    }
    fillRule: "nonzero" | "evenodd"
    pathSampleRatio: 100
    global: {
        xAxisPositiveOnRight: boolean
        yAxisPositiveOnBottom: boolean
        originX: number
        originY: number
        scale: number
    }
    [key: string]: any
}
export const defaultOptions: Options = {
    epsilon: 2 ** -11,
    graphic: {
        pointSize: 2,
        lineRange: 2 ** 10,
        vectorArrow: {
            width: 5,
            length: 10,
            foldback: 1
        }
    },
    fillRule: "evenodd",
    pathSampleRatio: 100,
    global: {
        xAxisPositiveOnRight: true,
        yAxisPositiveOnBottom: true,
        originX: 0,
        originY: 0,
        scale: 1
    }
}

export type Coordinate = [x: number, y: number]
export type Size = [width: number, height: number]

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

export enum RsLineToCircle {
    Intersected = 2,
    Tangent = 2 << 1,
    Separated = 2 << 2
}
export enum RsCircleToCircle {
    Intersected = 2,
    InternallyTangent = 2 << 1,
    ExternallyTangent = 2 << 2,
    Inside = 2 << 3,
    Outside = 2 << 4,
    Separated = 2 << 5
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

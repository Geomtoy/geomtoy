
// Relationship here only means the positional relationship not belonging relationship.
// So if it is a special belonging, equaling object of other objects, it is not a positional relationship

export enum RsLineToRectangle {
    Intersected = 2,
    IntersectedWith1Point = Intersected | (2 << 1),
    IntersectedWith2Points = Intersected | (2 << 2),
    Separated = 2 << 3
}

export enum RsLineSegmentToLineSegment {
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

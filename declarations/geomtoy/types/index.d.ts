export * from "./graphic";
export declare type Options = {
    epsilon: number;
    graphic: {
        pointSize: number;
        lineRange: number;
        vectorArrow: {
            width: number;
            length: number;
            foldback: number;
        };
    };
    fillRule: "nonzero" | "evenodd";
    pathSampleRatio: 100;
    global: {
        xAxisPositiveOnRight: boolean;
        yAxisPositiveOnBottom: boolean;
        originX: number;
        originY: number;
        scale: number;
    };
    [key: string]: any;
};
export declare const defaultOptions: Options;
export declare type Coordinate = [x: number, y: number];
export declare type Size = [width: number, height: number];
export declare enum RsPointToLine {
    On = 2,
    NotOn = 3
}
export declare enum RsPointToSegment {
    On = 2,
    NotOn = 32,
    Collinear = 64
}
export declare enum RsPointToCircle {
    On = 2,
    Inside = 4,
    Outside = 8,
    NotOn = 12
}
export declare enum RsLineToSegment {
}
export declare enum RsLineToRectangle {
    Intersected = 2,
    IntersectedWith1Point = 6,
    IntersectedWith2Points = 10,
    Separated = 16
}
export declare enum RsSegmentToSegment {
    Perpendicular = 2,
    Parallel = 4,
    Collinear = 12,
    Jointed = 16,
    Overlapped = 44,
    Intersected = 64,
    Separated = 128
}
export declare enum RsLineToCircle {
    Intersected = 2,
    Tangent = 4,
    Separated = 8
}
export declare enum RsCircleToCircle {
    Intersected = 2,
    InternallyTangent = 4,
    ExternallyTangent = 8,
    WrapInside = 16,
    WrapOutside = 32,
    Separated = 64,
    Tangent = 12,
    NotIntersected = 112
}
export declare enum RsRectangleToRectangle {
    Inside = 0,
    Outside = 1,
    Separated = 1,
    Overlapped = 2,
    OverlappedWith1Rectangle = 3,
    OverlappedWith1Line = 2,
    OverlappedWith2Line = 2
}

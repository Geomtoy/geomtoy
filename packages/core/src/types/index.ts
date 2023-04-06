import type EventTarget from "../base/EventTarget";
import type Shape from "../base/Shape";
import type SegmentWithFill from "../boolean-operation/SegmentWithFill";
import type EventObject from "../event/EventObject";
import type Arc from "../geometries/basic/Arc";
import type Bezier from "../geometries/basic/Bezier";
import type Line from "../geometries/basic/Line";
import type LineSegment from "../geometries/basic/LineSegment";
import type Point from "../geometries/basic/Point";
import type QuadraticBezier from "../geometries/basic/QuadraticBezier";
import type Ray from "../geometries/basic/Ray";
import type Compound from "../geometries/general/Compound";
import type Path from "../geometries/general/Path";
import type Polygon from "../geometries/general/Polygon";
import type BaseIntersection from "../intersection/BaseIntersection";

// #region Common

// prettier-ignore
/* @internal */
export type ConstructorOverloads<T> =
    T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
        new (...args: infer A6): infer R6
        new (...args: infer A7): infer R7
        new (...args: infer A8): infer R8
        new (...args: infer A9): infer R9
        new (...args: infer A10): infer R10
        new (...args: infer A11): infer R11
        new (...args: infer A12): infer R12
        new (...args: infer A13): infer R13
        new (...args: infer A14): infer R14
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
        new (...args: A7) => R7,
        new (...args: A8) => R8,
        new (...args: A9) => R9,
        new (...args: A10) => R10,
        new (...args: A11) => R11,
        new (...args: A12) => R12,
        new (...args: A13) => R13,
        new (...args: A14) => R14,
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
        new (...args: infer A6): infer R6
        new (...args: infer A7): infer R7
        new (...args: infer A8): infer R8
        new (...args: infer A9): infer R9
        new (...args: infer A10): infer R10
        new (...args: infer A11): infer R11
        new (...args: infer A12): infer R12
        new (...args: infer A13): infer R13
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
        new (...args: A7) => R7,
        new (...args: A8) => R8,
        new (...args: A9) => R9,
        new (...args: A10) => R10,
        new (...args: A11) => R11,
        new (...args: A12) => R12,
        new (...args: A13) => R13,
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
        new (...args: infer A6): infer R6
        new (...args: infer A7): infer R7
        new (...args: infer A8): infer R8
        new (...args: infer A9): infer R9
        new (...args: infer A10): infer R10
        new (...args: infer A11): infer R11
        new (...args: infer A12): infer R12
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
        new (...args: A7) => R7,
        new (...args: A8) => R8,
        new (...args: A9) => R9,
        new (...args: A10) => R10,
        new (...args: A11) => R11,
        new (...args: A12) => R12,
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
        new (...args: infer A6): infer R6
        new (...args: infer A7): infer R7
        new (...args: infer A8): infer R8
        new (...args: infer A9): infer R9
        new (...args: infer A10): infer R10
        new (...args: infer A11): infer R11
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
        new (...args: A7) => R7,
        new (...args: A8) => R8,
        new (...args: A9) => R9,
        new (...args: A10) => R10,
        new (...args: A11) => R11,
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
        new (...args: infer A6): infer R6
        new (...args: infer A7): infer R7
        new (...args: infer A8): infer R8
        new (...args: infer A9): infer R9
        new (...args: infer A10): infer R10
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
        new (...args: A7) => R7,
        new (...args: A8) => R8,
        new (...args: A9) => R9,
        new (...args: A10) => R10,
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
        new (...args: infer A6): infer R6
        new (...args: infer A7): infer R7
        new (...args: infer A8): infer R8
        new (...args: infer A9): infer R9
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
        new (...args: A7) => R7,
        new (...args: A8) => R8,
        new (...args: A9) => R9,
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
        new (...args: infer A6): infer R6
        new (...args: infer A7): infer R7
        new (...args: infer A8): infer R8
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
        new (...args: A7) => R7,
        new (...args: A8) => R8,
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
        new (...args: infer A6): infer R6
        new (...args: infer A7): infer R7
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
        new (...args: A7) => R7,
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
        new (...args: infer A6): infer R6
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5,
        new (...args: A6) => R6,
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
        new (...args: infer A5): infer R5
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4,
        new (...args: A5) => R5
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
        new (...args: infer A4): infer R4
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3,
        new (...args: A4) => R4
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
        new (...args: infer A3): infer R3
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2,
        new (...args: A3) => R3
    ]
    : T extends {
        new (...args: infer A1): infer R1
        new (...args: infer A2): infer R2
    }
    ? [
        new (...args: A1) => R1,
        new (...args: A2) => R2
    ]
    : T extends {
        new (...args: infer A1): infer R1
    }
    ? [
        new (...args: A1) => R1
    ]
    : never

export type BasicSegment = LineSegment | QuadraticBezier | Bezier | Arc;

/**
 * @see https://en.wikipedia.org/wiki/Three-valued_logic
 */
export type Trilean = true | false | undefined;
// #endregion

// #region Geomtoy
export type RecursivePartial<T> = {
    [K in keyof T]?: T[K] extends (infer U)[] ? RecursivePartial<U>[] : T[K] extends object ? RecursivePartial<T[K]> : T[K];
};
export type Options = {
    epsilon: {
        epsilon: number;
        coefficientEpsilon: number;
        trigonometricEpsilon: number;
        complexEpsilon: number;
        timeEpsilon: number;
        angleEpsilon: number;
        vectorEpsilon: number;
    };
    graphics: {
        point: {
            size: number;
            appearance: PointAppearance;
        };
        arrow: {
            width: number;
            length: number;
            foldback: number;
            noFoldback: boolean;
        };
        lineArrow: boolean;
        vectorArrow: boolean;
        rayArrow: boolean;
        polygonSegmentArrow: boolean;
        pathSegmentArrow: boolean;
    };
};
export interface ViewportDescriptor {
    width: number;
    height: number;
    density: number;
    zoom: number;
    origin: [number, number];
    pan: [number, number];
    xAxisPositiveOnRight: boolean;
    yAxisPositiveOnBottom: boolean;
    globalTransformation: [a: number, b: number, c: number, d: number, e: number, f: number];
    globalViewBox: [x: number, y: number, w: number, h: number];
}
// #endregion

// #region Dynamic
export type FilteredKeys<T extends { [key: string]: any }> = { [K in keyof T]: K extends `_${string}` | `${string}_` ? never : K extends keyof EventTarget ? never : K }[keyof T];

export type DynamicObject<T extends { [key: string]: any }> = {
    [K in FilteredKeys<T>]: T[K];
};
export type EventTargetStatic = {
    [K in keyof typeof EventTarget]: typeof EventTarget[K];
};
export interface DynamicEventTargetConstructor<T extends { [key: string]: any }> extends EventTargetStatic {
    new (object?: DynamicObject<T>): EventTarget & DynamicObject<T>;
    events: { [K in string & FilteredKeys<T> as `${K}Changed`]: `${K}` };
}

// #endregion

// #region Shape
export type WindingDirection = 1 /**for positive**/ | -1 /**for negative**/ | 0 /**for undetermined**/;
export type FillRule = "nonzero" | "evenodd";

export interface ParentShape {
    get items(): Shape[] | { [key: string]: Shape };
}

export interface ClosedGeometry {
    getLength(): number;
    getArea(): number;
    getWindingDirection(): WindingDirection;
    isPointOn(point: [number, number] | Point): boolean;
    isPointOutside(point: [number, number] | Point): boolean;
    isPointInside(point: [number, number] | Point): boolean;
    toPath(): Path;
}
export interface FiniteOpenGeometry {
    getLength(): number;
    isPointOn(point: [number, number] | Point): boolean;
    toPath(closed?: boolean): Path;
}
export interface InfiniteOpenGeometry {
    isPointOn(point: [number, number] | Point): boolean;
}
export interface RotationFeaturedGeometry {
    get rotation();
    set rotation(value: number);
}
// #endregion

// #region BooleanOperation
export type GeneralGeometry = Polygon | Path | Compound;
export interface FillDescription {
    fillRule: FillRule;
    segmentWithFills: SegmentWithFill[];
}
// #endregion

// #region Data
export type PointLineData = {
    point: Point;
    line: Line;
};
export type PointsLineData = {
    points: Point[];
    line: Line;
};
export type AnglePointLineData = {
    angle: number;
    point: Point;
    line: Line;
};
export type LineSegmentLineData = {
    lineSegment: LineSegment;
    line: Line;
};
export type LineSegmentRayLineData = {
    lineSegment: LineSegment;
    ray: Ray;
    line: Line;
};
// #endregion

// #region Event
export type EventPair = [EventTarget, string];
export type BindParameters<T extends EventPair[], U extends EventTarget> = [...pair: T, callback: (this: U, ...args: EventObjectsFromPairs<T>) => void];

export type OnOptions = Partial<{
    priority: number;
    debounce: number;
}>;

export type BindOptions = Partial<{
    immediately: boolean;
    priority: number;
    debounce: number;
}>;

export type EventObjectsFromPairs<T extends EventPair[]> = {
    [K in keyof T]: T[K] extends EventPair ? EventObject<T[K][0]> : never;
};
// #endregion

// #region Graphics
export type PointAppearance = "circle" | "square" | "cross" | "plus" | "diamond";

/* @internal */
export type ArcEndpointParameterization = {
    point1X: number;
    point1Y: number;
    point2X: number;
    point2Y: number;
    radiusX: number;
    radiusY: number;
    largeArc: boolean;
    positive: boolean;
    rotation: number;
};
/* @internal */
export type ArcCenterParameterization = {
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
    startAngle: number;
    endAngle: number;
    positive: boolean;
    rotation: number;
};

export type ImageGraphicCommand = {
    x: number;
    y: number;
    width: number;
    height: number;
    sourceX: number;
    sourceY: number;
    sourceWidth: number;
    sourceHeight: number;
    source: string;
    consistent: boolean;
    anchor: Anchor;
};
export type TextGraphicCommand = {
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    content: string;
    fontSize: number;
    fontFamily: string;
    fontBold: boolean;
    fontItalic: boolean;
    anchor: Anchor;
};

export type GeometryGraphicCommand =
    | GeometryGraphicMoveToCommand
    | GeometryGraphicLineToCommand
    | GeometryGraphicBezierToCommand
    | GeometryGraphicQuadraticBezierToCommand
    | GeometryGraphicArcToCommand
    | GeometryGraphicCloseCommand;

export const enum GeometryGraphicCommandType {
    MoveTo = "moveTo",
    LineTo = "lineTo",
    BezierTo = "bezierTo",
    QuadraticBezierTo = "quadraticBezierTo",
    ArcTo = "arcTo",
    Close = "close"
}

export type GeometryGraphicMoveToCommand = {
    type: GeometryGraphicCommandType.MoveTo;
    x: number;
    y: number;
};
export type GeometryGraphicLineToCommand = {
    type: GeometryGraphicCommandType.LineTo;
    x: number;
    y: number;
};
export type GeometryGraphicBezierToCommand = {
    type: GeometryGraphicCommandType.BezierTo;
    x: number;
    y: number;
    controlPoint1X: number;
    controlPoint1Y: number;
    controlPoint2X: number;
    controlPoint2Y: number;
};
export type GeometryGraphicQuadraticBezierToCommand = {
    type: GeometryGraphicCommandType.QuadraticBezierTo;
    x: number;
    y: number;
    controlPointX: number;
    controlPointY: number;
};
export type GeometryGraphicArcToCommand = {
    type: GeometryGraphicCommandType.ArcTo;
    x: number;
    y: number;
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
    rotation: number;
    startAngle: number;
    endAngle: number;
    largeArc: boolean;
    positive: boolean;
};
export type GeometryGraphicCloseCommand = {
    type: GeometryGraphicCommandType.Close;
};

// #endregion

// #region Font
export type FontConfig = {
    fontSize: number;
    fontFamily: string;
    fontBold: boolean;
    fontItalic: boolean;
};
export const enum Anchor {
    LeftTop = "leftTop",
    LeftCenter = "leftCenter",
    LeftBottom = "leftBottom",
    CenterTop = "centerTop",
    CenterCenter = "centerCenter",
    CenterBottom = "centerBottom",
    RightTop = "rightTop",
    RightCenter = "rightCenter",
    RightBottom = "rightBottom"
}

// #endregion

// #region Path
export type PathCommand = PathMoveToCommand | PathLineToCommand | PathBezierToCommand | PathQuadraticBezierToCommand | PathArcToCommand;

export const enum PathCommandType {
    MoveTo = "M",
    LineTo = "L",
    BezierTo = "C",
    QuadraticBezierTo = "Q",
    ArcTo = "A"
}

export type PathMoveToCommand = {
    id?: string;
    type: PathCommandType.MoveTo;
    x: number;
    y: number;
};
export type PathLineToCommand = {
    id?: string;
    type: PathCommandType.LineTo;
    x: number;
    y: number;
};
export type PathBezierToCommand = {
    id?: string;
    type: PathCommandType.BezierTo;
    x: number;
    y: number;
    controlPoint1X: number;
    controlPoint1Y: number;
    controlPoint2X: number;
    controlPoint2Y: number;
};
export type PathQuadraticBezierToCommand = {
    id?: string;
    type: PathCommandType.QuadraticBezierTo;
    x: number;
    y: number;
    controlPointX: number;
    controlPointY: number;
};
export type PathArcToCommand = {
    id?: string;
    type: PathCommandType.ArcTo;
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
    rotation: number;
    largeArc: boolean;
    positive: boolean;
};
// #endregion

// #region Polygon
export type PolygonVertex = {
    id?: string;
    x: number;
    y: number;
};

// #endregion

// #region Intersection
export enum IntersectionPredicate {
    Equal = "equal",
    Separate = "separate",
    Intersect = "intersect",
    Strike = "strike",
    Contact = "contact",
    Cross = "cross",
    Touch = "touch",
    Block = "block",
    BlockedBy = "blockedBy",
    Connect = "connect",
    Coincide = "coincide"
}

type TypeIntersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;

type AllResult = {
    [K in IntersectionPredicate]?: ReturnType<BaseIntersection[K]>;
};

type IntersectionMethodsOfCollection<T extends IntersectionPredicate, U extends { [key: string]: { new (...args: any[]): any } }> = {
    [K in keyof U]: (geometry1: InstanceType<U[K]>["geometry1"], geometry2: InstanceType<U[K]>["geometry2"]) => ReturnType<BaseIntersection[T]>;
};

type IntersectionAllOfCollection<U extends { [key: string]: { new (...args: any[]): any } }> = {
    [K in keyof U]: (geometry1: InstanceType<U[K]>["geometry1"], geometry2: InstanceType<U[K]>["geometry2"], predicates?: IntersectionPredicate[]) => AllResult;
};

// prettier-ignore
export type IntersectionAllOverloads<U extends { [key: string]: { new (...args: any[]): any } }> = TypeIntersection<
    IntersectionAllOfCollection<U>[keyof IntersectionAllOfCollection<U>]
>;

export type IntersectionMethodOverloads<T extends IntersectionPredicate, U extends { [key: string]: { new (...args: any[]): any } }> = TypeIntersection<
    IntersectionMethodsOfCollection<T, U>[keyof IntersectionMethodsOfCollection<T, U>]
>;

// #endregion

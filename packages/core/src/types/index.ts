import type EventTarget from "../base/EventTarget";
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

// #region Common
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
    epsilon: number;
    coefficientEpsilon: number;
    trigonometricEpsilon: number;
    curveEpsilon: number;
    timeEpsilon: number;
    angleEpsilon: number;
    vectorEpsilon: number;
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
    imageSource: string;
};
export type TextGraphicCommand = {
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fontBold: boolean;
    fontItalic: boolean;
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
// #endregion

// #region Path
export type PathCommand = PathMoveToCommand | PathLineToCommand | PathBezierToCommand | PathQuadraticBezierToCommand | PathArcToCommand;

export type PathCommandWithUuid = Required<PathCommand>;

export const enum PathCommandType {
    MoveTo = "M",
    LineTo = "L",
    BezierTo = "C",
    QuadraticBezierTo = "Q",
    ArcTo = "A"
}

export type PathMoveToCommand = {
    uuid?: string;
    type: PathCommandType.MoveTo;
    x: number;
    y: number;
};
export type PathLineToCommand = {
    uuid?: string;
    type: PathCommandType.LineTo;
    x: number;
    y: number;
};
export type PathBezierToCommand = {
    uuid?: string;
    type: PathCommandType.BezierTo;
    x: number;
    y: number;
    controlPoint1X: number;
    controlPoint1Y: number;
    controlPoint2X: number;
    controlPoint2Y: number;
};
export type PathQuadraticBezierToCommand = {
    uuid?: string;
    type: PathCommandType.QuadraticBezierTo;
    x: number;
    y: number;
    controlPointX: number;
    controlPointY: number;
};
export type PathArcToCommand = {
    uuid?: string;
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
    uuid?: string;
    x: number;
    y: number;
};

export type PolygonVertexWithUuid = Required<PolygonVertex>;

// #endregion

// #region Relationship
export enum RelationshipPredicate {
    // Basic relationships
    Equal = "equal",
    Separate = "separate",
    // 2D relationships
    Contain = "contain",
    ContainedBy = "containedBy",
    // 1D relationships
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

type Intersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;

export type RelateResult<R extends Partial<Record<RelationshipPredicate, any>>> = {
    [K in RelationshipPredicate as R[K] extends (...args: any[]) => any ? K : never]: R[K] extends (...args: any[]) => any ? ReturnType<R[K]> : never;
};

export type RelationshipMethodsOfCollection<T extends RelationshipPredicate | "relate", U extends { [key: string]: { new (...args: any[]): any } }> = {
    [K in keyof U as InstanceType<U[K]>[T] extends (...args: any[]) => any ? K : never]: InstanceType<U[K]>[T] extends (...args: any[]) => any
        ? T extends "relate"
            ? (geometry1: InstanceType<U[K]>["geometry1"], geometry2: InstanceType<U[K]>["geometry2"], predicates?: RelationshipPredicate[]) => ReturnType<InstanceType<U[K]>[T]>
            : (geometry1: InstanceType<U[K]>["geometry1"], geometry2: InstanceType<U[K]>["geometry2"]) => ReturnType<InstanceType<U[K]>[T]>
        : never;
};
export type RelationshipMethodOverloads<T extends RelationshipPredicate | "relate", U extends { [key: string]: { new (...args: any[]): any } }> = Intersection<
    RelationshipMethodsOfCollection<T, U>[keyof RelationshipMethodsOfCollection<T, U>]
>;

// #endregion

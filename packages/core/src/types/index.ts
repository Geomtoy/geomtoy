import type EventTarget from "../base/EventTarget";
import type Line from "../geometries/basic/Line";
import type Point from "../geometries/basic/Point";
import type Ray from "../geometries/basic/Ray";
import type LineSegment from "../geometries/basic/LineSegment";
import type Path from "../geometries/advanced/Path";
import type EventObject from "../event/EventObject";
import type ImageGraphics from "../graphics/ImageGraphics";
import type TextGraphics from "../graphics/TextGraphics";
import type GeometryGraphics from "../graphics/GeometryGraphics";

// #region Common
export type Tail<A> = A extends [infer H, ...infer T] ? T : never;

// prettier-ignore
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
// prettier-ignore
export type FunctionOverloads<T> =
    T extends {
        (...args: infer A1): infer R1
        (...args: infer A2): infer R2
        (...args: infer A3): infer R3
        (...args: infer A4): infer R4
        (...args: infer A5): infer R5
        (...args: infer A6): infer R6
    }
    ? [
        (...args: A1) => R1,
        (...args: A2) => R2,
        (...args: A3) => R3,
        (...args: A4) => R4,
        (...args: A5) => R5,
        (...args: A6) => R6,
    ]
    : T extends {
        (...args: infer A1): infer R1
        (...args: infer A2): infer R2
        (...args: infer A3): infer R3
        (...args: infer A4): infer R4
        (...args: infer A5): infer R5
    }
    ? [
        (...args: A1) => R1,
        (...args: A2) => R2,
        (...args: A3) => R3,
        (...args: A4) => R4,
        (...args: A5) => R5
    ]
    : T extends {
        (...args: infer A1): infer R1
        (...args: infer A2): infer R2
        (...args: infer A3): infer R3
        (...args: infer A4): infer R4
    }
    ? [
        (...args: A1) => R1,
        (...args: A2) => R2,
        (...args: A3) => R3,
        (...args: A4) => R4
    ]
    : T extends {
        (...args: infer A1): infer R1
        (...args: infer A2): infer R2
        (...args: infer A3): infer R3
    }
    ? [
        (...args: A1) => R1,
        (...args: A2) => R2,
        (...args: A3) => R3
    ]
    : T extends {
        (...args: infer A1): infer R1
        (...args: infer A2): infer R2
    }
    ? [
        (...args: A1) => R1,
        (...args: A2) => R2
    ]
    : T extends {
        (...args: infer A1): infer R1
    }
    ? [
        (...args: A1) => R1
    ]
    : never
// prettier-ignore
export type FunctionOverloadsIndex<L extends 1 | 2 | 3 | 4 | 5 | 6> = 
    L extends 1
    ? 0
    : L extends 2
    ? 0 | 1
    : L extends 3
    ? 0 | 1 | 2
    : L extends 4
    ? 0 | 1 | 2 | 3
    : L extends 5
    ? 0 | 1 | 2 | 3 | 4
    : L extends 6
    ? 0 | 1 | 2 | 3 | 4 | 5
    : never;

type Intersection<U> = (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;
// #endregion

// #region Geomtoy
export type FunctionOverloadsLength<T> = FunctionOverloads<T>["length"];
export type StaticMethodsTailer<T extends { new (...args: any[]): any }> = {
    [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K] extends (...args: any[]) => any
        ? Intersection<
              {
                  [KK in FunctionOverloadsIndex<FunctionOverloadsLength<T[K]>>]: (...args: Tail<Parameters<FunctionOverloads<T[K]>[KK]>>) => ReturnType<FunctionOverloads<T[K]>[KK]>;
              }[FunctionOverloadsIndex<FunctionOverloadsLength<T[K]>>]
          >
        : never;
};
export type ConstructorTailer<T extends { new (...args: any[]): any }> = {
    (...args: Tail<ConstructorParameters<ConstructorOverloads<T>[number]>>): InstanceType<T>;
};
export type Factory<T extends { new (...args: any[]): any }> = ConstructorTailer<T> & StaticMethodsTailer<T>;

/* @internal */
export type FactoryCollection<T extends { [key: string]: { new (...args: any[]): any } }> = {
    readonly [K in keyof T]: Factory<T[K]>;
};
/* @internal */
export type StaticMethodsCollection<T extends { [key: string]: { new (...args: any[]): any } }> = {
    readonly [K in keyof T]: StaticMethodsTailer<T[K]>;
};

// export
export type RecursivePartial<T> = {
    [K in keyof T]?: T[K] extends (infer U)[] ? RecursivePartial<U>[] : T[K] extends object ? RecursivePartial<T[K]> : T[K];
};

// Geomtoy global options
export type Options = {
    epsilon: number;
    curveEpsilon: number;
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
export type DynamicObject<T> = {
    [K in keyof T as K extends `_${string}` | `${string}_` ? never : K extends keyof EventTarget ? never : K]: T[K];
};
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
export type EventTargetEventsPair = [EventTarget, string];

export type EventObjectFromPair<T extends EventTargetEventsPair[]> = {
    [K in keyof T]: T[K] extends EventTargetEventsPair ? EventObject<T[K][0]> : never;
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

export type Graphics = ImageGraphics | TextGraphics | GeometryGraphics;

export type ImageGraphicsCommand = {
    constantSize: boolean;
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
export type TextGraphicsCommand = {
    constantSize: boolean;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fontBold: boolean;
    fontItalic: boolean;
};

export type GeometryGraphicsCommand =
    | GeometryGraphicsMoveToCommand
    | GeometryGraphicsLineToCommand
    | GeometryGraphicsBezierToCommand
    | GeometryGraphicsQuadraticBezierToCommand
    | GeometryGraphicsArcToCommand
    | GeometryGraphicsCloseCommand;

export const enum GeometryGraphicsCommandType {
    MoveTo = "moveTo",
    LineTo = "lineTo",
    BezierTo = "bezierTo",
    QuadraticBezierTo = "quadraticBezierTo",
    ArcTo = "arcTo",
    Close = "close"
}

export type GeometryGraphicsMoveToCommand = {
    type: GeometryGraphicsCommandType.MoveTo;
    x: number;
    y: number;
};
export type GeometryGraphicsLineToCommand = {
    type: GeometryGraphicsCommandType.LineTo;
    x: number;
    y: number;
};
export type GeometryGraphicsBezierToCommand = {
    type: GeometryGraphicsCommandType.BezierTo;
    x: number;
    y: number;
    controlPoint1X: number;
    controlPoint1Y: number;
    controlPoint2X: number;
    controlPoint2Y: number;
};
export type GeometryGraphicsQuadraticBezierToCommand = {
    type: GeometryGraphicsCommandType.QuadraticBezierTo;
    x: number;
    y: number;
    controlPointX: number;
    controlPointY: number;
};
export type GeometryGraphicsArcToCommand = {
    type: GeometryGraphicsCommandType.ArcTo;
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
export type GeometryGraphicsCloseCommand = {
    type: GeometryGraphicsCommandType.Close;
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
/**
 * @see https://en.wikipedia.org/wiki/Three-valued_logic
 */
export type Trilean = true | false | undefined;

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

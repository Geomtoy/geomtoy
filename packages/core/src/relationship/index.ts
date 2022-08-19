import BaseObject from "../base/BaseObject";

import CircleCircle from "./classes/CircleCircle";
import LineSegmentLineSegment from "./classes/LineSegmentLineSegment";
import LineLine from "./classes/LineLine";
import LineRay from "./classes/LineRay";
import BezierBezier from "./classes/BezierBezier";
import EllipseEllipse from "./classes/EllipseEllipse";
import ArcArc from "./classes/ArcArc";
import QuadraticBezierQuadraticBezier from "./classes/QuadraticBezierQuadraticBezier";
import LineBezier from "./classes/LineBezier";
import LineCircle from "./classes/LineCircle";
import LineLineSegment from "./classes/LineLineSegment";
import LineQuadraticBezier from "./classes/LineQuadraticBezier";
import LineEllipse from "./classes/LineEllipse";
import LineArc from "./classes/LineArc";
import RayLineSegment from "./classes/RayLineSegment";
import RayQuadraticBezier from "./classes/RayQuadraticBezier";
import RayBezier from "./classes/RayBezier";
import RayArc from "./classes/RayArc";
import LineSegmentBezier from "./classes/LineSegmentBezier";
import LineSegmentQuadraticBezier from "./classes/LineSegmentQuadraticBezier";
import LineSegmentArc from "./classes/LineSegmentArc";

import { RelationshipPredicate, type RelationshipMethodOverloads } from "../types";
import LinePolygon from "./classes/LinePolygon";
import RayRay from "./classes/RayRay";
import RayCircle from "./classes/RayCircle";
import RayEllipse from "./classes/RayEllipse";
import LineSegmentEllipse from "./classes/LineSegmentEllipse";
import RayPolygon from "./classes/RayPolygon";
import QuadraticBezierEllipse from "./classes/QuadraticBezierEllipse";
import BezierEllipse from "./classes/BezierEllipse";
import ArcEllipse from "./classes/ArcEllipse";
// import PolygonEllipse from "./classes/PolygonEllipse";
import QuadraticBezierBezier from "./classes/QuadraticBezierBezier";
import QuadraticBezierArc from "./classes/QuadraticBezierArc";
import BezierArc from "./classes/BezierArc";
// import LineSegmentPolygon from "./classes/LineSegmentPolygon";
// import QuadraticBezierPolygon from "./classes/QuadraticBezierPolygon";
// import BezierPolygon from "./classes/BezierPolygon";
// import ArcPolygon from "./classes/ArcPolygon";
import PolygonPolygon from "./classes/PolygonPolygon";

const relationships = {
    // line/ray
    LineLine,
    LineRay,
    RayRay,

    // circle with line/ray
    CircleCircle,
    LineCircle,
    RayCircle,

    // ellipse with line/ray
    EllipseEllipse, // sup of ArcArc
    LineEllipse, // sup of LineArc, RayArc, LineSegmentArc
    RayEllipse,

    // line vs basic path segment
    LineLineSegment, // sup of RayLineSegment
    LineQuadraticBezier, // sup of RayQuadraticBezier, LineSegmentQuadraticBezier
    LineBezier, // sup of RayBezier, LineSegmentBezier
    LineArc, // sup of RayArc, LineSegmentArc
    LinePolygon, // why is? QuadraticBezier and Bezier can degenerate to Polygon

    // ray vs basic path segment
    RayLineSegment,
    RayQuadraticBezier,
    RayBezier,
    RayArc,
    RayPolygon, // why is? QuadraticBezier and Bezier can degenerate to Polygon

    // ellipse vs basic path segment
    LineSegmentEllipse,
    QuadraticBezierEllipse,
    BezierEllipse,
    ArcEllipse,
    // PolygonEllipse, //why is? QuadraticBezier and Bezier can degenerate to Polygon

    // basic path segment each other
    LineSegmentLineSegment,
    LineSegmentQuadraticBezier,
    LineSegmentBezier,
    LineSegmentArc,
    QuadraticBezierQuadraticBezier,
    QuadraticBezierBezier,
    QuadraticBezierArc,
    BezierBezier,
    BezierArc,
    ArcArc,

    // basic path segment vs polygon, why is? QuadraticBezier and Bezier can degenerate to Polygon
    // LineSegmentPolygon,
    // QuadraticBezierPolygon,
    // BezierPolygon,
    // ArcPolygon,

    // path and polygon with line/ray
    // LinePolygon // already in the list
    // RayPolygon // already in the list
    // LinePath,
    // RayPath,
    PolygonPolygon
    // PathPath,
    // PolygonPath
};

class Relationship extends BaseObject {
    // If we use Typescript to dynamically generate the overload signatures of methods, we must use properties
    // (There is currently no implementation for the function `implements` overload signature, @see https://github.com/microsoft/TypeScript/issues/34319),
    // but properties are defined on the instance not on the prototype according to the ES6 standard, so the `validAndWithSameOwner` will not be able to work.
    // To solve this, we define properties on the prototype and use `declare` to tell Typescript what happened.
    // But note that this is a type hack(workaround), since Typescript will think these methods on the prototype are properties on the instance.

    declare relate: RelationshipMethodOverloads<"relate", typeof relationships>;

    declare equal: RelationshipMethodOverloads<RelationshipPredicate.Equal, typeof relationships>;
    declare separate: RelationshipMethodOverloads<RelationshipPredicate.Separate, typeof relationships>;

    declare contain: RelationshipMethodOverloads<RelationshipPredicate.Contain, typeof relationships>;
    declare containedBy: RelationshipMethodOverloads<RelationshipPredicate.ContainedBy, typeof relationships>;

    declare intersect: RelationshipMethodOverloads<RelationshipPredicate.Intersect, typeof relationships>;
    declare strike: RelationshipMethodOverloads<RelationshipPredicate.Strike, typeof relationships>;
    declare contact: RelationshipMethodOverloads<RelationshipPredicate.Contact, typeof relationships>;
    declare cross: RelationshipMethodOverloads<RelationshipPredicate.Cross, typeof relationships>;
    declare touch: RelationshipMethodOverloads<RelationshipPredicate.Touch, typeof relationships>;
    declare block: RelationshipMethodOverloads<RelationshipPredicate.Block, typeof relationships>;
    declare blockedBy: RelationshipMethodOverloads<RelationshipPredicate.BlockedBy, typeof relationships>;
    declare connect: RelationshipMethodOverloads<RelationshipPredicate.Connect, typeof relationships>;
    declare coincide: RelationshipMethodOverloads<RelationshipPredicate.Coincide, typeof relationships>;

    toString(): string {
        return `${this.name}(${this.uuid})`;
    }
    toArray() {
        return [];
    }
    toObject() {
        return {};
    }
}

Object.defineProperty(Relationship.prototype, "relate", {
    value: function (geometry1: any, geometry2: any, predicates?: RelationshipPredicate[]) {
        const className = geometry1.name + geometry2.name;
        const rs = new relationships[className as keyof typeof relationships](geometry1, geometry2);
        return rs.relate(predicates);
    },
    // ES6 default
    configurable: true,
    enumerable: false,
    writable: true
});

Object.values(RelationshipPredicate).forEach(methodName => {
    Object.defineProperty(Relationship.prototype, methodName, {
        value: function (geometry1: any, geometry2: any) {
            const className = geometry1.name + geometry2.name;
            const rs = new relationships[className as keyof typeof relationships](geometry1, geometry2);
            return rs[methodName as RelationshipPredicate]!();
        },
        // ES6 default
        configurable: true,
        enumerable: false,
        writable: true
    });
});

export default Relationship;

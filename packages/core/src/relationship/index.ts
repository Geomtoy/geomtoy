import BaseObject from "../base/BaseObject";
import { RelationshipPredicate, type RelationshipMethodOverloads } from "../types";
import { initializedGeometryArguments, validGeometryArguments } from "../misc/decor-geometry";

import ArcArc from "./classes/ArcArc";
import ArcEllipse from "./classes/ArcEllipse";
import BezierArc from "./classes/BezierArc";
import BezierBezier from "./classes/BezierBezier";
import BezierEllipse from "./classes/BezierEllipse";
import CircleCircle from "./classes/CircleCircle";
import EllipseEllipse from "./classes/EllipseEllipse";
import LineArc from "./classes/LineArc";
import LineBezier from "./classes/LineBezier";
import LineCircle from "./classes/LineCircle";
import LineEllipse from "./classes/LineEllipse";
import LineLine from "./classes/LineLine";
import LineLineSegment from "./classes/LineLineSegment";
import LineQuadraticBezier from "./classes/LineQuadraticBezier";
import LineRay from "./classes/LineRay";
import LineSegmentArc from "./classes/LineSegmentArc";
import LineSegmentBezier from "./classes/LineSegmentBezier";
import LineSegmentEllipse from "./classes/LineSegmentEllipse";
import LineSegmentLineSegment from "./classes/LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./classes/LineSegmentQuadraticBezier";
import QuadraticBezierArc from "./classes/QuadraticBezierArc";
import QuadraticBezierBezier from "./classes/QuadraticBezierBezier";
import QuadraticBezierEllipse from "./classes/QuadraticBezierEllipse";
import QuadraticBezierQuadraticBezier from "./classes/QuadraticBezierQuadraticBezier";
import RayArc from "./classes/RayArc";
import RayBezier from "./classes/RayBezier";
import RayCircle from "./classes/RayCircle";
import RayEllipse from "./classes/RayEllipse";
import RayLineSegment from "./classes/RayLineSegment";
import RayQuadraticBezier from "./classes/RayQuadraticBezier";
import RayRay from "./classes/RayRay";

const relationships = {
    // line&ray
    LineLine,
    LineRay,
    RayRay,

    // circle with line&ray
    CircleCircle,
    LineCircle,
    RayCircle,

    // ellipse with line&ray
    EllipseEllipse, // sup of ArcArc
    LineEllipse, // sup of LineArc, RayArc, LineSegmentArc
    RayEllipse,

    // line vs basic path segment
    LineLineSegment, // sup of RayLineSegment
    LineQuadraticBezier, // sup of RayQuadraticBezier, LineSegmentQuadraticBezier
    LineBezier, // sup of RayBezier, LineSegmentBezier
    LineArc, // sup of RayArc, LineSegmentArc

    // ray vs basic path segment
    RayLineSegment,
    RayQuadraticBezier,
    RayBezier,
    RayArc,

    // ellipse vs basic path segment
    LineSegmentEllipse,
    QuadraticBezierEllipse, // sup of QuadraticBezierArc
    BezierEllipse, //sup of BezierArc
    ArcEllipse,

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
    ArcArc
};

class Relationship extends BaseObject {
    // If we use Typescript to dynamically generate the overload signatures of methods, we must use properties
    // (There is currently no implementation for the function `implements` overload signature, @see https://github.com/microsoft/TypeScript/issues/34319),
    // but properties are defined on the instance not on the prototype according to the ES6 standard.
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
initializedGeometryArguments(Relationship.prototype, "relate", Object.getOwnPropertyDescriptor(Relationship.prototype, "relate") as TypedPropertyDescriptor<(...args: any[]) => any>);

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
    initializedGeometryArguments(Relationship.prototype, methodName, Object.getOwnPropertyDescriptor(Relationship.prototype, methodName) as TypedPropertyDescriptor<(...args: any[]) => any>);
});

export default Relationship;

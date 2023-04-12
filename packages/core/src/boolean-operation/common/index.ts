import { Angle, Coordinates, Float } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import ArcArc from "../../intersection/classes/ArcArc";
import BezierArc from "../../intersection/classes/BezierArc";
import BezierBezier from "../../intersection/classes/BezierBezier";
import LineSegmentArc from "../../intersection/classes/LineSegmentArc";
import LineSegmentBezier from "../../intersection/classes/LineSegmentBezier";
import LineSegmentLineSegment from "../../intersection/classes/LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "../../intersection/classes/LineSegmentQuadraticBezier";
import QuadraticBezierArc from "../../intersection/classes/QuadraticBezierArc";
import QuadraticBezierBezier from "../../intersection/classes/QuadraticBezierBezier";
import QuadraticBezierQuadraticBezier from "../../intersection/classes/QuadraticBezierQuadraticBezier";
import SegmentWithFill from "../SegmentWithFill";

function negotiateAndSetTrajectoryId(swfA: SegmentWithFill, swfB: SegmentWithFill) {
    const trajectoryId = swfA.trajectoryId.negotiate(swfB.trajectoryId);
    swfA.trajectoryId = trajectoryId;
    swfB.trajectoryId = trajectoryId;
}

export function calcIntersection(
    swfA: SegmentWithFill,
    swfB: SegmentWithFill
): {
    intersectionType: "proper" | "coincidental" | "none";
    paramsA: number[];
    paramsB: number[];
} {
    const inter = prepareIntersection(swfA, swfB);
    // [n] degree bezier vs [n] degree bezier
    if (inter.type === "nn") {
        return nn(inter.intersection, () => negotiateAndSetTrajectoryId(swfA, swfB));
    }
    // [m] degree bezier vs [n] degree bezier
    if (inter.type === "mn") {
        return mn(inter.intersection, inter.inverse);
    }
    // any degree [b]ezier vs [a]rc
    if (inter.type === "ba") {
        return ba(inter.intersection, inter.inverse);
    }
    // [a]rc vs [a]rc
    if (inter.type === "aa") {
        return aa(inter.intersection, () => negotiateAndSetTrajectoryId(swfA, swfB));
    }
    throw new Error("[G]Impossible.");
}

function prepareIntersection(swfA: SegmentWithFill, swfB: SegmentWithFill) {
    const segmentA = swfA.segment;
    const segmentB = swfB.segment;

    if (segmentA instanceof LineSegment) {
        if (segmentB instanceof LineSegment)
            return {
                inverse: false,
                type: "nn" as const,
                intersection: new LineSegmentLineSegment(segmentA, segmentB)
            };
        if (segmentB instanceof QuadraticBezier)
            return {
                inverse: false,
                type: "mn" as const,
                intersection: new LineSegmentQuadraticBezier(segmentA, segmentB)
            };
        if (segmentB instanceof Bezier)
            return {
                inverse: false,
                type: "mn" as const,
                intersection: new LineSegmentBezier(segmentA, segmentB)
            };
        if (segmentB instanceof Arc)
            return {
                inverse: false,
                type: "ba" as const,
                intersection: new LineSegmentArc(segmentA, segmentB)
            };
    }
    if (segmentA instanceof QuadraticBezier) {
        if (segmentB instanceof LineSegment)
            return {
                inverse: true,
                type: "mn" as const,
                intersection: new LineSegmentQuadraticBezier(segmentB, segmentA)
            };
        if (segmentB instanceof QuadraticBezier)
            return {
                inverse: false,
                type: "nn" as const,
                intersection: new QuadraticBezierQuadraticBezier(segmentA, segmentB, true)
            };
        if (segmentB instanceof Bezier)
            return {
                inverse: false,
                type: "mn" as const,
                intersection: new QuadraticBezierBezier(segmentA, segmentB, true)
            };
        if (segmentB instanceof Arc)
            return {
                inverse: false,
                type: "ba" as const,
                intersection: new QuadraticBezierArc(segmentA, segmentB)
            };
    }
    if (segmentA instanceof Bezier) {
        if (segmentB instanceof LineSegment)
            return {
                inverse: true,
                type: "mn" as const,
                intersection: new LineSegmentBezier(segmentB, segmentA)
            };
        if (segmentB instanceof QuadraticBezier)
            return {
                inverse: true,
                type: "mn" as const,
                intersection: new QuadraticBezierBezier(segmentB, segmentA, true)
            };
        if (segmentB instanceof Bezier)
            return {
                inverse: false,
                type: "nn" as const,
                intersection: new BezierBezier(segmentA, segmentB, true)
            };
        if (segmentB instanceof Arc)
            return {
                inverse: false,
                type: "ba" as const,
                intersection: new BezierArc(segmentA, segmentB)
            };
    }
    if (segmentA instanceof Arc) {
        if (segmentB instanceof LineSegment)
            return {
                inverse: true,
                type: "ba" as const,
                intersection: new LineSegmentArc(segmentB, segmentA)
            };
        if (segmentB instanceof QuadraticBezier)
            return {
                inverse: true,
                type: "ba" as const,
                intersection: new QuadraticBezierArc(segmentB, segmentA)
            };
        if (segmentB instanceof Bezier)
            return {
                inverse: true,
                type: "ba" as const,
                intersection: new BezierArc(segmentB, segmentA)
            };
        if (segmentB instanceof Arc)
            return {
                inverse: false,
                type: "aa" as const,
                intersection: new ArcArc(segmentA, segmentB)
            };
    }
    throw new Error("[G]Impossible.");
}

function nn(inter: LineSegmentLineSegment | QuadraticBezierQuadraticBezier | BezierBezier, onSameTrajectory: () => void): ReturnType<typeof calcIntersection> {
    const ret = {
        intersectionType: "none",
        paramsA: [],
        paramsB: []
    } as ReturnType<typeof calcIntersection>;

    if (inter.onSameTrajectory()) {
        // Even they have no coincidence, still need do this, maybe some other segment connect them together.
        onSameTrajectory();
        ret.intersectionType = "coincidental";
        const a1t = inter.geometry2.getTimeOfPointExtend(inter.geometry1.point1Coordinates);
        const a2t = inter.geometry2.getTimeOfPointExtend(inter.geometry1.point2Coordinates);
        const b1t = inter.geometry1.getTimeOfPointExtend(inter.geometry2.point1Coordinates);
        const b2t = inter.geometry1.getTimeOfPointExtend(inter.geometry2.point2Coordinates);
        const [ait, att] = a1t > a2t ? [a2t, a1t] : [a1t, a2t];

        if (inter instanceof BezierBezier) {
            const ahc = inter.geometry1.getPointAtTime(0.5).coordinates;
            const bhc = inter.geometry2.getPointAtTime(0.5).coordinates;
            if (Float.equalTo(ait, 0, eps.timeEpsilon) && Float.equalTo(att, 1, eps.timeEpsilon)) {
                if (Coordinates.equalTo(ahc, bhc, eps.epsilon)) {
                    return ret; //equal
                } else {
                    ret.intersectionType = "none";
                    return ret; // each bezier is on the half of the loop
                }
            }
        } else {
            if (Float.equalTo(ait, 0, eps.timeEpsilon) && Float.equalTo(att, 1, eps.timeEpsilon)) {
                return ret; //equal
            }
        }

        if (Float.between(a1t, 0, 1, true, true, eps.timeEpsilon)) ret.paramsB.push(a1t);
        if (Float.between(a2t, 0, 1, true, true, eps.timeEpsilon)) ret.paramsB.push(a2t);
        if (Float.between(b1t, 0, 1, true, true, eps.timeEpsilon)) ret.paramsA.push(b1t);
        if (Float.between(b2t, 0, 1, true, true, eps.timeEpsilon)) ret.paramsA.push(b2t);
    } else {
        ret.intersectionType = "proper";
        inter.properIntersection().forEach(i => {
            if (Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon)) ret.paramsA.push(i.t1);
            if (Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon)) ret.paramsB.push(i.t2);
        });
    }
    if (ret.paramsA.length === 0 && ret.paramsB.length === 0) ret.intersectionType = "none";
    return ret;
}

function mn(inter: LineSegmentQuadraticBezier | LineSegmentBezier | QuadraticBezierBezier, inverse: boolean): ReturnType<typeof calcIntersection> {
    const ret = {
        intersectionType: "proper",
        paramsA: [],
        paramsB: []
    } as ReturnType<typeof calcIntersection>;

    inter.properIntersection().forEach(i => {
        if (Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon)) inverse ? ret.paramsB.push(i.t1) : ret.paramsA.push(i.t1);
        if (Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon)) inverse ? ret.paramsA.push(i.t2) : ret.paramsB.push(i.t2);
    });
    if (ret.paramsA.length === 0 && ret.paramsB.length === 0) ret.intersectionType = "none";
    return ret;
}

function ba(inter: LineSegmentArc | QuadraticBezierArc | BezierArc, inverse: boolean): ReturnType<typeof calcIntersection> {
    const ret = {
        intersectionType: "proper",
        atBInit: false,
        atBTerm: false,
        paramsA: [],
        paramsB: []
    } as ReturnType<typeof calcIntersection>;
    const [sa, ea] = inter.geometry2.getStartEndAngles();
    const positive = inter.geometry2.positive;

    inter.properIntersection().forEach(i => {
        if (Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon)) inverse ? ret.paramsB.push(i.t1) : ret.paramsA.push(i.t1);
        if (Angle.between(i.a2, sa, ea, positive, true, true, eps.angleEpsilon)) inverse ? ret.paramsA.push(i.a2) : ret.paramsB.push(i.a2);
    });
    if (ret.paramsA.length === 0 && ret.paramsB.length === 0) ret.intersectionType = "none";
    return ret;
}

function aa(inter: ArcArc, onSameTrajectory: () => void): ReturnType<typeof calcIntersection> {
    const ret = {
        intersectionType: "none",
        paramsA: [],
        paramsB: []
    } as ReturnType<typeof calcIntersection>;
    const [asa, aea] = inter.geometry1.getStartEndAngles();
    const positiveA = inter.geometry1.positive;

    const [bsa, bea] = inter.geometry2.getStartEndAngles();
    const positiveB = inter.geometry2.positive;

    if (inter.onSameTrajectory()) {
        // Even they have no coincidence, still need do this, maybe some other segment connect them together.
        onSameTrajectory();
        ret.intersectionType = "coincidental";
        const [aia, ata] = positiveA === positiveB ? [asa, aea] : [aea, asa];
        if (Angle.equalTo(aia, bsa, eps.angleEpsilon) && Angle.equalTo(ata, bea, eps.angleEpsilon)) {
            return ret; //equal
        }
        if (Angle.between(asa, bsa, bea, positiveB, true, true, eps.angleEpsilon)) ret.paramsB.push(asa);
        if (Angle.between(aea, bsa, bea, positiveB, true, true, eps.angleEpsilon)) ret.paramsB.push(aea);
        if (Angle.between(bsa, asa, aea, positiveA, true, true, eps.angleEpsilon)) ret.paramsA.push(bsa);
        if (Angle.between(bea, asa, aea, positiveA, true, true, eps.angleEpsilon)) ret.paramsA.push(bea);
    } else {
        ret.intersectionType = "proper";
        inter.properIntersection().forEach(i => {
            if (Angle.between(i.a1, asa, aea, positiveA, true, true, eps.angleEpsilon)) ret.paramsA.push(i.a1);
            if (Angle.between(i.a2, bsa, bea, positiveB, true, true, eps.angleEpsilon)) ret.paramsB.push(i.a2);
        });
    }
    if (ret.paramsA.length === 0 && ret.paramsB.length === 0) ret.intersectionType = "none";
    return ret;
}

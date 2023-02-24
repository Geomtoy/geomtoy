import { Angle, Maths } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { optioner } from "../../geomtoy";
import ArcArc from "../../relationship/classes/ArcArc";
import BezierArc from "../../relationship/classes/BezierArc";
import BezierBezier from "../../relationship/classes/BezierBezier";
import LineSegmentArc from "../../relationship/classes/LineSegmentArc";
import LineSegmentBezier from "../../relationship/classes/LineSegmentBezier";
import LineSegmentLineSegment from "../../relationship/classes/LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "../../relationship/classes/LineSegmentQuadraticBezier";
import QuadraticBezierArc from "../../relationship/classes/QuadraticBezierArc";
import QuadraticBezierBezier from "../../relationship/classes/QuadraticBezierBezier";
import QuadraticBezierQuadraticBezier from "../../relationship/classes/QuadraticBezierQuadraticBezier";
import ChipSegment from "./ChipSegment";
// * Memo:
// Make sure we have all the special cases of segments handled, because function here do not handle them.
// In another word, the input segments are considered the most common case of their type.
export function relationResult(chipSegmentA: ChipSegment, chipSegmentB: ChipSegment) {
    const { inverse, relationship: rs } = prepareRelationship(chipSegmentA, chipSegmentB);
    if (rs instanceof LineSegmentLineSegment || rs instanceof QuadraticBezierQuadraticBezier || rs instanceof BezierBezier) {
        // in this case, inverse always false
        return nn(chipSegmentA, chipSegmentB, rs);
    }
    if (rs instanceof LineSegmentQuadraticBezier || rs instanceof LineSegmentBezier || rs instanceof QuadraticBezierBezier) {
        return mn(chipSegmentA, chipSegmentB, rs, inverse);
    }
    if (rs instanceof LineSegmentArc || rs instanceof QuadraticBezierArc || rs instanceof BezierArc) {
        return ba(chipSegmentA, chipSegmentB, rs, inverse);
    }
    if (rs instanceof ArcArc) {
        // in this case, inverse always false
        return aa(chipSegmentA, chipSegmentB, rs);
    }
    return { a: [], b: [] };
}

function prepareRelationship(chipSegmentA: ChipSegment, chipSegmentB: ChipSegment) {
    const segmentA = chipSegmentA.segment;
    const segmentB = chipSegmentB.segment;

    if (segmentA instanceof LineSegment) {
        if (segmentB instanceof LineSegment)
            return {
                inverse: false,
                relationship: new LineSegmentLineSegment(segmentA, segmentB)
            };
        if (segmentB instanceof QuadraticBezier)
            return {
                inverse: false,
                relationship: new LineSegmentQuadraticBezier(segmentA, segmentB)
            };
        if (segmentB instanceof Bezier)
            return {
                inverse: false,
                relationship: new LineSegmentBezier(segmentA, segmentB)
            };
        if (segmentB instanceof Arc)
            return {
                inverse: false,
                relationship: new LineSegmentArc(segmentA, segmentB)
            };
    }
    if (segmentA instanceof QuadraticBezier) {
        if (segmentB instanceof LineSegment)
            return {
                inverse: true,
                relationship: new LineSegmentQuadraticBezier(segmentB, segmentA)
            };
        if (segmentB instanceof QuadraticBezier)
            return {
                inverse: false,
                relationship: new QuadraticBezierQuadraticBezier(segmentA, segmentB)
            };
        if (segmentB instanceof Bezier)
            return {
                inverse: false,
                relationship: new QuadraticBezierBezier(segmentA, segmentB)
            };
        if (segmentB instanceof Arc)
            return {
                inverse: false,
                relationship: new QuadraticBezierArc(segmentA, segmentB)
            };
    }
    if (segmentA instanceof Bezier) {
        if (segmentB instanceof LineSegment)
            return {
                inverse: true,
                relationship: new LineSegmentBezier(segmentB, segmentA)
            };
        if (segmentB instanceof QuadraticBezier)
            return {
                inverse: true,
                relationship: new QuadraticBezierBezier(segmentB, segmentA)
            };
        if (segmentB instanceof Bezier)
            return {
                inverse: false,
                relationship: new BezierBezier(segmentA, segmentB)
            };
        if (segmentB instanceof Arc)
            return {
                inverse: false,
                relationship: new BezierArc(segmentA, segmentB)
            };
    }
    if (segmentA instanceof Arc) {
        if (segmentB instanceof LineSegment)
            return {
                inverse: true,
                relationship: new LineSegmentArc(segmentB, segmentA)
            };
        if (segmentB instanceof QuadraticBezier)
            return {
                inverse: true,
                relationship: new QuadraticBezierArc(segmentB, segmentA)
            };
        if (segmentB instanceof Bezier)
            return {
                inverse: true,
                relationship: new BezierArc(segmentB, segmentA)
            };
        if (segmentB instanceof Arc)
            return {
                inverse: false,
                relationship: new ArcArc(segmentA, segmentB)
            };
    }
    throw new Error("[G]Impossible.");
}
// `n` degree bezier vs `n` degree bezier
function nn(chipSegmentA: ChipSegment, chipSegmentB: ChipSegment, rs: LineSegmentLineSegment | QuadraticBezierQuadraticBezier | BezierBezier) {
    const epsilon = optioner.options.epsilon;
    const segmentA = rs.geometry1; // chipSegmentA.segment
    const segmentB = rs.geometry2; // chipSegmentB.segment
    const paramsA: number[] = [];
    const paramsB: number[] = [];
    if (rs.onSameTrajectory()) {
        // Even they have no coincidence, still need do this, maybe some other segment connect them together.
        chipSegmentA.trajectoryId.negotiate(chipSegmentB.trajectoryId);

        const a1t = segmentB.getTimeOfPointExtend(segmentA.point1Coordinates);
        const a2t = segmentB.getTimeOfPointExtend(segmentA.point2Coordinates);
        const b1t = segmentA.getTimeOfPointExtend(segmentB.point1Coordinates);
        const b2t = segmentA.getTimeOfPointExtend(segmentB.point2Coordinates);
        if (Maths.between(a1t, 0, 1, true, true, epsilon)) paramsB.push(a1t);
        if (Maths.between(a2t, 0, 1, true, true, epsilon)) paramsB.push(a2t);
        if (Maths.between(b1t, 0, 1, true, true, epsilon)) paramsA.push(b1t);
        if (Maths.between(b2t, 0, 1, true, true, epsilon)) paramsA.push(b2t);
    } else {
        rs.intersection().forEach(i => {
            if (Maths.between(i.t1, 0, 1, true, true, epsilon)) paramsA.push(i.t1);
            if (Maths.between(i.t2, 0, 1, true, true, epsilon)) paramsB.push(i.t2);
        });
        // if (paramsA.length === 0 && paramsB.length === 0) return null;
        // const a = paramsA.length !== 0 ? splitChipSegment(chipSegmentA, paramsA) : [chipSegmentA];
        // const b = paramsB.length !== 0 ? splitChipSegment(chipSegmentB, paramsB) : [chipSegmentB];
        // return { a, b };
    }
    return {
        a: paramsA,
        b: paramsB
    };
}
// `m` degree bezier vs `n` degree bezier
function mn(chipSegmentA: ChipSegment, chipSegmentB: ChipSegment, rs: LineSegmentQuadraticBezier | LineSegmentBezier | QuadraticBezierBezier, inverse: boolean) {
    const epsilon = optioner.options.epsilon;
    const paramsA: number[] = [];
    const paramsB: number[] = [];

    rs.intersection().forEach(i => {
        if (Maths.between(i.t1, 0, 1, true, true, epsilon)) inverse ? paramsB.push(i.t1) : paramsA.push(i.t1);
        if (Maths.between(i.t2, 0, 1, true, true, epsilon)) inverse ? paramsA.push(i.t2) : paramsB.push(i.t2);
    });
    return { a: paramsA, b: paramsB };
}
// any degree bezier vs arc
function ba(chipSegmentA: ChipSegment, chipSegmentB: ChipSegment, rs: LineSegmentArc | QuadraticBezierArc | BezierArc, inverse: boolean) {
    const epsilon = optioner.options.epsilon;
    const paramsA: number[] = [];
    const paramsB: number[] = [];

    const [sa, ea] = rs.geometry2.getStartEndAngles();
    const positive = rs.geometry2.positive;
    rs.intersection().forEach(i => {
        if (Maths.between(i.t1, 0, 1, true, true, epsilon)) inverse ? paramsB.push(i.t1) : paramsA.push(i.t1);
        if (Angle.between(i.a2, sa, ea, positive, true, true, epsilon)) inverse ? paramsA.push(i.a2) : paramsB.push(i.a2);
    });

    return { a: paramsA, b: paramsB };
}
// arc vs arc
function aa(chipSegmentA: ChipSegment, chipSegmentB: ChipSegment, rs: ArcArc) {
    const epsilon = optioner.options.epsilon;
    const segmentA = rs.geometry1; // chipSegmentA.segment
    const segmentB = rs.geometry2; // chipSegmentB.segment
    const paramsA: number[] = [];
    const paramsB: number[] = [];

    const [asa, aea] = rs.geometry1.getStartEndAngles();
    const positiveA = rs.geometry1.positive;

    const [bsa, bea] = rs.geometry2.getStartEndAngles();
    const positiveB = rs.geometry2.positive;

    if (rs.onSameTrajectory()) {
        // Even they have no coincidence, still need do this, maybe some other segment connect them together.
        chipSegmentA.trajectoryId.negotiate(chipSegmentB.trajectoryId);

        const a1a = segmentB.getAngleOfPoint(segmentA.point1Coordinates);
        const a2a = segmentB.getAngleOfPoint(segmentA.point2Coordinates);
        const b1a = segmentA.getAngleOfPoint(segmentB.point1Coordinates);
        const b2a = segmentA.getAngleOfPoint(segmentB.point2Coordinates);
        if (Angle.between(a1a, bsa, bea, positiveB, true, true, epsilon)) paramsB.push(a1a);
        if (Angle.between(a2a, bsa, bea, positiveB, true, true, epsilon)) paramsB.push(a2a);
        if (Angle.between(b1a, asa, aea, positiveA, true, true, epsilon)) paramsA.push(b1a);
        if (Angle.between(b2a, asa, aea, positiveA, true, true, epsilon)) paramsA.push(b1a);
    } else {
        rs.intersection().forEach(i => {
            if (Angle.between(i.a1, asa, aea, positiveA, true, true, epsilon)) paramsA.push(i.a1);
            if (Angle.between(i.a2, bsa, bea, positiveB, true, true, epsilon)) paramsB.push(i.a2);
        });
    }
    return { a: paramsA, b: paramsB };
}

import { Angle, Coordinates, Maths } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
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
import MonoSegment from "./MonoSegment";

// * Memo:
// Make sure we have all the special cases of segments handled, because function here do not handle them.
// In another word, the input segments are considered the most common case of their type.
export function relationResult(monoSegmentA: MonoSegment, monoSegmentB: MonoSegment): { a: [null, ...MonoSegment[]] | MonoSegment[]; b: MonoSegment[] } | null {
    // If they are from the same origin, do nothing, they can not have any relation, but negotiate a trajectory id.
    if (monoSegmentA.origin === monoSegmentB.origin) {
        monoSegmentA.trajectoryId.negotiate(monoSegmentB.trajectoryId);
        return null;
    }

    const { inverse, relationship: rs } = prepareRelationship(monoSegmentA, monoSegmentB);
    if (rs instanceof LineSegmentLineSegment || rs instanceof QuadraticBezierQuadraticBezier || rs instanceof BezierBezier) {
        // in this case, inverse always false
        return nn(monoSegmentA, monoSegmentB, rs);
    }
    if (rs instanceof LineSegmentQuadraticBezier || rs instanceof LineSegmentBezier || rs instanceof QuadraticBezierBezier) {
        return mn(monoSegmentA, monoSegmentB, rs, inverse);
    }
    if (rs instanceof LineSegmentArc || rs instanceof QuadraticBezierArc || rs instanceof BezierArc) {
        return ba(monoSegmentA, monoSegmentB, rs, inverse);
    }
    if (rs instanceof ArcArc) {
        // in this case, inverse always false
        return aa(monoSegmentA, monoSegmentB, rs);
    }
    return null;
}

function prepareRelationship(monoSegmentA: MonoSegment, monoSegmentB: MonoSegment) {
    const segmentA = monoSegmentA.segment;
    const segmentB = monoSegmentB.segment;

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

function splitMonoSegment(monoSegment: MonoSegment, params: number[]) {
    const segment = monoSegment.segment;
    const segments = segment instanceof Arc ? segment.splitAtAngles(params) : segment.splitAtTimes(params);
    const monoSegments = segments.map(
        seg =>
            new MonoSegment({
                segment: seg,
                isPrimary: monoSegment.isPrimary,
                thisWinding: monoSegment.thisWinding,
                thatWinding: monoSegment.thatWinding,
                origin: monoSegment.origin,
                trajectoryId: monoSegment.trajectoryId,
                parent: monoSegment
            })
    );

    // reverse the order only, not the segments
    monoSegment.transposed && monoSegments.reverse();
    return monoSegments;
}

function handleCoincident(monoSegmentsA: MonoSegment[], monoSegmentsB: MonoSegment[]) {
    // In the scope of `onSameTrajectory`, it is very convenient to delete the coincident segment in `monoSegmentsA`(the segments of `curr`)
    // The coincident segment can only be the first segment of `monoSegmentsA`.
    // The only thing we need to consider is that their orientation may be different, then just compare the coordinates of endpoints.
    // For the segments are all monotones, so we don't even need to compare all the coordinates, just x-coordinate.
    let { point1Coordinates: a0e, point2Coordinates: a0l } = monoSegmentsA[0].segment;
    if (monoSegmentsA[0].transposed) [a0e, a0l] = [a0l, a0e];

    for (let i = 0, l = monoSegmentsB.length; i < l; i++) {
        let { point1Coordinates: bie, point2Coordinates: bil } = monoSegmentsB[i].segment;
        if (monoSegmentsB[i].transposed) [bie, bil] = [bil, bie];
        if (Coordinates.equalTo(a0e, bie, eps.epsilon) && Coordinates.equalTo(a0l, bil, eps.epsilon)) {
            const coincident = monoSegmentsA[0];
            monoSegmentsA[0] = null as unknown as MonoSegment;

            if (coincident.isPrimary === monoSegmentsB[i].isPrimary) {
                // they are from the same general geometry
                monoSegmentsB[i].thisWinding += coincident.thisWinding;
                monoSegmentsB[i].thatWinding += coincident.thatWinding;
            } else {
                // they are NOT from the same general geometry
                monoSegmentsB[i].thisWinding += coincident.thatWinding;
                monoSegmentsB[i].thatWinding += coincident.thisWinding;
            }
            return {
                a: monoSegmentsA as [null, ...MonoSegment[]],
                b: monoSegmentsB
            };
        }
    }
    throw new Error("[G]Should not call this, if there is no coincidence.");
}

// `n` degree bezier vs `n` degree bezier
function nn(monoSegmentA: MonoSegment, monoSegmentB: MonoSegment, rs: LineSegmentLineSegment | QuadraticBezierQuadraticBezier | BezierBezier) {
    const segmentA = rs.geometry1; // monoSegmentA.segment
    const segmentB = rs.geometry2; // monoSegmentB.segment
    const paramsA: number[] = [];
    const paramsB: number[] = [];

    if (rs.onSameTrajectory()) {
        // Even they have no coincidence, still need do this, maybe some other segment connect them together.
        monoSegmentA.trajectoryId.negotiate(monoSegmentB.trajectoryId);

        const a1t = segmentB.getTimeOfPointExtend(segmentA.point1Coordinates);
        const a2t = segmentB.getTimeOfPointExtend(segmentA.point2Coordinates);
        const b1t = segmentA.getTimeOfPointExtend(segmentB.point1Coordinates);
        const b2t = segmentA.getTimeOfPointExtend(segmentB.point2Coordinates);

        const [bit, btt] = b1t > b2t ? [b2t, b1t] : [b1t, b2t];
        // same segment
        if (Maths.equalTo(bit, 0, eps.timeEpsilon) && Maths.equalTo(btt, 1, eps.timeEpsilon)) {
            return handleCoincident([monoSegmentA], [monoSegmentB]);
        }
        if (Maths.between(a1t, 0, 1, true, true, eps.timeEpsilon)) paramsB.push(a1t);
        if (Maths.between(a2t, 0, 1, true, true, eps.timeEpsilon)) paramsB.push(a2t);
        if (Maths.between(b1t, 0, 1, true, true, eps.timeEpsilon)) paramsA.push(b1t);
        if (Maths.between(b2t, 0, 1, true, true, eps.timeEpsilon)) paramsA.push(b2t);
        // no overlap
        if (paramsA.length === 0 && paramsB.length === 0) return null;
        const a = paramsA.length !== 0 ? splitMonoSegment(monoSegmentA, paramsA) : [monoSegmentA];
        const b = paramsB.length !== 0 ? splitMonoSegment(monoSegmentB, paramsB) : [monoSegmentB];
        return handleCoincident(a, b);
    } else {
        rs.intersection().forEach(i => {
            if (Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon)) paramsA.push(i.t1);
            if (Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon)) paramsB.push(i.t2);
        });
        if (paramsA.length === 0 && paramsB.length === 0) return null;
        const a = paramsA.length !== 0 ? splitMonoSegment(monoSegmentA, paramsA) : [monoSegmentA];
        const b = paramsB.length !== 0 ? splitMonoSegment(monoSegmentB, paramsB) : [monoSegmentB];
        return { a, b };
    }
}

// `m` degree bezier vs `n` degree bezier
function mn(monoSegmentA: MonoSegment, monoSegmentB: MonoSegment, rs: LineSegmentQuadraticBezier | LineSegmentBezier | QuadraticBezierBezier, inverse: boolean) {
    const paramsA: number[] = [];
    const paramsB: number[] = [];

    rs.intersection().forEach(i => {
        if (Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon)) inverse ? paramsB.push(i.t1) : paramsA.push(i.t1);
        if (Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon)) inverse ? paramsA.push(i.t2) : paramsB.push(i.t2);
    });

    if (paramsA.length === 0 && paramsB.length === 0) return null;
    const a = paramsA.length !== 0 ? splitMonoSegment(monoSegmentA, paramsA) : [monoSegmentA];
    const b = paramsB.length !== 0 ? splitMonoSegment(monoSegmentB, paramsB) : [monoSegmentB];
    return { a, b };
}

// any degree bezier vs arc
function ba(monoSegmentA: MonoSegment, monoSegmentB: MonoSegment, rs: LineSegmentArc | QuadraticBezierArc | BezierArc, inverse: boolean) {
    const paramsA: number[] = [];
    const paramsB: number[] = [];

    const [sa, ea] = rs.geometry2.getStartEndAngles();
    const positive = rs.geometry2.positive;

    rs.intersection().forEach(i => {
        if (Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon)) inverse ? paramsB.push(i.t1) : paramsA.push(i.t1);
        if (Angle.between(i.a2, sa, ea, positive, true, true, eps.angleEpsilon)) inverse ? paramsA.push(i.a2) : paramsB.push(i.a2);
    });

    if (paramsA.length === 0 && paramsB.length === 0) return null;
    const a = paramsA.length !== 0 ? splitMonoSegment(monoSegmentA, paramsA) : [monoSegmentA];
    const b = paramsB.length !== 0 ? splitMonoSegment(monoSegmentB, paramsB) : [monoSegmentB];
    return { a, b };
}

// arc vs arc
function aa(monoSegmentA: MonoSegment, monoSegmentB: MonoSegment, rs: ArcArc) {
    const segmentA = rs.geometry1; // monoSegmentA.segment
    const segmentB = rs.geometry2; // monoSegmentB.segment
    const paramsA: number[] = [];
    const paramsB: number[] = [];

    const [asa, aea] = rs.geometry1.getStartEndAngles();
    const positiveA = rs.geometry1.positive;

    const [bsa, bea] = rs.geometry2.getStartEndAngles();
    const positiveB = rs.geometry2.positive;

    if (rs.onSameTrajectory()) {
        // Even they have no coincidence, still need do this, maybe some other segment connect them together.
        monoSegmentA.trajectoryId.negotiate(monoSegmentB.trajectoryId);

        const a1a = segmentB.getAngleOfPoint(segmentA.point1Coordinates);
        const a2a = segmentB.getAngleOfPoint(segmentA.point2Coordinates);
        const b1a = segmentA.getAngleOfPoint(segmentB.point1Coordinates);
        const b2a = segmentA.getAngleOfPoint(segmentB.point2Coordinates);
        const [aia, ata] = positiveA ? [asa, aea] : [aea, asa];
        const [bia, bta] = positiveB ? [bsa, bea] : [aea, bsa];
        // same segment
        if (Angle.equalTo(aia, bia, eps.angleEpsilon) && Angle.equalTo(ata, bta, eps.angleEpsilon)) {
            return handleCoincident([monoSegmentA], [monoSegmentB]);
        }

        if (Angle.between(a1a, bsa, bea, positiveB, true, true, eps.angleEpsilon)) paramsB.push(a1a);
        if (Angle.between(a2a, bsa, bea, positiveB, true, true, eps.angleEpsilon)) paramsB.push(a2a);
        if (Angle.between(b1a, asa, aea, positiveA, true, true, eps.angleEpsilon)) paramsA.push(b1a);
        if (Angle.between(b2a, asa, aea, positiveA, true, true, eps.angleEpsilon)) paramsA.push(b1a);
        // no overlap
        if (paramsA.length === 0 && paramsB.length === 0) return null;
        const a = paramsA.length !== 0 ? splitMonoSegment(monoSegmentA, paramsA) : [monoSegmentA];
        const b = paramsB.length !== 0 ? splitMonoSegment(monoSegmentB, paramsB) : [monoSegmentB];
        return handleCoincident(a, b);
    } else {
        rs.intersection().forEach(i => {
            if (Angle.between(i.a1, asa, aea, positiveA, true, true, eps.angleEpsilon)) paramsA.push(i.a1);
            if (Angle.between(i.a2, bsa, bea, positiveB, true, true, eps.angleEpsilon)) paramsB.push(i.a2);
        });
        if (paramsA.length === 0 && paramsB.length === 0) return null;
        const a = paramsA.length !== 0 ? splitMonoSegment(monoSegmentA, paramsA) : [monoSegmentA];
        const b = paramsB.length !== 0 ? splitMonoSegment(monoSegmentB, paramsB) : [monoSegmentB];
        return { a, b };
    }
}

import { Angle, Maths, Utility } from "@geomtoy/util";
import { optioner } from "../geomtoy";
import Path from "../geometries/advanced/Path";
import Polygon from "../geometries/advanced/Polygon";
import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import SegmentFillAnnotation from "./SegmentFillAnnotation";
import ArcArc from "../relationship/classes/ArcArc";
import BezierArc from "../relationship/classes/BezierArc";
import BezierBezier from "../relationship/classes/BezierBezier";
import LineSegmentArc from "../relationship/classes/LineSegmentArc";
import LineSegmentBezier from "../relationship/classes/LineSegmentBezier";
import LineSegmentLineSegment from "../relationship/classes/LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "../relationship/classes/LineSegmentQuadraticBezier";
import QuadraticBezierArc from "../relationship/classes/QuadraticBezierArc";
import QuadraticBezierBezier from "../relationship/classes/QuadraticBezierBezier";
import QuadraticBezierQuadraticBezier from "../relationship/classes/QuadraticBezierQuadraticBezier";
import Compound from "../geometries/advanced/Compound";
import { type FillDescription } from "../types";

export default class SegmentProcessor {
    // * Memo:
    // Make sure we have all the special cases of segments handled, because function here do not handle them.
    // In another word, the input segments are considered the most common case of their type.
    private _prepareRelationship(segmentA: LineSegment | QuadraticBezier | Bezier | Arc, segmentB: LineSegment | QuadraticBezier | Bezier | Arc) {
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
    private _nn(rs: LineSegmentLineSegment | QuadraticBezierQuadraticBezier | BezierBezier) {
        const epsilon = optioner.options.epsilon;
        const aParams: number[] = [];
        const bParams: number[] = [];

        const aSegment = rs.geometry1;
        const bSegment = rs.geometry2;

        if (rs.onSameTrajectory()) {
            const a1t = bSegment.getTimeOfPointExtend(aSegment.point1Coordinates);
            const a2t = bSegment.getTimeOfPointExtend(aSegment.point2Coordinates);
            const b1t = aSegment.getTimeOfPointExtend(bSegment.point1Coordinates);
            const b2t = aSegment.getTimeOfPointExtend(bSegment.point2Coordinates);
            if (Maths.between(a1t, 0, 1, true, true, epsilon)) bParams.push(a1t);
            if (Maths.between(a2t, 0, 1, true, true, epsilon)) bParams.push(a2t);
            if (Maths.between(b1t, 0, 1, true, true, epsilon)) aParams.push(b1t);
            if (Maths.between(b2t, 0, 1, true, true, epsilon)) aParams.push(b2t);
        } else {
            rs.intersection().forEach(i => {
                if (Maths.between(i.t1, 0, 1, true, true, epsilon)) aParams.push(i.t1);
                if (Maths.between(i.t2, 0, 1, true, true, epsilon)) bParams.push(i.t2);
            });
        }
        return { aParams, bParams };
    }
    // `m` degree bezier vs `n` degree bezier
    private _mn(rs: LineSegmentQuadraticBezier | LineSegmentBezier | QuadraticBezierBezier, inverse: boolean) {
        const epsilon = optioner.options.epsilon;
        const aParams: number[] = [];
        const bParams: number[] = [];

        rs.intersection().forEach(i => {
            if (Maths.between(i.t1, 0, 1, true, true, epsilon)) inverse ? bParams.push(i.t1) : aParams.push(i.t1);
            if (Maths.between(i.t2, 0, 1, true, true, epsilon)) inverse ? aParams.push(i.t2) : bParams.push(i.t2);
        });
        return { aParams, bParams };
    }
    // any degree bezier vs arc
    private _ba(rs: LineSegmentArc | QuadraticBezierArc | BezierArc, inverse: boolean) {
        const epsilon = optioner.options.epsilon;
        const aParams: number[] = [];
        const bParams: number[] = [];

        const [sa, ea] = rs.geometry2.getStartEndAngles();
        const positive = rs.geometry2.positive;
        rs.intersection().forEach(i => {
            if (Maths.between(i.t1, 0, 1, true, true, epsilon)) inverse ? bParams.push(i.t1) : aParams.push(i.t1);
            if (Angle.between(i.a2, sa, ea, positive, true, true, epsilon)) inverse ? aParams.push(i.a2) : bParams.push(i.a2);
        });
        return { aParams, bParams };
    }
    // arc vs arc
    private _aa(rs: ArcArc) {
        const epsilon = optioner.options.epsilon;
        const aParams: number[] = [];
        const bParams: number[] = [];

        const aSegment = rs.geometry1;
        const [asa, aea] = rs.geometry1.getStartEndAngles();
        const aPositive = rs.geometry1.positive;

        const bSegment = rs.geometry2;
        const [bsa, bea] = rs.geometry2.getStartEndAngles();
        const bPositive = rs.geometry2.positive;

        if (rs.onSameTrajectory()) {
            const a1a = bSegment.getAngleOfPoint(aSegment.point1Coordinates);
            const a2a = bSegment.getAngleOfPoint(aSegment.point2Coordinates);
            const b1a = aSegment.getAngleOfPoint(bSegment.point1Coordinates);
            const b2a = aSegment.getAngleOfPoint(bSegment.point2Coordinates);
            if (Angle.between(a1a, bsa, bea, bPositive, true, true, epsilon)) bParams.push(a1a);
            if (Angle.between(a2a, bsa, bea, bPositive, true, true, epsilon)) bParams.push(a2a);
            if (Angle.between(b1a, asa, aea, aPositive, true, true, epsilon)) aParams.push(b1a);
            if (Angle.between(b2a, asa, aea, aPositive, true, true, epsilon)) aParams.push(b1a);
        } else {
            rs.intersection().forEach(i => {
                if (Angle.between(i.a1, asa, aea, aPositive, true, true, epsilon)) aParams.push(i.a1);
                if (Angle.between(i.a2, bsa, bea, bPositive, true, true, epsilon)) bParams.push(i.a2);
            });
        }
        return { aParams, bParams };
    }

    private _apportion(segmentA: LineSegment | QuadraticBezier | Bezier | Arc, segmentB: LineSegment | QuadraticBezier | Bezier | Arc) {
        const { inverse, relationship: rs } = this._prepareRelationship(segmentA, segmentB);
        if (rs instanceof LineSegmentLineSegment || rs instanceof QuadraticBezierQuadraticBezier || rs instanceof BezierBezier) {
            // in this case, inverse always false
            return this._nn(rs);
        }
        if (rs instanceof LineSegmentQuadraticBezier || rs instanceof LineSegmentBezier || rs instanceof QuadraticBezierBezier) {
            return this._mn(rs, inverse);
        }
        if (rs instanceof LineSegmentArc || rs instanceof QuadraticBezierArc || rs instanceof BezierArc) {
            return this._ba(rs, inverse);
        }
        if (rs instanceof ArcArc) {
            // in this case, inverse always false
            return this._aa(rs);
        }
        throw new Error("[G]Impossible.");
    }

    public describe(advancedGeometry: Polygon | Path | Compound) {
        const epsilon = optioner.options.epsilon;
        const originalDesc: FillDescription = {
            fillRule: advancedGeometry.fillRule,
            annotations: advancedGeometry.getSegments(true, true).map(segment => new SegmentFillAnnotation(segment))
        };

        // handle special cases
        for (let i = 0, l = originalDesc.annotations.length; i < l; i++) {
            const sfa = originalDesc.annotations[i];
            if (sfa.segment instanceof Bezier) {
                // handle bezier self-intersection
                const tsi = sfa.segment.selfIntersection();
                if (tsi.length !== 0) {
                    const beziers = sfa.segment.splitAtTimes(tsi);
                    const [head, ...tail] = beziers;
                    sfa.segment = head;
                    tail.forEach(bezier => originalDesc.annotations.push(new SegmentFillAnnotation(bezier)));
                    continue;
                }
                // handle bezier triple lines
                if (sfa.segment.isTripleLines()) {
                    const points = [sfa.segment.point1, ...sfa.segment.extrema().map(([p]) => p), sfa.segment.point2];
                    const lineSegments = points.reduce((acc, _, index) => {
                        if (points[index - 1] !== undefined) acc.push(new LineSegment(points[index - 1], points[index]));
                        return acc;
                    }, [] as LineSegment[]);
                    const [head, ...tail] = lineSegments;
                    sfa.segment = head;
                    tail.forEach(lineSegment => originalDesc.annotations.push(new SegmentFillAnnotation(lineSegment)));
                    continue;
                }
                // handle bezier degeneration(dimensional degeneration is handled by calling `getSegments(true, true)`)
                sfa.segment = sfa.segment.nonDimensionallyDegenerate();
            }
            if (sfa.segment instanceof QuadraticBezier) {
                // handle quadratic bezier double lines
                if (sfa.segment.isDoubleLines()) {
                    const points = [sfa.segment.point1, ...sfa.segment.extrema().map(([p]) => p), sfa.segment.point2];
                    const lineSegments = points.reduce((acc, _, index) => {
                        if (points[index - 1] !== undefined) acc.push(new LineSegment(points[index - 1], points[index]));
                        return acc;
                    }, [] as LineSegment[]);
                    const [head, ...tail] = lineSegments;
                    sfa.segment = head;
                    tail.forEach(lineSegment => originalDesc.annotations.push(new SegmentFillAnnotation(lineSegment)));
                    continue;
                }
                // handle quadratic bezier degeneration(dimensional degeneration is handled by calling `getSegments(true, true)`)
                sfa.segment = sfa.segment.nonDimensionallyDegenerate();
            }
        }

        const isPolygon = advancedGeometry instanceof Polygon;

        // Step 1: Get all portion params.
        for (let i = 0, m = originalDesc.annotations.length - 1; i < m; i++) {
            const a = originalDesc.annotations[i];

            // skip i + 1, if is polygon
            for (let j = isPolygon ? i + 2 : i + 1, n = originalDesc.annotations.length; j < n; j++) {
                const b = originalDesc.annotations[j];
                const { aParams, bParams } = this._apportion(a.segment, b.segment);
                a.portionParams.push(...aParams);
                b.portionParams.push(...bParams);
            }
        }

        // Step 2: portion.
        const portionedDesc: FillDescription = {
            fillRule: originalDesc.fillRule,
            annotations: []
        };
        originalDesc.annotations.forEach(sfa => {
            if (sfa.portionParams.length !== 0) {
                const portionParams = Utility.uniqWith(sfa.portionParams, (a, b) => Maths.equalTo(a, b, epsilon));
                const portions = sfa.segment instanceof Arc ? sfa.segment.splitAtAngles(portionParams) : sfa.segment.splitAtTimes(portionParams);
                portions
                    .map(portion => new SegmentFillAnnotation(portion))
                    .forEach(pfa => {
                        pfa.annotateThis(originalDesc.annotations, originalDesc.fillRule);
                        portionedDesc.annotations.push(pfa);
                    });
            } else {
                sfa.annotateThis(originalDesc.annotations, originalDesc.fillRule);
                portionedDesc.annotations.push(sfa);
            }
        });
        return portionedDesc;
    }

    public combine(descriptionA: FillDescription, descriptionB: FillDescription) {
        const epsilon = optioner.options.epsilon;

        for (let i = 0, m = descriptionA.annotations.length; i < m; i++) {
            const a = descriptionA.annotations[i];
            for (let j = 0, n = descriptionB.annotations.length; j < n; j++) {
                const b = descriptionB.annotations[j];
                const { aParams, bParams } = this._apportion(a.segment, b.segment);
                a.portionParams.push(...aParams);
                b.portionParams.push(...bParams);
            }
        }

        // Remember: descriptionA is the subject(the primary geometry)
        //           descriptionB is the clip(the secondary geometry)
        // All operation is in the view of A.

        const fillRule = descriptionA.fillRule;
        const combinedDesc: FillDescription = {
            fillRule,
            annotations: []
        };

        descriptionA.annotations.forEach(sfa => {
            if (sfa.portionParams.length !== 0) {
                const portionParams = Utility.uniqWith(sfa.portionParams, (a, b) => Maths.equalTo(a, b, epsilon));
                const portions = sfa.segment instanceof Arc ? sfa.segment.splitAtAngles(portionParams) : sfa.segment.splitAtTimes(portionParams);
                portions
                    .map(portion => {
                        const ret = new SegmentFillAnnotation(portion);
                        ret.thisFill = { ...sfa.thisFill };
                        return ret;
                    })
                    .forEach(pfa => {
                        pfa.annotateThat(descriptionB.annotations, descriptionB.fillRule);
                        combinedDesc.annotations.push(pfa);
                    });
            } else {
                const copy = new SegmentFillAnnotation(sfa.segment);
                copy.thisFill = { ...sfa.thisFill };
                copy.annotateThat(descriptionB.annotations, descriptionB.fillRule);
                combinedDesc.annotations.push(copy);
            }
        });

        descriptionB.annotations.forEach(sfa => {
            if (sfa.portionParams.length !== 0) {
                const portionParams = Utility.uniqWith(sfa.portionParams!, (a, b) => Maths.equalTo(a, b, epsilon));
                const portions = sfa.segment instanceof Arc ? sfa.segment.splitAtAngles(portionParams) : sfa.segment.splitAtTimes(portionParams);
                portions
                    .map(portion => {
                        const ret = new SegmentFillAnnotation(portion);
                        // swap the fill
                        ret.thatFill = { ...sfa.thisFill };
                        return ret;
                    })
                    .forEach(pfa => {
                        pfa.annotateThis(descriptionA.annotations, descriptionA.fillRule);
                        combinedDesc.annotations.push(pfa);
                    });
            } else {
                const copy = new SegmentFillAnnotation(sfa.segment);
                // swap the fill
                copy.thatFill = { ...sfa.thisFill };
                copy.annotateThis(descriptionA.annotations, descriptionA.fillRule);
                combinedDesc.annotations.push(copy);
            }
        });
        return combinedDesc;
    }
}

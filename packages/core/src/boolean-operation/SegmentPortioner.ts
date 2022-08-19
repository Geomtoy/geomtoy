import { Angle, Maths } from "@geomtoy/util";
import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import { optioner } from "../geomtoy";
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

export default class SegmentPortioner {
    // Make sure we have all the special cases of segments handled, because this class do not handle them.
    // In another word, the input `segmentA` and `segmentB` are considered the most common case of their type.

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

    portion(segmentA: LineSegment | QuadraticBezier | Bezier | Arc, segmentB: LineSegment | QuadraticBezier | Bezier | Arc) {
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
}

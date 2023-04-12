import { Angle, Coordinates, Maths, Vector2 } from "@geomtoy/util";
import Arc from "../geometries/basic/Arc";
import Bezier from "../geometries/basic/Bezier";
import LineSegment from "../geometries/basic/LineSegment";
import Point from "../geometries/basic/Point";
import QuadraticBezier from "../geometries/basic/QuadraticBezier";
import { eps } from "../geomtoy";
import SegmentWithFill from "./SegmentWithFill";

export default class Merger {
    // merge at swfA's tail and swfB's head, like : swfA --> swfB
    merge(swfA: SegmentWithFill, swfB: SegmentWithFill) {
        if (!swfA.trajectoryId.equalTo(swfB.trajectoryId)) {
            return null;
        }

        if (swfA.segment instanceof LineSegment && swfB.segment instanceof LineSegment) {
            const { point1Coordinates: ac1 } = swfA.segment;
            const { point2Coordinates: bc2 } = swfB.segment;
            const ret = new SegmentWithFill(new LineSegment(ac1, bc2), swfA.trajectoryId);
            ret.thisFill = { ...swfA.thisFill };
            ret.thatFill = { ...swfA.thatFill };
            return ret;
        }
        if (swfA.segment instanceof Arc && swfB.segment instanceof Arc) {
            const { point1Coordinates: ac1, radiusX: rx, radiusY: ry, rotation: phi, positive: pos } = swfA.segment;
            const { point2Coordinates: bc2 } = swfB.segment;
            const [sa] = swfA.segment.getStartEndAngles();
            const [, ea] = swfB.segment.getStartEndAngles();

            // prettier-ignore
            const deltaTheta = pos
                ? ea > sa 
                    ? ea - sa 
                    : 2 * Maths.PI - (sa - ea)
                : sa > ea 
                    ? sa - ea 
                    : 2 * Maths.PI - (ea - sa);
            const la = deltaTheta > Maths.PI ? true : false;
            // prevent full arc
            if (Angle.equalTo(deltaTheta, Maths.PI * 2, eps.angleEpsilon)) return null;

            const ret = new SegmentWithFill(new Arc(ac1, bc2, rx, ry, la, pos, phi), swfA.trajectoryId);
            ret.thisFill = { ...swfA.thisFill };
            ret.thatFill = { ...swfA.thatFill };
            return ret;
        }
        if (swfA.segment instanceof QuadraticBezier && swfB.segment instanceof QuadraticBezier) {
            const { point1Coordinates: ac1, point2Coordinates: ac2, controlPointCoordinates: acc } = swfA.segment;
            const { point1Coordinates: bc1, point2Coordinates: bc2, controlPointCoordinates: bcc } = swfB.segment;
            // `ac2` and `bc1` should be equal, but for more precision, we take the average.
            const cm = [Maths.avg(Coordinates.x(ac2), Coordinates.x(bc1)), Maths.avg(Coordinates.y(ac2), Coordinates.y(bc1))] as [number, number];
            const value1 = Vector2.magnitude(Vector2.from(acc, cm));
            const value2 = Vector2.magnitude(Vector2.from(bcc, cm));
            const t = value1 / (value1 + value2); // the t value on the merged quadratic bezier of `cm`.
            const cpc = Vector2.add(ac1, Vector2.scalarMultiply(Vector2.from(ac1, acc), 1 / t));
            // the calculation from `bc2` is the same.

            const ret = new SegmentWithFill(new QuadraticBezier(ac1, bc2, cpc), swfA.trajectoryId);
            ret.thisFill = { ...swfA.thisFill };
            ret.thatFill = { ...swfA.thatFill };
            return ret;
        }
        if (swfA.segment instanceof Bezier && swfB.segment instanceof Bezier) {
            const { point1Coordinates: ac1, point2Coordinates: ac2, controlPoint1Coordinates: acc1, controlPoint2Coordinates: acc2 } = swfA.segment;
            const { point1Coordinates: bc1, point2Coordinates: bc2, controlPoint1Coordinates: bcc1, controlPoint2Coordinates: bcc2 } = swfB.segment;
            // `ac2` and `bc1` should be equal, but for more precision, we take the average.
            const cm = [Maths.avg(Coordinates.x(ac2), Coordinates.x(bc1)), Maths.avg(Coordinates.y(ac2), Coordinates.y(bc1))] as [number, number];
            // handle bezier self-intersection, the loop and the out branches of the loop
            if (!Point.isThreePointsCollinear(cm, acc2, bcc1)) return null;

            const value1 = Vector2.magnitude(Vector2.from(acc2, cm));
            const value2 = Vector2.magnitude(Vector2.from(bcc1, cm));
            const t = value1 / (value1 + value2); // the t value on the merged bezier of `cm`.
            const cpc1 = Vector2.add(ac1, Vector2.scalarMultiply(Vector2.from(ac1, acc1), 1 / t));
            const cpc2 = Vector2.add(bc2, Vector2.scalarMultiply(Vector2.from(bc2, bcc2), 1 / (1 - t)));

            const ret = new SegmentWithFill(new Bezier(ac1, bc2, cpc1, cpc2), swfA.trajectoryId);
            ret.thisFill = { ...swfA.thisFill };
            ret.thatFill = { ...swfA.thatFill };
            return ret;
        }

        throw new Error("[G]Impossible.");
    }
}

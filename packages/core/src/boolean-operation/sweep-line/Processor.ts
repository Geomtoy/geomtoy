import { Angle, Maths, Polynomial, Type, Utility } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { optioner } from "../../geomtoy";
import { FillDescription, GeneralGeometry } from "../../types";
import TrajectoryId from "../TrajectoryId";
import MonoSegment from "./MonoSegment";
import SweepLine from "./SweepLine";

export default class Processor {
    // Decompose the curves to monotones to apply sweep line algorithm
    private _preprocess(gg: GeneralGeometry, isPrimary: boolean) {
        const segments = gg.getSegments(true, true);
        const ret: MonoSegment[] = [];

        for (const segment of segments) {
            if (segment instanceof LineSegment) {
                ret.push(...this._monoLineSegment(segment, isPrimary));
            }
            if (segment instanceof QuadraticBezier) {
                ret.push(...this._monoQuadraticBezier(segment, isPrimary));
            }
            if (segment instanceof Bezier) {
                ret.push(...this._monoBezier(segment, isPrimary));
            }
            if (segment instanceof Arc) {
                ret.push(...this._monoArc(segment, isPrimary));
            }
        }
        return ret;
    }

    private _monoLineSegment(lineSegment: LineSegment, isPrimary: boolean) {
        return [
            new MonoSegment({
                segment: lineSegment,
                isPrimary,
                origin: lineSegment,
                trajectoryId: new TrajectoryId(lineSegment.uuid)
            })
        ];
    }

    private _monoArc(arc: Arc, isPrimary: boolean) {
        // handle degenerate
        const dg = arc.degenerate(false);
        if (dg instanceof LineSegment) {
            return this._monoLineSegment(dg, isPrimary);
        }

        const [sa, ea] = arc.getStartEndAngles();
        const { rotation: phi, radiusX: rx, radiusY: ry, positive } = arc;
        const cosPhi = Maths.cos(phi);
        const sinPhi = Maths.sin(phi);
        const epsilon = optioner.options.epsilon;
        const atanX = Maths.atan((-ry * sinPhi) / (rx * cosPhi));
        const xARoots = [Angle.simplify(atanX), Angle.simplify(atanX + Maths.PI)].filter(a => Angle.between(a, sa, ea, positive, true, true, epsilon));
        if (xARoots.length === 0) {
            return [
                new MonoSegment({
                    segment: arc,
                    isPrimary,
                    origin: arc,
                    trajectoryId: new TrajectoryId(arc.uuid)
                })
            ];
        }
        Utility.sortBy(xARoots, [
            n => {
                if (positive) {
                    if (sa > ea) return n < sa ? n + Maths.PI * 2 : n;
                    return n;
                } else {
                    if (ea > sa) return n < ea ? -(n + Maths.PI * 2) : -n;
                    return -n;
                }
            }
        ]);

        const angles = [sa, ...xARoots, ea];
        const monos = [];
        for (let i = 0, l = angles.length; i < l - 1; i++) {
            monos.push(
                new MonoSegment({
                    segment: arc.portionOf(angles[i], angles[i + 1]),
                    isPrimary,
                    origin: arc,
                    trajectoryId: new TrajectoryId(arc.uuid)
                })
            );
        }
        return monos;
    }

    private _monoQuadraticBezier(quadraticBezier: QuadraticBezier, isPrimary: boolean) {
        // handle degenerate
        const dg = quadraticBezier.degenerate(false);
        if (dg instanceof LineSegment) {
            return this._monoLineSegment(dg, isPrimary);
        }

        const epsilon = optioner.options.epsilon;
        // handle double lines
        if (quadraticBezier.isDoubleLines()) {
            const extrema = quadraticBezier
                .extrema()
                .filter(([, t]) => Maths.between(t, 0, 1, true, true, epsilon))
                .map(([p]) => p);
            const points = [quadraticBezier.point1, ...extrema, quadraticBezier.point2];
            const monos = [];
            for (let i = 0, l = points.length; i < l - 1; i++) {
                monos.push(...this._monoLineSegment(new LineSegment(points[i], points[i + 1]), isPrimary));
            }
            return monos;
        }

        const [polyX] = quadraticBezier.getPolynomial();
        const polyXD = Polynomial.standardize(Polynomial.derivative(polyX));
        const xTRoots = Polynomial.roots(polyXD).filter((t): t is number => Type.isNumber(t) && Maths.between(t, 0, 1, true, true, epsilon));
        if (xTRoots.length === 0) {
            return [
                new MonoSegment({
                    segment: quadraticBezier,
                    isPrimary,
                    origin: quadraticBezier,
                    trajectoryId: new TrajectoryId(quadraticBezier.uuid)
                })
            ];
        }
        Utility.sortBy(xTRoots, [n => n]);
        const times = [0, ...xTRoots, 1];
        const monos = [];
        for (let i = 0, l = times.length; i < l - 1; i++) {
            monos.push(
                new MonoSegment({
                    segment: quadraticBezier.portionOf(times[i], times[i + 1]),
                    isPrimary,
                    origin: quadraticBezier,
                    trajectoryId: new TrajectoryId(quadraticBezier.uuid)
                })
            );
        }
        return monos;
    }

    private _monoBezier(bezier: Bezier, isPrimary: boolean, selfIntersectionHandled = false) {
        // handle degenerate
        const ndg = bezier.degenerate(false);
        if (ndg instanceof LineSegment) {
            return this._monoLineSegment(ndg, isPrimary);
        }
        if (ndg instanceof QuadraticBezier) {
            return this._monoQuadraticBezier(ndg, isPrimary);
        }

        if (!selfIntersectionHandled) {
            const ret: MonoSegment[] = [];
            const tsi = bezier.selfIntersection();
            if (tsi.length !== 0) {
                bezier.splitAtTimes(tsi).forEach(s => ret.push(...this._monoBezier(s, isPrimary, true)));
                return ret;
            }
        }

        const { epsilon, curveEpsilon } = optioner.options;
        // handle triple lines
        if (bezier.isTripleLines()) {
            const extrema = bezier
                .extrema()
                .filter(([, t]) => Maths.between(t, 0, 1, true, true, curveEpsilon))
                .map(([p]) => p);
            const points = [bezier.point1, ...extrema, bezier.point2];
            const monos = [];
            for (let i = 0, l = points.length; i < l - 1; i++) {
                monos.push(...this._monoLineSegment(new LineSegment(points[i], points[i + 1]), isPrimary));
            }
            return monos;
        }
        // common case
        const [polyX] = bezier.getPolynomial();
        const polyXD = Polynomial.standardize(Polynomial.derivative(polyX));
        const xTRoots = Polynomial.roots(polyXD).filter((t): t is number => Type.isNumber(t) && Maths.between(t, 0, 1, true, true, epsilon));
        if (xTRoots.length === 0) {
            return [
                new MonoSegment({
                    segment: bezier,
                    isPrimary,
                    origin: bezier,
                    trajectoryId: new TrajectoryId(bezier.uuid)
                })
            ];
        }

        Utility.sortBy(xTRoots, [n => n]);
        if (Maths.equalTo(xTRoots[0], xTRoots[1], epsilon)) xTRoots.pop(); // handle multiplicity

        const times = [0, ...xTRoots, 1];
        const monos = [];
        for (let i = 0, l = times.length; i < l - 1; i++) {
            monos.push(
                new MonoSegment({
                    segment: bezier.portionOf(times[i], times[i + 1]),
                    isPrimary,
                    origin: bezier,
                    trajectoryId: new TrajectoryId(bezier.uuid)
                })
            );
        }
        return monos;
    }

    describe(ggA: GeneralGeometry, ggB?: GeneralGeometry): FillDescription {
        const monosA = this._preprocess(ggA, true);
        const sl = new SweepLine();
        sl.primaryFillRule = ggA.fillRule;
        sl.fillEvents(monosA);
        if (ggB !== undefined) {
            const monosB = this._preprocess(ggB, false);
            sl.secondaryFillRule = ggB.fillRule;
            sl.fillEvents(monosB);
        }
        const monos = sl.launch();
        return {
            fillRule: ggA.fillRule,
            segmentWithFills: monos
        };
    }
}

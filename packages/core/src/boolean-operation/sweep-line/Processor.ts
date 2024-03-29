import { Angle, Coordinates, Float, Maths, Polynomial, Type, Utility } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
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
                trajectoryId: new TrajectoryId(lineSegment)
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
        const atanX = Maths.atan((-ry * sinPhi) / (rx * cosPhi));
        const xARoots = [Angle.simplify(atanX), Angle.simplify(atanX + Maths.PI)].filter(a => Angle.between(a, sa, ea, positive, true, true, eps.angleEpsilon));
        if (xARoots.length === 0) {
            return [
                new MonoSegment({
                    segment: arc,
                    isPrimary,
                    origin: arc,
                    trajectoryId: new TrajectoryId(arc)
                })
            ];
        }

        const trajectoryId = new TrajectoryId(arc);
        // splitAtAngles will handle the multiplicity and order
        const monos = arc.splitAtAngles(xARoots).map(segment => {
            return new MonoSegment({
                segment,
                isPrimary,
                origin: arc,
                trajectoryId
            });
        });
        return monos;
    }

    private _monoQuadraticBezier(quadraticBezier: QuadraticBezier, isPrimary: boolean) {
        // handle degenerate
        const dg = quadraticBezier.degenerate(false);
        if (dg instanceof LineSegment) {
            return this._monoLineSegment(dg, isPrimary);
        }

        // handle double line
        if (quadraticBezier.isDoubleLine()) {
            const extrema = quadraticBezier
                .extrema()
                .filter(t => !Float.equalTo(t, 0, eps.timeEpsilon) && !Float.equalTo(t, 1, eps.timeEpsilon))
                .map(t => quadraticBezier.getParametricEquation()(t));
            let cs = [quadraticBezier.point1Coordinates, ...extrema, quadraticBezier.point2Coordinates];
            // Quadratic bezier sometimes goes very ugly, the control point coincides with one of the endpoints, and it is still a double line.
            // The extreme will be the coincident endpoint.
            cs = Utility.uniqWith(cs, (a, b) => Coordinates.equalTo(a, b, eps.epsilon));
            const monos = [];
            for (let i = 0, l = cs.length; i < l - 1; i++) {
                monos.push(...this._monoLineSegment(new LineSegment(cs[i], cs[i + 1]), isPrimary));
            }
            return monos;
        }

        const [polyX] = quadraticBezier.getPolynomial();
        const polyXD = Polynomial.standardize(Polynomial.derivative(polyX));
        const xTRoots = Polynomial.roots(polyXD).filter((t): t is number => Type.isNumber(t) && Float.between(t, 0, 1, true, true, eps.timeEpsilon));
        if (xTRoots.length === 0) {
            return [
                new MonoSegment({
                    segment: quadraticBezier,
                    isPrimary,
                    origin: quadraticBezier,
                    trajectoryId: new TrajectoryId(quadraticBezier)
                })
            ];
        }

        const trajectoryId = new TrajectoryId(quadraticBezier);
        // splitAtTimes will handle the multiplicity and order
        const monos = quadraticBezier.splitAtTimes(xTRoots).map(segment => {
            return new MonoSegment({
                segment,
                isPrimary,
                origin: quadraticBezier,
                trajectoryId
            });
        });
        return monos;
    }

    private _monoBezier(bezier: Bezier, isPrimary: boolean, selfIntersectionOrigin: [Bezier, TrajectoryId] | null = null) {
        // handle degenerate
        if (selfIntersectionOrigin === null) {
            const ndg = bezier.degenerate(false);
            if (ndg instanceof LineSegment) {
                return this._monoLineSegment(ndg, isPrimary);
            }
            if (ndg instanceof QuadraticBezier) {
                return this._monoQuadraticBezier(ndg, isPrimary);
            }
        }

        if (selfIntersectionOrigin === null) {
            const ret: MonoSegment[] = [];
            const tsi = bezier.selfIntersection().filter(t => Float.between(t, 0, 1, true, true, eps.timeEpsilon));
            if (tsi.length !== 0) {
                bezier.splitAtTimes(tsi).forEach(s => ret.push(...this._monoBezier(s, isPrimary, [bezier, new TrajectoryId(bezier)])));
                return ret;
            }
        }

        // handle triple line
        if (selfIntersectionOrigin === null && bezier.isTripleLine()) {
            const extrema = bezier
                .extrema()
                .filter(t => !Float.equalTo(t, 0, eps.timeEpsilon) && !Float.equalTo(t, 1, eps.timeEpsilon))
                .map(t => bezier.getParametricEquation()(t));
            let cs = [bezier.point1Coordinates, ...extrema, bezier.point2Coordinates];
            // Bezier sometimes goes very ugly, the control points coincide with one of the endpoints, and it is still a triple line.
            // The extreme will be the coincident endpoint.
            cs = Utility.uniqWith(cs, (a, b) => Coordinates.equalTo(a, b, eps.epsilon));
            const monos = [];
            for (let i = 0, l = cs.length; i < l - 1; i++) {
                monos.push(...this._monoLineSegment(new LineSegment(cs[i], cs[i + 1]), isPrimary));
            }
            return monos;
        }
        // common case
        const [polyX] = bezier.getPolynomial();
        const polyXD = Polynomial.standardize(Polynomial.derivative(polyX));
        const xTRoots = Polynomial.roots(polyXD).filter((t): t is number => Type.isNumber(t) && Float.between(t, 0, 1, true, true, eps.timeEpsilon));
        if (xTRoots.length === 0) {
            return [
                new MonoSegment({
                    segment: bezier,
                    isPrimary,
                    origin: selfIntersectionOrigin === null ? bezier : selfIntersectionOrigin[0],
                    trajectoryId: selfIntersectionOrigin === null ? new TrajectoryId(bezier) : selfIntersectionOrigin[1]
                })
            ];
        }

        const trajectoryId = selfIntersectionOrigin === null ? new TrajectoryId(bezier) : selfIntersectionOrigin[1];
        // splitAtTimes will handle the multiplicity and order
        const monos = bezier.splitAtTimes(xTRoots).map(segment => {
            return new MonoSegment({
                segment,
                isPrimary,
                origin: selfIntersectionOrigin === null ? bezier : selfIntersectionOrigin[0],
                trajectoryId
            });
        });
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

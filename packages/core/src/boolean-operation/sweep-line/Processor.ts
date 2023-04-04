import { Angle, Coordinates, Float, Maths, Polynomial, Type, Utility } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { FillDescription, GeneralGeometry } from "../../types";
import TrajectoryID from "../TrajectoryID";
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
                trajectoryID: new TrajectoryID(lineSegment.id)
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
                    trajectoryID: new TrajectoryID(arc.id)
                })
            ];
        }

        // splitAtAngles will handle the multiplicity and order
        const monos = arc.splitAtAngles(xARoots).map(segment => {
            return new MonoSegment({
                segment,
                isPrimary,
                origin: arc,
                trajectoryID: new TrajectoryID(arc.id)
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
                .filter(([, t]) => Float.between(t, 0, 1, true, true, eps.timeEpsilon))
                .map(([p]) => p);
            let points = [quadraticBezier.point1, ...extrema, quadraticBezier.point2];
            // Quadratic bezier sometimes goes very ugly, the control point coincides with one of the endpoints, and it is still a double line.
            // The extreme will be the coincident endpoint.
            points = Utility.uniqWith(points, (a, b) => Coordinates.equalTo(a.coordinates, b.coordinates, eps.epsilon));
            const monos = [];
            for (let i = 0, l = points.length; i < l - 1; i++) {
                monos.push(...this._monoLineSegment(new LineSegment(points[i], points[i + 1]), isPrimary));
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
                    trajectoryID: new TrajectoryID(quadraticBezier.id)
                })
            ];
        }

        // splitAtTimes will handle the multiplicity and order
        const monos = quadraticBezier.splitAtTimes(xTRoots).map(segment => {
            return new MonoSegment({
                segment,
                isPrimary,
                origin: quadraticBezier,
                trajectoryID: new TrajectoryID(quadraticBezier.id)
            });
        });
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
            const tsi = bezier.selfIntersection().filter(t => Float.between(t, 0, 1, true, true, eps.timeEpsilon));
            if (tsi.length !== 0) {
                bezier.splitAtTimes(tsi).forEach(s => ret.push(...this._monoBezier(s, isPrimary, true)));
                return ret;
            }
        }

        // handle triple line
        if (bezier.isTripleLine()) {
            const extrema = bezier
                .extrema()
                .filter(([, t]) => Float.between(t, 0, 1, true, true, eps.timeEpsilon))
                .map(([p]) => p);
            let points = [bezier.point1, ...extrema, bezier.point2];
            // Bezier sometimes goes very ugly, the control points coincide with one of the endpoints, and it is still a triple line.
            // The extreme will be the coincident endpoint.
            points = Utility.uniqWith(points, (a, b) => Coordinates.equalTo(a.coordinates, b.coordinates, eps.epsilon));
            const monos = [];
            for (let i = 0, l = points.length; i < l - 1; i++) {
                monos.push(...this._monoLineSegment(new LineSegment(points[i], points[i + 1]), isPrimary));
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
                    origin: bezier,
                    trajectoryID: new TrajectoryID(bezier.id)
                })
            ];
        }

        // splitAtTimes will handle the multiplicity and order
        const monos = bezier.splitAtTimes(xTRoots).map(segment => {
            return new MonoSegment({
                segment,
                isPrimary,
                origin: bezier,
                trajectoryID: new TrajectoryID(bezier.id)
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

import { Box, Coordinates, Float, Polynomial, Type } from "@geomtoy/util";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { compareImplicit } from "../../misc/compare-implicit";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineSegmentBezier from "./LineSegmentBezier";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";
import QuadraticBezierBezier from "./QuadraticBezierBezier";
import QuadraticBezierQuadraticBezier from "./QuadraticBezierQuadraticBezier";

export default class BezierBezier extends BaseIntersection {
    static override create(geometry1: Bezier, geometry2: Bezier) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Bezier && dg2 instanceof Bezier) {
            ret.intersection = new BezierBezier(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof Bezier && dg2 instanceof QuadraticBezier) {
            ret.intersection = new QuadraticBezierBezier(dg2, dg1);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            ret.inverse = true;
            return ret;
        }
        if (dg1 instanceof Bezier && dg2 instanceof LineSegment) {
            ret.intersection = new LineSegmentBezier(dg2, dg1);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            ret.inverse = true;
            return ret;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof Bezier) {
            ret.intersection = new QuadraticBezierBezier(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof QuadraticBezier) {
            ret.intersection = new QuadraticBezierQuadraticBezier(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof LineSegment) {
            ret.intersection = new LineSegmentQuadraticBezier(dg2, dg1);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            ret.inverse = true;
            return ret;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof Bezier) {
            ret.intersection = new LineSegmentBezier(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof QuadraticBezier) {
            ret.intersection = new LineSegmentQuadraticBezier(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof LineSegment) {
            ret.intersection = new LineSegmentLineSegment(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Bezier, public geometry2: Bezier, public skipForBooleanOperation = false) {
        super();
    }

    @cached
    onSameTrajectory() {
        const if1 = this.geometry1.getImplicitFunctionCoefs();
        const if2 = this.geometry2.getImplicitFunctionCoefs();
        return compareImplicit(if1, if2, eps.coefficientEpsilon);
    }

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `bezier1`
        t2: number; // time of `c` on `bezier2`
        m: number; // multiplicity
    }[] {
        if (!Box.collide(this.geometry1.getBoundingBox(), this.geometry2.getBoundingBox())) return [];
        if (this.onSameTrajectory()) return [];
        const [polyX1, polyY1] = this.geometry1.getPolynomial();
        const [polyX2, polyY2] = this.geometry2.getPolynomial();

        const [[x13, x12, x11, x10], [y13, y12, y11, y10]] = [polyX1, polyY1];
        const [[x23, x22, x21, x20], [y23, y22, y21, y20]] = [polyX2, polyY2];

        // bezout matrix in `time` of `bezier1`
        //       a              b        [c0,c1,c2,c3]
        //       d        [e0,e1,e2,e3]  [f0,f1,f2,f3]
        // [g0,g1,g2,g3]  [h0,h1,h2,h3]  [i0,i1,i2,i3]
        const a = x13 * y12 - x12 * y13;
        const b = x13 * y11 - x11 * y13;
        const c0 = x13 * y10 - x10 * y13 + x20 * y13 - x13 * y20;
        const c1 = x21 * y13 - x13 * y21;
        const c2 = x22 * y13 - x13 * y22;
        const c3 = x23 * y13 - x13 * y23;
        const d = b;
        const e0 = x13 * y10 - x10 * y13 + x20 * y13 - x13 * y20 + x12 * y11 - x11 * y12;
        const e1 = c1;
        const e2 = c2;
        const e3 = c3;
        const f0 = x12 * y10 - x10 * y12 + x20 * y12 - x12 * y20;
        const f1 = x21 * y12 - x12 * y21;
        const f2 = x22 * y12 - x12 * y22;
        const f3 = x23 * y12 - x12 * y23;
        const g0 = c0;
        const g1 = c1;
        const g2 = c2;
        const g3 = c3;
        const h0 = f0;
        const h1 = f1;
        const h2 = f2;
        const h3 = f3;
        const i0 = x11 * y10 - x10 * y11 + x20 * y11 - x11 * y20;
        const i1 = x21 * y11 - x11 * y21;
        const i2 = x22 * y11 - x11 * y22;
        const i3 = x23 * y11 - x11 * y23;

        // polynomial in `time` of `bezier2` from the determinant of bezout matrix above
        // prettier-ignore
        const tPoly = Polynomial.standardize([
            -c3 * e3 * g3,
            -c3 * e3 * g2 - c3 * e2 * g3 - c2 * e3 * g3,
            -c3 * e3 * g1 - c3 * e2 * g2 - c2 * e3 * g2 - c3 * e1 * g3 - c2 * e2 * g3 - c1 * e3 * g3,
            -c3 * e3 * g0 - c3 * e2 * g1 - c2 * e3 * g1 - c3 * e1 * g2 - c2 * e2 * g2 - c1 * e3 * g2 - c3 * e0 * g3 - c2 * e1 * g3 - c1 * e2 * g3 - c0 * e3 * g3 + b * f3 * g3 + c3 * d * h3 - a * f3 * h3 + a * e3 * i3,
            -c3 * e2 * g0 - c2 * e3 * g0 - c3 * e1 * g1 - c2 * e2 * g1 - c1 * e3 * g1 - c3 * e0 * g2 - c2 * e1 * g2 - c1 * e2 * g2 - c0 * e3 * g2 + b * f3 * g2 - c2 * e0 * g3 - c1 * e1 * g3 - c0 * e2 * g3 + b * f2 * g3 + c3 * d * h2 - a * f3 * h2 + c2 * d * h3 - a * f2 * h3 + a * e3 * i2 + a * e2 * i3,
            -c3 * e1 * g0 - c2 * e2 * g0 - c1 * e3 * g0 - c3 * e0 * g1 - c2 * e1 * g1 - c1 * e2 * g1 - c0 * e3 * g1 + b * f3 * g1 - c2 * e0 * g2 - c1 * e1 * g2 - c0 * e2 * g2 + b * f2 * g2 - c1 * e0 * g3 - c0 * e1 * g3 + b * f1 * g3 + c3 * d * h1 - a * f3 * h1 + c2 * d * h2 - a * f2 * h2 + c1 * d * h3 - a * f1 * h3 + a * e3 * i1 + a * e2 * i2 + a * e1 * i3,
            -c3 * e0 * g0 - c2 * e1 * g0 - c1 * e2 * g0 - c0 * e3 * g0 + b * f3 * g0 - c2 * e0 * g1 - c1 * e1 * g1 - c0 * e2 * g1 + b * f2 * g1 - c1 * e0 * g2 - c0 * e1 * g2 + b * f1 * g2 - c0 * e0 * g3 + b * f0 * g3 + c3 * d * h0 - a * f3 * h0 + c2 * d * h1 - a * f2 * h1 + c1 * d * h2 - a * f1 * h2 + c0 * d * h3 - a * f0 * h3 + a * e3 * i0 + a * e2 * i1 + a * e1 * i2 - b * d * i3 + a * e0 * i3,
            -c2 * e0 * g0 - c1 * e1 * g0 - c0 * e2 * g0 + b * f2 * g0 - c1 * e0 * g1 - c0 * e1 * g1 + b * f1 * g1 - c0 * e0 * g2 + b * f0 * g2 + c2 * d * h0 - a * f2 * h0 + c1 * d * h1 - a * f1 * h1 + c0 * d * h2 - a * f0 * h2 + a * e2 * i0 + a * e1 * i1 - b * d * i2 + a * e0 * i2,
            -c1 * e0 * g0 - c0 * e1 * g0 + b * f1 * g0 - c0 * e0 * g1 + b * f0 * g1 + c1 * d * h0 - a * f1 * h0 + c0 * d * h1 - a * f0 * h1 + a * e1 * i0 - b * d * i1 + a * e0 * i1,
            -c0 * e0 * g0 + b * f0 * g0 + c0 * d * h0 - a * f0 * h0 - b * d * i0 + a * e0 * i0
        ])

        const tRoots = Polynomial.roots(tPoly, eps.complexEpsilon);
        const tRootsM = Polynomial.rootsMultiplicity(tRoots.filter(Type.isNumber), eps.timeEpsilon);
        const intersection: ReturnType<typeof this.properIntersection> = [];

        let tripleLine1: boolean;
        if (!this.skipForBooleanOperation) {
            // adjust the multiplicity when bezier1 is a triple line
            tripleLine1 = this.geometry1.isTripleLine();
            if (tripleLine1) {
                tRootsM.forEach((rm, index) => {
                    if (rm.multiplicity === 9) tRootsM[index].multiplicity = 3;
                    if (rm.multiplicity === 6) tRootsM[index].multiplicity = 2;
                    if (rm.multiplicity === 3) tRootsM[index].multiplicity = 1;
                });
            }
        } else {
            tripleLine1 = false;
        }
        if (!this.skipForBooleanOperation) {
            // adjust the multiplicity when bezier1 is self-intersecting
            const tsi = this.geometry1.selfIntersectionExtend();
            if (tsi.length) {
                const csi = this.geometry1.getPointAtTimeExtend(tsi[0]).coordinates;
                tRootsM.forEach((rm, index) => {
                    const c = this.geometry2.getPointAtTimeExtend(rm.root).coordinates;
                    if (Coordinates.equalTo(csi, c, eps.epsilon)) {
                        if (rm.multiplicity === 2) {
                            // turn multiplicity = 2 (double strike)into two root multiplicity = 1
                            tRootsM[index].multiplicity = 1;
                            const newRootM = { ...tRootsM[index] };
                            tRootsM.push(newRootM);
                        }
                        if (rm.multiplicity === 3) {
                            // turn multiplicity = 3 (strike and contact)into two root multiplicity = 1 multiplicity =2
                            tRootsM[index].multiplicity = 1;
                            const newRootM = { ...tRootsM[index], multiplicity: 2 };
                            tRootsM.push(newRootM);
                        }
                    }
                });
            }
        }

        for (let i = 0, l = tRootsM.length; i < l; i++) {
            const t2 = tRootsM[i].root;
            if (Float.between(t2, 0, 1, false, false, eps.timeEpsilon)) {
                const x = Polynomial.evaluate(polyX2, t2);
                const y = Polynomial.evaluate(polyY2, t2);
                const t1s = tripleLine1 ? this.geometry1.getTimesOfPointExtend([x, y]) : [this.geometry1.getTimeOfPointExtend([x, y])];
                t1s.forEach(t1 => {
                    if (Float.between(t1, 0, 1, false, false, eps.timeEpsilon)) {
                        intersection.push({
                            c: [x, y],
                            t1,
                            t2,
                            m: tRootsM[i].multiplicity
                        });
                    }
                });
            }
        }
        return intersection;
    }

    @cached
    perspective() {
        if (!this.onSameTrajectory()) throw new Error("[G]Call `onSameTrajectory` first.");
        const { point1Coordinates: c1i, point2Coordinates: c1t } = this.geometry1;
        const { point1Coordinates: c2i, point2Coordinates: c2t } = this.geometry2;

        const ret = {} as {
            c1i: [number, number]; // initial coordinates of `bezier1`
            c1t: [number, number]; // terminal coordinates of `bezier1`
            c2i: [number, number]; // initial coordinates of `bezier2` in the perspective of `bezier1`
            c2t: [number, number]; // terminal coordinates of `bezier2` in the perspective of `bezier1`
            t2i: number; // time of `c2i` in the perspective of `bezier1`
            t2t: number; // time of `c2t` in the perspective of `bezier1`
            csi: [number, number] | undefined; // coordinates of self-intersection in the perspective of `bezier1`(may be not on `bezier1` nor `bezier2` but on underlying curve), `undefined` if there is no self-intersection
            tsi: [number, number] | never[]; // times of self-intersection in the perspective of `bezier1`, `[]` if there is no self-intersection
            d1si1: boolean; // determination of whether `bezier1` pass the first time of the self-intersection, `false` if there is no self-intersection
            d1si2: boolean; // determination of whether `bezier1` pass the second time of the self-intersection, `false` if there is no self-intersection
            d2si1: boolean; // determination of whether `bezier2` pass the first time of the self-intersection, `false` if there is no self-intersection
            d2si2: boolean; // determination of whether `bezier2` pass the second time of the self-intersection, `false` if there is no self-intersection
        };

        ret.c1i = c1i;
        ret.c1t = c1t;
        const tsi = this.geometry1.selfIntersectionExtend();
        ret.tsi = tsi;

        // no self-interaction even on underlying curve
        if (tsi.length === 0) {
            const t2i = this.geometry1.getTimeOfPointExtend(c2i);
            const t2t = this.geometry1.getTimeOfPointExtend(c2t);
            ret.csi = undefined;
            ret.c2i = t2i > t2t ? c2t : c2i;
            ret.c2t = t2i > t2t ? c2i : c2t;
            ret.t2i = t2i > t2t ? t2t : t2i;
            ret.t2t = t2i > t2t ? t2i : t2t;
            ret.d1si1 = false;
            ret.d1si2 = false;
            ret.d2si1 = false;
            ret.d2si2 = false;
            return ret;
        }
        // handle self-intersection
        ret.csi = this.geometry1.getPointAtTimeExtend(tsi[0]).coordinates;
        ret.d1si1 = Float.between(tsi[0], 0, 1, false, false, eps.timeEpsilon);
        ret.d1si2 = Float.between(tsi[1], 0, 1, false, false, eps.timeEpsilon);

        const t2is = this.geometry1.getTimesOfPointExtend(c2i);
        const t2ts = this.geometry1.getTimesOfPointExtend(c2t);

        if (t2is.length === 1 && t2ts.length === 1) {
            // c2i and c2t are not at the self-intersection point
            const t2i = t2is[0];
            const t2t = t2ts[0];
            ret.d2si1 = Float.between(tsi[0], t2i, t2t, false, false, eps.timeEpsilon);
            ret.d2si2 = Float.between(tsi[1], t2i, t2t, false, false, eps.timeEpsilon);
            ret.t2i = t2i > t2t ? t2t : t2i;
            ret.t2t = t2i > t2t ? t2i : t2t;
            ret.c2i = t2i > t2t ? c2t : c2i;
            ret.c2t = t2i > t2t ? c2i : c2t;
            return ret;
        } else if (t2is.length === 2 && t2ts.length === 1) {
            // c2i is at the self-intersection point
            const t2t = t2ts[0];
            let t2i: number;

            if (Float.lessThan(t2t, tsi[0], eps.timeEpsilon)) {
                const midT = (tsi[0] + tsi[1]) / 2;
                const midD = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT));
                if (midD) {
                    t2i = tsi[1];
                    ret.d2si1 = true;
                    ret.d2si2 = true;
                } else {
                    t2i = tsi[0];
                    ret.d2si1 = true;
                    ret.d2si2 = false;
                }
            } else if (Float.greaterThan(t2t, tsi[1], eps.timeEpsilon)) {
                const midT = (tsi[0] + tsi[1]) / 2;
                const midD = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT));
                if (midD) {
                    t2i = tsi[0];
                    ret.d2si1 = true;
                    ret.d2si2 = true;
                } else {
                    t2i = tsi[1];
                    ret.d2si1 = false;
                    ret.d2si2 = true;
                }
            } else {
                const midT = (tsi[0] + t2t) / 2;
                const midD = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT));
                if (midD) {
                    t2i = tsi[0];
                    ret.d2si1 = true;
                    ret.d2si2 = false;
                } else {
                    t2i = tsi[1];
                    ret.d2si1 = false;
                    ret.d2si2 = true;
                }
            }
            ret.t2i = t2i > t2t ? t2t : t2i;
            ret.t2t = t2i > t2t ? t2i : t2t;
            ret.c2i = t2i > t2t ? c2t : c2i;
            ret.c2t = t2i > t2t ? c2i : c2t;
            return ret;
        } else if (t2is.length === 1 && t2ts.length === 2) {
            // c2t is at the self-intersection point
            const t2i = t2is[0];
            let t2t: number;

            if (Float.lessThan(t2i, tsi[0], eps.timeEpsilon)) {
                const midT = (tsi[0] + tsi[1]) / 2;
                const midD = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT));
                if (midD) {
                    t2t = tsi[1];
                    ret.d2si1 = true;
                    ret.d2si2 = true;
                } else {
                    t2t = tsi[0];
                    ret.d2si1 = true;
                    ret.d2si2 = false;
                }
            } else if (Float.greaterThan(t2i, tsi[1], eps.timeEpsilon)) {
                const midT = (tsi[0] + tsi[1]) / 2;
                const midD = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT));
                if (midD) {
                    t2t = tsi[0];
                    ret.d2si1 = true;
                    ret.d2si2 = true;
                } else {
                    t2t = tsi[1];
                    ret.d2si1 = false;
                    ret.d2si2 = true;
                }
            } else {
                const midT = (tsi[0] + t2i) / 2;
                const midD = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT));
                if (midD) {
                    t2t = tsi[0];
                    ret.d2si1 = true;
                    ret.d2si2 = false;
                } else {
                    t2t = tsi[1];
                    ret.d2si1 = false;
                    ret.d2si2 = true;
                }
            }
            ret.t2i = t2i > t2t ? t2t : t2i;
            ret.t2t = t2i > t2t ? t2i : t2t;
            ret.c2i = t2i > t2t ? c2t : c2i;
            ret.c2t = t2i > t2t ? c2i : c2t;
            return ret;
        } else if (t2is.length === 2 && t2ts.length === 2) {
            // c2i and c2t are at the self-intersection point
            ret.d2si1 = true;
            ret.d2si2 = true;
            ret.t2i = tsi[0];
            ret.t2t = tsi[1];
            ret.c2i = c2i;
            ret.c2t = c2t;
            return ret;
        } else {
            throw new Error("[G]We should not reach here.");
        }
    }

    equal(): Trilean {
        if (!this.onSameTrajectory()) return false;
        const { t2i, t2t } = this.perspective();
        return Float.equalTo(t2i, 0, eps.timeEpsilon) && Float.equalTo(t2t, 1, eps.timeEpsilon);
    }
    separate(): Trilean {
        if (!this.onSameTrajectory()) {
            return this.properIntersection().length === 0;
        }
        const { tsi, d1si1, d1si2, d2si1, d2si2, t2i, t2t } = this.perspective();
        // handle self-intersection
        if (tsi.length && (d1si1 || d1si2) && (d2si1 || d2si2)) return false;
        return Float.greaterThan(t2i, 1, eps.timeEpsilon) || Float.lessThan(t2t, 0, eps.timeEpsilon);
    }
    intersect() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection().map(i => new Point(i.c));
        }
        const { tsi, d1si1, d1si2, d2si1, d2si2, csi } = this.perspective();
        // handle self-intersection
        if (tsi.length && (d1si1 || d1si2) && (d2si1 || d2si2)) return [new Point(csi!)];
        return [];
    }
    strike() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection()
                .filter(i => i.m % 2 == 1)
                .map(i => new Point(i.c));
        }
        // handle self-intersection
        const { tsi, d1si1, d1si2, d2si1, d2si2, csi } = this.perspective();
        if (tsi.length && (d1si1 || d1si2) && (d2si1 || d2si2)) return [new Point(csi!)];
        return [];
    }
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
        // *Memo
        // The cubic bezier curve may contact itself at cusps(if there is),
        // but it is very difficult to encounter, so we will not deal with it here.
    }
    cross() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection()
                .filter(i => i.m % 2 == 1 && Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
                .map(i => new Point(i.c));
        }
        // handle self-intersection
        const { tsi, d1si1, d1si2, d2si1, d2si2, t2i, t2t, csi } = this.perspective();
        if (tsi.length && (d1si1 || d1si2) && (d2si1 || d2si2)) {
            const notAtEnd1 = (d1si1 && Float.between(tsi[0], 0, 1, true, true, eps.timeEpsilon)) || (d1si2 && Float.between(tsi[1], 0, 1, true, true, eps.timeEpsilon));
            const notAtEnd2 = (d2si1 && Float.between(tsi[0], t2i, t2t, true, true, eps.timeEpsilon)) || (d1si2 && Float.between(tsi[1], t2i, t2t, true, true, eps.timeEpsilon));
            if (notAtEnd1 && notAtEnd2) return [new Point(csi!)];
        }
        return [];
    }
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    block() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection()
                .filter(
                    i => (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)) && !(Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon))
                )
                .map(i => new Point(i.c));
        }
        // handle self-intersection
        const { tsi, d1si1, d1si2, d2si1, d2si2, csi, t2i, t2t } = this.perspective();
        if (tsi.length) {
            if (d2si1 && !d2si2 && !d1si1 && d1si2) {
                if (
                    // prettier-ignore
                    (Float.equalTo(tsi[0], t2i, eps.timeEpsilon) || Float.equalTo(tsi[0], t2t, eps.timeEpsilon)) &&
                    !(Float.equalTo(tsi[1], 0, eps.timeEpsilon) || Float.equalTo(tsi[1], 1, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
            if (!d2si1 && d2si2 && d1si1 && !d1si2) {
                if (
                    // prettier-ignore
                    (Float.equalTo(tsi[1], t2i, eps.timeEpsilon) || Float.equalTo(tsi[1], t2t, eps.timeEpsilon)) && 
                    !(Float.equalTo(tsi[0], 0, eps.timeEpsilon) || Float.equalTo(tsi[0], 1, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
        }
        return [];
    }
    blockedBy() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection()
                .filter(
                    i => !(Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)) && (Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon))
                )
                .map(i => new Point(i.c));
        }
        // handle self-intersection
        const { tsi, d1si1, d1si2, d2si1, d2si2, csi, t2i, t2t } = this.perspective();
        if (tsi.length) {
            if (d1si1 && !d1si2 && !d2si1 && d2si2) {
                if (
                    // prettier-ignore
                    (Float.equalTo(tsi[0], 0, eps.timeEpsilon) || Float.equalTo(tsi[0], 1, eps.timeEpsilon)) &&
                    !(Float.equalTo(tsi[1], t2i, eps.timeEpsilon) || Float.equalTo(tsi[1], t2t, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
            if (!d1si1 && d1si2 && d2si1 && !d2si2) {
                if (
                    // prettier-ignore
                    (Float.equalTo(tsi[1], 0, eps.timeEpsilon) || Float.equalTo(tsi[1], 1, eps.timeEpsilon)) && 
                    !(Float.equalTo(tsi[0], t2i, eps.timeEpsilon) || Float.equalTo(tsi[0], t2t, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
        }
        return [];
    }
    connect() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection()
                .filter(
                    i => (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)) && (Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon))
                )
                .map(i => new Point(i.c));
        }
        // handle self-intersection
        const { tsi, d1si1, d1si2, d2si1, d2si2, csi, t2i, t2t } = this.perspective();
        if (tsi.length) {
            if (d1si1 && !d1si2 && !d2si1 && d2si2) {
                if (
                    // prettier-ignore
                    (Float.equalTo(tsi[0], 0, eps.timeEpsilon) || Float.equalTo(tsi[0], 1, eps.timeEpsilon)) &&
                    (Float.equalTo(tsi[1], t2i, eps.timeEpsilon) || Float.equalTo(tsi[1], t2t, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
            if (!d1si1 && d1si2 && d2si1 && !d2si2) {
                if (
                    // prettier-ignore
                    (Float.equalTo(tsi[1], 0, eps.timeEpsilon) || Float.equalTo(tsi[1], 1, eps.timeEpsilon)) && 
                    (Float.equalTo(tsi[0], t2i, eps.timeEpsilon) || Float.equalTo(tsi[0], t2t, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
        }
        return [];
    }
    coincide() {
        if (!this.onSameTrajectory()) return [];

        // It will be very complicated to tell the coincide in this situation.
        if (this.geometry1.isTripleLine()) return [];

        const { t2i, t2t, c1i, c1t } = this.perspective();
        const coincide: (Point | Bezier)[] = [];

        // coincide point
        const iet = Float.equalTo(t2i, 1, eps.timeEpsilon);
        const tei = Float.equalTo(t2t, 0, eps.timeEpsilon);
        if (iet) coincide.push(new Point(c1t));
        if (tei) coincide.push(new Point(c1i));
        if (iet || tei) return coincide;

        // coincide segment
        const ili = Float.lessThan(t2i, 0, eps.timeEpsilon);
        const ibw = Float.between(t2i, 0, 1, false, true, eps.timeEpsilon);
        const tgt = Float.greaterThan(t2t, 1, eps.timeEpsilon);
        const tbw = Float.between(t2t, 0, 1, true, false, eps.timeEpsilon);
        if (ili && tbw) coincide.push(this.geometry1.portionOf(0, t2t));
        if (tgt && ibw) coincide.push(this.geometry1.portionOf(t2i, 1));
        if (tgt && ili) coincide.push(this.geometry1.clone());
        if (ibw && tbw) coincide.push(this.geometry2.clone());
        return coincide;
    }
}

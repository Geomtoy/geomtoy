import { Box, Complex, Coordinates, Maths, Polynomial, Type } from "@geomtoy/util";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { compareImplicit } from "../../misc/compare-implicit";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineSegmentBezier from "./LineSegmentBezier";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";
import QuadraticBezierBezier from "./QuadraticBezierBezier";
import QuadraticBezierQuadraticBezier from "./QuadraticBezierQuadraticBezier";

export default class BezierBezier extends BaseIntersection {
    constructor(public geometry1: Bezier, public geometry2: Bezier) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
        if (dg1 instanceof Bezier && dg2 instanceof QuadraticBezier) {
            this.degeneration.intersection = new QuadraticBezierBezier(dg2, dg1);
            this.degeneration.inverse = true;
            return this;
        }
        if (dg1 instanceof Bezier && dg2 instanceof LineSegment) {
            this.degeneration.intersection = new LineSegmentBezier(dg2, dg1);
            this.degeneration.inverse = true;
            return this;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof Bezier) {
            this.degeneration.intersection = new QuadraticBezierBezier(dg1, dg2);
            return this;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof QuadraticBezier) {
            this.degeneration.intersection = new QuadraticBezierQuadraticBezier(dg1, dg2);
            return this;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof LineSegment) {
            this.degeneration.intersection = new LineSegmentQuadraticBezier(dg2, dg1);
            this.degeneration.inverse = true;
            return this;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof Bezier) {
            this.degeneration.intersection = new LineSegmentBezier(dg1, dg2);
            return this;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof QuadraticBezier) {
            this.degeneration.intersection = new LineSegmentQuadraticBezier(dg1, dg2);
            return this;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof LineSegment) {
            this.degeneration.intersection = new LineSegmentLineSegment(dg1, dg2);
            return this;
        }
    }

    @superPreprocess("handleDegeneration")
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

        const tRoots = Polynomial.roots(tPoly).map(r => {
            if (Complex.is(r)) {
                if (Maths.equalTo(Complex.imag(r), 0, eps.complexEpsilon)) return Complex.real(r);
                return r;
            }
            return r;
        });
        const tRootsM = Polynomial.rootsMultiplicity(tRoots.filter(Type.isNumber), eps.timeEpsilon);
        const intersection: ReturnType<typeof this.properIntersection> = [];

        // adjust the multiplicity when bezier1 is a triple line
        const tripleLine1 = this.geometry1.isTripleLine();
        if (tripleLine1) {
            tRootsM.forEach((rm, index) => {
                if (rm.multiplicity === 9) tRootsM[index].multiplicity = 3;
                if (rm.multiplicity === 6) tRootsM[index].multiplicity = 2;
                if (rm.multiplicity === 3) tRootsM[index].multiplicity = 1;
            });
        }
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

        for (let i = 0, l = tRootsM.length; i < l; i++) {
            const t2 = tRootsM[i].root;
            if (Maths.between(t2, 0, 1, false, false, eps.timeEpsilon)) {
                const x = Polynomial.evaluate(polyX2, t2);
                const y = Polynomial.evaluate(polyY2, t2);

                const t1s = tripleLine1 ? this.geometry1.getTimesOfPointExtend([x, y]) : [this.geometry1.getTimeOfPointExtend([x, y])];
                t1s.forEach(t1 => {
                    if (Maths.between(t1, 0, 1, false, false, eps.timeEpsilon)) {
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

        let t2i = this.geometry1.getTimeOfPointExtend(c2i);
        let t2t = this.geometry1.getTimeOfPointExtend(c2t);

        const tsi = this.geometry1.selfIntersectionExtend();
        const csi = tsi.length ? this.geometry1.getPointAtTimeExtend(tsi[0]).coordinates : undefined;

        // Correct `t2i` and `t2t` by according to the situation of self-intersection and `bezier2`
        if (tsi.length) {
            // Note if `t2i` or `t2t` it at the times of the self-intersection, their values are always be the smaller one which is `tsi[0]`.
            const d1 = Maths.equalTo(t2i, tsi[0], eps.timeEpsilon);
            const d2 = Maths.equalTo(t2t, tsi[0], eps.timeEpsilon);

            if ((d1 && !d2) || (!d1 && d2)) {
                let s: number = NaN;
                let r: number = NaN;
                if (d1) [s, r] = [t2i, t2t];
                if (d2) [s, r] = [t2t, t2i];

                if (Maths.between(r, tsi[0], tsi[1], false, false, eps.timeEpsilon)) {
                    const midT1 = (tsi[0] + r) / 2;
                    const midT2 = (tsi[1] + r) / 2;
                    const midD1 = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT1));
                    const midD2 = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT2));
                    if (midD1) s = tsi[0];
                    if (midD2) s = tsi[1];
                } else if (Maths.lessThan(r, tsi[0], eps.timeEpsilon)) {
                    const midT = (tsi[0] + tsi[1]) / 2;
                    const midD = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT));
                    if (midD) s = tsi[1];
                    else s = tsi[0];
                } else if (Maths.greaterThan(r, tsi[1], eps.timeEpsilon)) {
                    const midT = (tsi[0] + tsi[1]) / 2;
                    const midD = this.geometry2.isPointOn(this.geometry1.getPointAtTimeExtend(midT));
                    if (midD) s = tsi[0];
                    else s = tsi[1];
                }
                if (d1) [t2i, t2t] = [s, r];
                if (d2) [t2t, t2i] = [s, r];
            }
            if (d1 && d2) {
                t2i = tsi[0];
                t2t = tsi[1];
            }
            if (!d1 && !d2) {
                // do nothing
            }
        }

        const dt = t2i > t2t;

        return {
            c1i, // initial coordinates of `bezier1`
            c1t, // terminal coordinates of `bezier1`
            c2i: dt ? c2t : c2i, // initial coordinates of `bezier2` in the perspective of `bezier1`
            c2t: dt ? c2i : c2t, // terminal coordinates of `bezier2` in the perspective of `bezier1`
            t2i: dt ? t2t : t2i, // time of `c2i` in the perspective of `bezier1`
            t2t: dt ? t2i : t2t, // time of `c2t` in the perspective of `bezier1`
            csi, // coordinates of self-intersection in the perspective of `bezier1`(may be not on `bezier1` nor `bezier2` but on underlying curve), `undefined` if there is no self-intersection
            tsi, // times of self-intersection in the perspective of `bezier1`, `[]` if there is no self-intersection
            d1si1: tsi.length ? Maths.between(tsi[0], 0, 1, false, false, eps.timeEpsilon) : false, // determination of whether `bezier1` pass the first time of the self-intersection, `false` if there is no self-intersection
            d1si2: tsi.length ? Maths.between(tsi[1], 0, 1, false, false, eps.timeEpsilon) : false, // determination of whether `bezier1` pass the second time of the self-intersection, `false` if there is no self-intersection
            d2si1: tsi.length ? Maths.between(tsi[0], t2i, t2t, false, false, eps.timeEpsilon) : false, // determination of whether `bezier2` pass the first time of the self-intersection, `false` if there is no self-intersection
            d2si2: tsi.length ? Maths.between(tsi[1], t2i, t2t, false, false, eps.timeEpsilon) : false // determination of whether `bezier2` pass the second time of the self-intersection, `false` if there is no self-intersection
        };
    }

    @superPreprocess("handleDegeneration")
    equal(): Trilean {
        if (!this.onSameTrajectory()) return false;
        const { t2i, t2t } = this.perspective();
        return Maths.equalTo(t2i, 0, eps.timeEpsilon) && Maths.equalTo(t2t, 1, eps.timeEpsilon);
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (!this.onSameTrajectory()) {
            return this.properIntersection().length === 0;
        }
        const { tsi, d1si1, d1si2, d2si1, d2si2, t2i, t2t } = this.perspective();
        // handle self-intersection
        if (tsi.length && (d1si1 || d1si2) && (d2si1 || d2si2)) return false;
        return Maths.greaterThan(t2i, 1, eps.timeEpsilon) || Maths.lessThan(t2t, 0, eps.timeEpsilon);
    }
    @superPreprocess("handleDegeneration")
    intersect() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection().map(i => new Point(i.c));
        }
        const { tsi, d1si1, d1si2, d2si1, d2si2, csi } = this.perspective();
        // handle self-intersection
        if (tsi.length && (d1si1 || d1si2) && (d2si1 || d2si2)) return [new Point(csi!)];
        return [];
        // memo
        // The cubic bezier curve may contact itself at cusps(if there is),
        // but it is very difficult to encounter, so we will not deal with it here.
    }
    @superPreprocess("handleDegeneration")
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
    @superPreprocess("handleDegeneration")
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    cross() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection()
                .filter(i => i.m % 2 == 1 && Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
                .map(i => new Point(i.c));
        }
        // handle self-intersection
        const { tsi, d1si1, d1si2, d2si1, d2si2, t2i, t2t, csi } = this.perspective();
        if (tsi.length && (d1si1 || d1si2) && (d2si1 || d2si2)) {
            const notAtEnd1 = (d1si1 && Maths.between(tsi[0], 0, 1, true, true, eps.timeEpsilon)) || (d1si2 && Maths.between(tsi[1], 0, 1, true, true, eps.timeEpsilon));
            const notAtEnd2 = (d2si1 && Maths.between(tsi[0], t2i, t2t, true, true, eps.timeEpsilon)) || (d1si2 && Maths.between(tsi[1], t2i, t2t, true, true, eps.timeEpsilon));
            if (notAtEnd1 && notAtEnd2) return [new Point(csi!)];
        }
        return [];
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection()
                .filter(
                    i => (Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)) && !(Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon))
                )
                .map(i => new Point(i.c));
        }
        // handle self-intersection
        const { tsi, d1si1, d1si2, d2si1, d2si2, csi, t2i, t2t } = this.perspective();
        if (tsi.length) {
            if (d2si1 && !d2si2 && !d1si1 && d1si2) {
                if (
                    // prettier-ignore
                    (Maths.equalTo(tsi[0], t2i, eps.timeEpsilon) || Maths.equalTo(tsi[0], t2t, eps.timeEpsilon)) &&
                    !(Maths.equalTo(tsi[1], 0, eps.timeEpsilon) || Maths.equalTo(tsi[1], 1, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
            if (!d2si1 && d2si2 && d1si1 && !d1si2) {
                if (
                    // prettier-ignore
                    (Maths.equalTo(tsi[1], t2i, eps.timeEpsilon) || Maths.equalTo(tsi[1], t2t, eps.timeEpsilon)) && 
                    !(Maths.equalTo(tsi[0], 0, eps.timeEpsilon) || Maths.equalTo(tsi[0], 1, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
        }
        return [];
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection()
                .filter(
                    i => !(Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)) && (Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon))
                )
                .map(i => new Point(i.c));
        }
        // handle self-intersection
        const { tsi, d1si1, d1si2, d2si1, d2si2, csi, t2i, t2t } = this.perspective();
        if (tsi.length) {
            if (d1si1 && !d1si2 && !d2si1 && d2si2) {
                if (
                    // prettier-ignore
                    (Maths.equalTo(tsi[0], 0, eps.timeEpsilon) || Maths.equalTo(tsi[0], 1, eps.timeEpsilon)) &&
                    !(Maths.equalTo(tsi[1], t2i, eps.timeEpsilon) || Maths.equalTo(tsi[1], t2t, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
            if (!d1si1 && d1si2 && d2si1 && !d2si2) {
                if (
                    // prettier-ignore
                    (Maths.equalTo(tsi[1], 0, eps.timeEpsilon) || Maths.equalTo(tsi[1], 1, eps.timeEpsilon)) && 
                    !(Maths.equalTo(tsi[0], t2i, eps.timeEpsilon) || Maths.equalTo(tsi[0], t2t, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
        }
        return [];
    }
    @superPreprocess("handleDegeneration")
    connect() {
        if (!this.onSameTrajectory()) {
            return this.properIntersection()
                .filter(
                    i => (Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)) && (Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon))
                )
                .map(i => new Point(i.c));
        }
        // handle self-intersection
        const { tsi, d1si1, d1si2, d2si1, d2si2, csi, t2i, t2t } = this.perspective();
        if (tsi.length) {
            if (d1si1 && !d1si2 && !d2si1 && d2si2) {
                if (
                    // prettier-ignore
                    (Maths.equalTo(tsi[0], 0, eps.timeEpsilon) || Maths.equalTo(tsi[0], 1, eps.timeEpsilon)) &&
                    (Maths.equalTo(tsi[1], t2i, eps.timeEpsilon) || Maths.equalTo(tsi[1], t2t, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
            if (!d1si1 && d1si2 && d2si1 && !d2si2) {
                if (
                    // prettier-ignore
                    (Maths.equalTo(tsi[1], 0, eps.timeEpsilon) || Maths.equalTo(tsi[1], 1, eps.timeEpsilon)) && 
                    (Maths.equalTo(tsi[0], t2i, eps.timeEpsilon) || Maths.equalTo(tsi[0], t2t, eps.timeEpsilon))
                ) {
                    return [new Point(csi!)];
                }
            }
        }
        return [];
    }
    @superPreprocess("handleDegeneration")
    coincide(): (Bezier | QuadraticBezier | LineSegment | Point)[] {
        if (!this.onSameTrajectory()) return [];

        // It will be very complicated to tell the coincide in this situation.
        if (this.geometry1.isTripleLine()) return [];

        const { t2i, t2t, c1i, c1t } = this.perspective();
        const coincide: (Point | Bezier)[] = [];

        // coincide point
        const iet = Maths.equalTo(t2i, 1, eps.timeEpsilon);
        const tei = Maths.equalTo(t2t, 0, eps.timeEpsilon);
        if (iet) coincide.push(new Point(c1t));
        if (tei) coincide.push(new Point(c1i));
        if (iet || tei) return coincide;

        // coincide segment
        const ili = Maths.lessThan(t2i, 0, eps.timeEpsilon);
        const ibw = Maths.between(t2i, 0, 1, false, true, eps.timeEpsilon);
        const tgt = Maths.greaterThan(t2t, 1, eps.timeEpsilon);
        const tbw = Maths.between(t2t, 0, 1, true, false, eps.timeEpsilon);
        if (ili && tbw) coincide.push(this.geometry1.portionOf(0, t2t));
        if (tgt && ibw) coincide.push(this.geometry1.portionOf(t2i, 1));
        if (tgt && ili) coincide.push(this.geometry1.clone());
        if (ibw && tbw) coincide.push(this.geometry2.clone());
        return coincide;
    }
}

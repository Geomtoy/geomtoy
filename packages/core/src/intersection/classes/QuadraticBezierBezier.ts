import { Box, Complex, Coordinates, Maths, Polynomial, Type } from "@geomtoy/util";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import BaseIntersection from "../BaseIntersection";
import LineSegmentBezier from "./LineSegmentBezier";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";
import QuadraticBezierQuadraticBezier from "./QuadraticBezierQuadraticBezier";

export default class QuadraticBezierBezier extends BaseIntersection {
    constructor(public geometry1: QuadraticBezier, public geometry2: Bezier) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.intersection = null;
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
    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `quadraticBezier`
        t2: number; // time of `c` on `bezier`
        m: number; // multiplicity
    }[] {
        if (!Box.collide(this.geometry1.getBoundingBox(), this.geometry2.getBoundingBox())) return [];
        const [polyX1, polyY1] = this.geometry1.getPolynomial();
        const [polyX2, polyY2] = this.geometry2.getPolynomial();

        const [[x12, x11, x10], [y12, y11, y10]] = [polyX1, polyY1];
        const [[x23, x22, x21, x20], [y23, y22, y21, y20]] = [polyX2, polyY2];

        // bezout matrix in `time` of `bezier`
        //      a           b      [c0,c1,c2]
        //      d      [e0,e1,e2]  [f0,f1,f2]
        // [g0,g1,g2]  [h0,h1,h2]  [i0,i1,i2]
        const a = x23 * y22 - x22 * y23;
        const b = x23 * y21 - x21 * y23;
        const c0 = x10 * y23 - x23 * y10 + x23 * y20 - x20 * y23;
        const c1 = x11 * y23 - x23 * y11;
        const c2 = x12 * y23 - x23 * y12;
        const d = b;
        const e0 = x10 * y23 - x23 * y10 + x23 * y20 - x20 * y23 + x22 * y21 - x21 * y22;
        const e1 = c1;
        const e2 = c2;
        const f0 = x22 * y20 - x20 * y22 + x10 * y22 - x22 * y10;
        const f1 = x11 * y22 - x22 * y11;
        const f2 = x12 * y22 - x22 * y12;
        const g0 = c0;
        const g1 = c1;
        const g2 = c2;
        const h0 = f0;
        const h1 = f1;
        const h2 = f2;
        const i0 = x10 * y21 - x21 * y10 + x21 * y20 - x20 * y21;
        const i1 = x11 * y21 - x21 * y11;
        const i2 = x12 * y21 - x21 * y12;

        // polynomial in `time` of `quadraticBezier` from the determinant of bezout matrix above
        // prettier-ignore
        const tPoly = Polynomial.standardize([
            -c2 * e2 * g2,
            -c2 * e2 * g1 - c2 * e1 * g2 - c1 * e2 * g2,
            -c2 * e2 * g0 - c2 * e1 * g1 - c1 * e2 * g1 - c2 * e0 * g2 - c1 * e1 * g2 - c0 * e2 * g2 + b * f2 * g2 + c2 * d * h2 - a * f2 * h2 + a * e2 * i2,
            -c2 * e1 * g0 - c1 * e2 * g0 - c2 * e0 * g1 - c1 * e1 * g1 - c0 * e2 * g1 + b * f2 * g1 - c1 * e0 * g2 - c0 * e1 * g2 + b * f1 * g2 + c2 * d * h1 - a * f2 * h1 + c1 * d * h2 - a * f1 * h2 + a * e2 * i1 + a * e1 * i2,
            -c2 * e0 * g0 - c1 * e1 * g0 - c0 * e2 * g0 + b * f2 * g0 - c1 * e0 * g1 - c0 * e1 * g1 + b * f1 * g1 - c0 * e0 * g2 + b * f0 * g2 + c2 * d * h0 - a * f2 * h0 + c1 * d * h1 - a * f1 * h1 + c0 * d * h2 - a * f0 * h2 + a * e2 * i0 + a * e1 * i1 - b * d * i2 + a * e0 * i2,
            -c1 * e0 * g0 - c0 * e1 * g0 + b * f1 * g0 - c0 * e0 * g1 + b * f0 * g1 + c1 * d * h0 - a * f1 * h0 + c0 * d * h1 - a * f0 * h1 + a * e1 * i0 - b * d * i1 + a * e0 * i1,
            -c0 * e0 * g0 + b * f0 * g0 + c0 * d * h0 - a * f0 * h0 - b * d * i0 + a * e0 * i0
        ]);

        const tRoots = Polynomial.roots(tPoly).map(r => {
            if (Complex.is(r)) {
                if (Maths.equalTo(Complex.imag(r), 0, eps.complexEpsilon)) return Complex.real(r);
                return r;
            }
            return r;
        });
        const tRootsM = Polynomial.rootsMultiplicity(tRoots.filter(Type.isNumber), eps.timeEpsilon);
        const intersection: ReturnType<typeof this.properIntersection> = [];

        // adjust the multiplicity when bezier is a triple line
        const tripleLine2 = this.geometry2.isTripleLine();
        if (tripleLine2) {
            tRootsM.forEach((rm, index) => {
                if (rm.multiplicity === 9) tRootsM[index].multiplicity = 3;
                if (rm.multiplicity === 6) tRootsM[index].multiplicity = 2;
                if (rm.multiplicity === 3) tRootsM[index].multiplicity = 1;
            });
        }
        // adjust the multiplicity when bezier is self-intersecting
        const tsi = this.geometry2.selfIntersectionExtend();
        if (tsi.length) {
            const csi = this.geometry2.getPointAtTimeExtend(tsi[0]).coordinates;
            tRootsM.forEach((rm, index) => {
                const c = this.geometry1.getPointAtTimeExtend(rm.root).coordinates;
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
            const t1 = tRootsM[i].root;
            if (Maths.between(t1, 0, 1, false, false, eps.timeEpsilon)) {
                const x = Polynomial.evaluate(polyX1, t1);
                const y = Polynomial.evaluate(polyY1, t1);

                const t2s = tripleLine2 ? this.geometry2.getTimesOfPointExtend([x, y]) : [this.geometry2.getTimeOfPointExtend([x, y])];
                t2s.forEach(t2 => {
                    if (Maths.between(t2, 0, 1, false, false, eps.timeEpsilon)) {
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

    @superPreprocess("handleDegeneration")
    equal() {
        return false;
    }
    @superPreprocess("handleDegeneration")
    separate() {
        return this.properIntersection().length === 0;
    }
    @superPreprocess("handleDegeneration")
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    cross() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1 && Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        return this.properIntersection()
            .filter(i => (Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)) && !(Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        return this.properIntersection()
            .filter(i => (Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon)) && !(Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        return this.properIntersection()
            .filter(i => (Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon)) && (Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        return [];
    }
}

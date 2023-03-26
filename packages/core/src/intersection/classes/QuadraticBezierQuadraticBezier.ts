import { Box, Complex, Maths, Polynomial, Type } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { compareImplicit } from "../../misc/compare-implicit";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";

export default class QuadraticBezierQuadraticBezier extends BaseIntersection {
    constructor(public geometry1: QuadraticBezier, public geometry2: QuadraticBezier) {
        super();

        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof LineSegment) {
            this.degeneration.intersection = new LineSegmentQuadraticBezier(dg2, dg1);
            this.degeneration.inverse = true;
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
    onSameTrajectory() {
        const if1 = this.geometry1.getImplicitFunctionCoefs();
        const if2 = this.geometry2.getImplicitFunctionCoefs();
        return compareImplicit(if1, if2, eps.coefficientEpsilon);
    }

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // t1: time of `c` on `quadraticBezier1`
        t2: number; // time of `c` on `quadraticBezier2`
        m: number; // multiplicity
    }[] {
        if (!Box.collide(this.geometry1.getBoundingBox(), this.geometry2.getBoundingBox())) return [];
        if (this.onSameTrajectory()) return [];
        const [polyX1, polyY1] = this.geometry1.getPolynomial();
        const [polyX2, polyY2] = this.geometry2.getPolynomial();

        const [[x12, x11, x10], [y12, y11, y10]] = [polyX1, polyY1];
        const [[x22, x21, x20], [y22, y21, y20]] = [polyX2, polyY2];

        // bezout matrix in `time` of `quadraticBezier1`
        //      a      [b0,b1,b2]
        // [c0,c1,c2]  [d0,d1,d2]
        const a = x12 * y11 - x11 * y12;
        const b0 = x12 * y10 - x10 * y12 + x20 * y12 - x12 * y20;
        const b1 = x21 * y12 - x12 * y21;
        const b2 = x22 * y12 - x12 * y22;
        const c0 = b0;
        const c1 = b1;
        const c2 = b2;
        const d0 = x11 * y10 - x10 * y11 + x20 * y11 - x11 * y20;
        const d1 = x21 * y11 - x11 * y21;
        const d2 = x22 * y11 - x11 * y22;

        // const a = Vector2.cross(v12, v11);
        // const b0 = Vector2.cross(v12, v10) + Vector2.cross(v20, v12);
        // const b1 = Vector2.cross(v21, v12);
        // const b2 = Vector2.cross(v22, v12);
        // const c0 = Vector2.cross(v12, v10) + Vector2.cross(v20, v12);
        // const c1 = Vector2.cross(v21, v12);
        // const c2 = Vector2.cross(v22, v12);
        // const d0 = Vector2.cross(v11, v10) + Vector2.cross(v20, v11);
        // const d1 = Vector2.cross(v21, v11);
        // const d2 = Vector2.cross(v22, v11);

        // polynomial in `time` of `quadraticBezier2` from the determinant of bezout matrix above
        // prettier-ignore
        let tPoly = Polynomial.standardize([
            -b2 * c2, 
            -b2 * c1 - b1 * c2, 
            -b2 * c0 - b1 * c1 - b0 * c2 + a * d2, 
            -b1 * c0 - b0 * c1 + a * d1, 
            -b0 * c0 + a * d0
        ]);

        // Quadratic bezier may degenerate.
        // tPoly = Polynomial.monic(Polynomial.standardize(tPoly));
        const tRoots = Polynomial.roots(tPoly).map(r => {
            if (Complex.is(r)) {
                if (Maths.equalTo(Complex.imag(r), 0, eps.complexEpsilon)) return Complex.real(r);
                return r;
            }
            return r;
        });
        const tRootsM = Polynomial.rootsMultiplicity(tRoots.filter(Type.isNumber), eps.timeEpsilon);
        const intersection: ReturnType<typeof this.properIntersection> = [];

        // adjust the multiplicity when quadraticBezier1 is a double line
        const doubleLine1 = this.geometry1.isDoubleLine();
        if (doubleLine1) {
            tRootsM.forEach((rm, index) => {
                if (rm.multiplicity === 6) tRootsM[index].multiplicity = 3;
                if (rm.multiplicity === 4) tRootsM[index].multiplicity = 2;
                if (rm.multiplicity === 2) tRootsM[index].multiplicity = 1;
            });
        }

        for (let i = 0, l = tRootsM.length; i < l; i++) {
            const t2 = tRootsM[i].root;
            if (Maths.between(t2, 0, 1, false, false, eps.timeEpsilon)) {
                const x = Polynomial.evaluate(polyX2, t2);
                const y = Polynomial.evaluate(polyY2, t2);
                const t1 = this.geometry1.getTimeOfPoint([x, y]);
                if (!Number.isNaN(t1)) {
                    intersection.push({
                        c: [x, y],
                        t1,
                        t2,
                        m: tRootsM[i].multiplicity
                    });
                }
            }
        }
        return intersection;
    }
    @cached
    perspective(): {
        c1i: [number, number]; // initial coordinates of `quadraticBezier1`
        c1t: [number, number]; // terminal coordinates of `quadraticBezier1`
        c2i: [number, number]; // initial coordinates of `quadraticBezier2` in the view of `quadraticBezier1`
        c2t: [number, number]; // terminal coordinates of `quadraticBezier2` in the view of `quadraticBezier1`
        t2i: number; // time of `c2i` in the view of `quadraticBezier1`
        t2t: number; // time of `c2t` in the view of `quadraticBezier1`
    } {
        if (!this.onSameTrajectory()) throw new Error("[G]Please call `onSameTrajectory` first.");
        const { point1Coordinates: c1i, point2Coordinates: c1t } = this.geometry1;
        const { point1Coordinates: c2i, point2Coordinates: c2t } = this.geometry2;

        const t2i = this.geometry1.getTimeOfPointExtend(c2i);
        const t2t = this.geometry1.getTimeOfPointExtend(c2t);

        const dt = t2i > t2t;
        return {
            c1i,
            c1t,
            c2i: dt ? c2t : c2i,
            c2t: dt ? c2i : c2t,
            t2i: dt ? t2t : t2i,
            t2t: dt ? t2i : t2t
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
        const { t2i, t2t } = this.perspective();
        return Maths.greaterThan(t2i, 1, eps.timeEpsilon) || Maths.lessThan(t2t, 0, eps.timeEpsilon);
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
        if (!this.onSameTrajectory()) return [];
        const { t2i, t2t, c1i, c1t } = this.perspective();
        const coincide: (Point | QuadraticBezier)[] = [];

        // coincide point
        const iet = Maths.equalTo(t2i, 1, eps.timeEpsilon);
        const tei = Maths.equalTo(t2t, 0, eps.timeEpsilon);
        if (iet) coincide.push(new Point(c1t));
        if (tei) coincide.push(new Point(c1i));
        if (iet || tei) return coincide;

        const ili = Maths.lessThan(t2i, 0, eps.timeEpsilon);
        const ibw = Maths.between(t2i, 0, 1, false, true, eps.timeEpsilon);
        const tgt = Maths.greaterThan(t2t, 1, eps.timeEpsilon);
        const tbw = Maths.between(t2t, 0, 1, true, false, eps.timeEpsilon);
        // overlap
        if (ili && tbw) coincide.push(this.geometry1.portionOf(0, t2t));
        // overlap
        if (tgt && ibw) coincide.push(this.geometry1.portionOf(t2i, 1));
        // containedBy
        if (tgt && ili) coincide.push(this.geometry1.clone());
        // contain or equal
        if (ibw && tbw) coincide.push(this.geometry2.clone());
        return coincide;
    }
}

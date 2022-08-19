import { Box, Complex, Maths, Polynomial, Type } from "@geomtoy/util";
import BaseRelationship from "../BaseRelationship";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import Point from "../../geometries/basic/Point";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";
import LineSegment from "../../geometries/basic/LineSegment";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import { compareImplicit } from "../../misc/compare-implicit";
import { optioner } from "../../geomtoy";

export default class QuadraticBezierQuadraticBezier extends BaseRelationship {
    constructor(public geometry1: QuadraticBezier, public geometry2: QuadraticBezier) {
        super();

        const dg1 = geometry1.dimensionallyDegenerate();
        const dg2 = geometry2.dimensionallyDegenerate();
        if (dg1 || dg2) {
            this.degeneration.relationship = null;
            return this;
        }
        const ndg1 = geometry1.nonDimensionallyDegenerate();
        const ndg2 = geometry2.nonDimensionallyDegenerate();
        if (ndg1 instanceof QuadraticBezier && ndg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentQuadraticBezier(ndg2, ndg1);
            this.degeneration.inverse = true;
            return this;
        }
        if (ndg1 instanceof LineSegment && ndg2 instanceof QuadraticBezier) {
            this.degeneration.relationship = new LineSegmentQuadraticBezier(ndg1, ndg2);
            return this;
        }
        if (ndg1 instanceof LineSegment && ndg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentLineSegment(ndg1, ndg2);
            return this;
        }
    }

    @cached
    onSameTrajectory() {
        const curveEpsilon = optioner.options.curveEpsilon;
        const if1 = this.geometry1.getImplicitFunctionCoefs();
        const if2 = this.geometry2.getImplicitFunctionCoefs();
        return compareImplicit(if1, if2, curveEpsilon);
    }

    @cached
    intersection(): {
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
        const curveEpsilon = optioner.options.curveEpsilon;
        const epsilon = optioner.options.epsilon;
        const tRoots = Polynomial.roots(tPoly).map(r => {
            if (Complex.is(r)) {
                if (Maths.equalTo(Complex.imag(r), 0, curveEpsilon)) return Complex.real(r);
                return r;
            }
            return r;
        });
        const tRootsM = Polynomial.rootsMultiplicity(tRoots.filter(Type.isNumber), curveEpsilon);
        const intersection: ReturnType<typeof this.intersection> = [];

        // adjust the multiplicity when quadraticBezier1 is double lines
        const doubleLines1 = this.geometry1.isDoubleLines();
        if (doubleLines1) {
            tRootsM.forEach((rm, index) => {
                if (rm.multiplicity === 6) tRootsM[index].multiplicity = 3;
                if (rm.multiplicity === 4) tRootsM[index].multiplicity = 2;
                if (rm.multiplicity === 2) tRootsM[index].multiplicity = 1;
            });
        }

        for (let i = 0, l = tRootsM.length; i < l; i++) {
            const t2 = tRootsM[i].root;
            if (Maths.between(t2, 0, 1, false, false, epsilon)) {
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
        const epsilon = optioner.options.epsilon;
        const { t2i, t2t } = this.perspective();
        return Maths.equalTo(t2i, 0, epsilon) && Maths.equalTo(t2t, 1, epsilon);
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (!this.onSameTrajectory()) {
            return this.intersection().length === 0;
        }
        const { t2i, t2t } = this.perspective();
        const epsilon = optioner.options.epsilon;
        return Maths.greaterThan(t2i, 1, epsilon) || Maths.lessThan(t2t, 0, epsilon);
    }

    // no contain
    // no containedBy

    @superPreprocess("handleDegeneration")
    intersect() {
        return this.intersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.intersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return this.intersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    cross() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && Maths.between(i.t1, 0, 1, true, true, epsilon) && Maths.between(i.t2, 0, 1, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t1, 0, 1, true, true, epsilon) && Maths.between(i.t2, 0, 1, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)) && !(Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)) && !(Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)) && (Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)))
            .map(i => new Point(i.c));
    }

    @superPreprocess("handleDegeneration")
    coincide() {
        if (!this.onSameTrajectory()) return [];
        const { t2i, t2t, c1i, c1t } = this.perspective();
        const epsilon = optioner.options.epsilon;
        const coincide: (Point | QuadraticBezier)[] = [];

        // coincide point
        const iet = Maths.equalTo(t2i, 1, epsilon);
        const tei = Maths.equalTo(t2t, 0, epsilon);
        if (iet) coincide.push(new Point(c1t));
        if (tei) coincide.push(new Point(c1i));
        if (iet || tei) return coincide;

        const ili = Maths.lessThan(t2i, 0, epsilon);
        const ibw = Maths.between(t2i, 0, 1, false, true, epsilon);
        const tgt = Maths.greaterThan(t2t, 1, epsilon);
        const tbw = Maths.between(t2t, 0, 1, true, false, epsilon);
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
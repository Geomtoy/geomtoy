import { Float, Polynomial, Type } from "@geomtoy/util";
import Bezier from "../../geometries/basic/Bezier";
import Line from "../../geometries/basic/Line";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineLineSegment from "./LineLineSegment";
import LineQuadraticBezier from "./LineQuadraticBezier";

export default class LineBezier extends BaseIntersection {
    static override create(geometry1: Line, geometry2: Bezier) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Line && dg2 instanceof Bezier) {
            ret.intersection = new LineBezier(dg1, dg2);
            return ret;
        }
        if (dg1 instanceof Line && dg2 instanceof QuadraticBezier) {
            ret.intersection = new LineQuadraticBezier(dg1, dg2);
            return ret;
        }
        if (dg1 instanceof Line && dg2 instanceof LineSegment) {
            ret.intersection = new LineLineSegment(dg1, dg2);
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Line, public geometry2: Bezier) {
        super();
    }

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t2: number; // time of `c` on `bezier`
        m: number; // multiplicity
    }[] {
        const [a, b, c] = this.geometry1.getImplicitFunctionCoefs();
        const [polyX, polyY] = this.geometry2.getPolynomial();
        const poly = Polynomial.add(Polynomial.add(Polynomial.scalarMultiply(polyX, a), Polynomial.scalarMultiply(polyY, b)), [c]);
        const tRoots = Polynomial.roots(poly).filter(Type.isNumber);

        const tRootsM = Polynomial.rootsMultiplicity(tRoots, eps.timeEpsilon);

        const intersection: ReturnType<typeof this.properIntersection> = [];
        for (let i = 0, l = tRootsM.length; i < l; i++) {
            const t2 = tRootsM[i].root;
            if (Float.between(t2, 0, 1, false, false, eps.timeEpsilon)) {
                const x = Polynomial.evaluate(polyX, t2);
                const y = Polynomial.evaluate(polyY, t2);
                intersection.push({ c: [x, y], t2, m: tRootsM[i].multiplicity });
            }
        }
        return intersection;
    }

    equal(): Trilean {
        return false;
    }
    separate(): Trilean {
        return this.properIntersection().length === 0;
    }
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    strike() {
        return this.properIntersection()
            .filter(i => i.m % 2 == 1)
            .map(i => new Point(i.c));
    }
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 == 0)
            .map(i => new Point(i.c));
    }
    cross() {
        return this.properIntersection()
            .filter(i => i.m % 2 == 1 && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 == 0 && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    block() {
        return this.properIntersection()
            .filter(i => Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    blockedBy() {
        return [];
    }
    connect() {
        return [];
    }
    coincide() {
        return [];
    }
}

import { Float, Polynomial, Type } from "@geomtoy/util";
import Line from "../../geometries/basic/Line";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineLineSegment from "./LineLineSegment";

export default class LineQuadraticBezier extends BaseIntersection {
    constructor(public geometry1: Line, public geometry2: QuadraticBezier) {
        super();
        const dg2 = this.geometry2.degenerate(false);
        if (dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
        if (dg2 instanceof LineSegment) {
            this.degeneration.intersection = new LineLineSegment(geometry1, dg2);
            return this;
        }
    }

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t2: number; // time of `c` on `quadraticBezier`
        m: number; // multiplicity
    }[] {
        const [a, b, c] = this.geometry1.getImplicitFunctionCoefs();
        const [polyX, polyY] = this.geometry2.getPolynomial();
        const tPoly = Polynomial.add(Polynomial.add(Polynomial.scalarMultiply(polyX, a), Polynomial.scalarMultiply(polyY, b)), [c]);
        const tRoots = Polynomial.roots(tPoly).filter(Type.isNumber);
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

    @superPreprocess("handleDegeneration")
    equal(): Trilean {
        return false;
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
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
            .filter(i => i.m % 2 === 1 && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        return this.properIntersection()
            .filter(i => Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    connect() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        return [];
    }
}

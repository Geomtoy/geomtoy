import { Maths, Polynomial, Type } from "@geomtoy/util";
import Line from "../../geometries/basic/Line";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { optioner } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineLineSegment from "./LineLineSegment";

export default class LineQuadraticBezier extends BaseRelationship {
    constructor(public geometry1: Line, public geometry2: QuadraticBezier) {
        super();
        const dg2 = this.geometry2.dimensionallyDegenerate();
        if (dg2) {
            this.degeneration.relationship = null;
        }
        const ndg2 = this.geometry2.nonDimensionallyDegenerate();

        if (ndg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineLineSegment(geometry1, ndg2);
            return this;
        }
    }

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t2: number; // time of `c` on `quadraticBezier`
        m: number; // multiplicity
    }[] {
        const [a, b, c] = this.geometry1.getImplicitFunctionCoefs();
        const [polyX, polyY] = this.geometry2.getPolynomial();
        const tPoly = Polynomial.add(Polynomial.add(Polynomial.scalarMultiply(polyX, a), Polynomial.scalarMultiply(polyY, b)), [c]);
        const tRoots = Polynomial.roots(tPoly).filter(Type.isNumber);
        const curveEpsilon = optioner.options.curveEpsilon;
        const epsilon = optioner.options.epsilon;
        const tRootsM = Polynomial.rootsMultiplicity(tRoots, curveEpsilon);

        const intersection: ReturnType<typeof this.intersection> = [];
        for (let i = 0, l = tRootsM.length; i < l; i++) {
            const t2 = tRootsM[i].root;
            if (Maths.between(t2, 0, 1, false, false, epsilon)) {
                const x = Polynomial.evaluate(polyX, t2);
                const y = Polynomial.evaluate(polyY, t2);
                intersection.push({ c: [x, y], t2, m: tRootsM[i].multiplicity });
            }
        }
        return intersection;
    }

    // no equal
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        return this.intersection().length === 0;
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
            .filter(i => i.m % 2 === 1 && Maths.between(i.t2, 0, 1, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t2, 0, 1, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon))
            .map(i => new Point(i.c));
    }
    // no blockedBy
    // no connect
    // no coincide
}

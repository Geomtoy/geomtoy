import { Maths } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineQuadraticBezier from "./LineQuadraticBezier";
import LineSegmentLineSegment from "./LineSegmentLineSegment";

export default class LineSegmentQuadraticBezier extends BaseRelationship {
    constructor(public geometry1: LineSegment, public geometry2: QuadraticBezier) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }
        if (dg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentLineSegment(geometry1, dg2);
        }
        this.supRelationship = new LineQuadraticBezier(geometry1.toLine(), geometry2);
    }

    supRelationship?: LineQuadraticBezier;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment`
        t2: number; // time of `c` on `quadraticBezier`
        m: number; // multiplicity
    }[] {
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection
            .map(i => {
                return { ...i, t1: this.geometry1.getTimeOfPointExtend(i.c) };
            })
            .filter(i => Maths.between(i.t1, 0, 1, false, false, eps.timeEpsilon));
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
        return this.intersection()
            .filter(i => i.m % 2 === 1 && Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)) && !(Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        return this.intersection()
            .filter(i => Maths.equalTo(i.t1, 0, eps.timeEpsilon) || (Maths.equalTo(i.t1, 1, eps.timeEpsilon) && !(Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon))))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        return this.intersection()
            .filter(i => Maths.equalTo(i.t1, 0, eps.timeEpsilon) || (Maths.equalTo(i.t1, 1, eps.timeEpsilon) && (Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon))))
            .map(i => new Point(i.c));
    }
    // no coincide
}

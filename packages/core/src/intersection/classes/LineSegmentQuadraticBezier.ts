import { Float } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineQuadraticBezier from "./LineQuadraticBezier";
import LineSegmentLineSegment from "./LineSegmentLineSegment";

export default class LineSegmentQuadraticBezier extends BaseIntersection {
    constructor(public geometry1: LineSegment, public geometry2: QuadraticBezier) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
        if (dg2 instanceof LineSegment) {
            this.degeneration.intersection = new LineSegmentLineSegment(geometry1, dg2);
        }
        this.supIntersection = new LineQuadraticBezier(geometry1.toLine(), geometry2);
    }

    supIntersection?: LineQuadraticBezier;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment`
        t2: number; // time of `c` on `quadraticBezier`
        m: number; // multiplicity
    }[] {
        const intersection = this.supIntersection?.properIntersection() ?? [];
        return intersection
            .map(i => {
                return { ...i, t1: this.geometry1.getTimeOfPointExtend(i.c) };
            })
            .filter(i => Float.between(i.t1, 0, 1, false, false, eps.timeEpsilon));
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
            .filter(i => i.m % 2 === 1 && Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        return this.properIntersection()
            .filter(i => (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)) && !(Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        return this.properIntersection()
            .filter(i => Float.equalTo(i.t1, 0, eps.timeEpsilon) || (Float.equalTo(i.t1, 1, eps.timeEpsilon) && !(Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon))))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        return this.properIntersection()
            .filter(i => Float.equalTo(i.t1, 0, eps.timeEpsilon) || (Float.equalTo(i.t1, 1, eps.timeEpsilon) && (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon))))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        return [];
    }
}
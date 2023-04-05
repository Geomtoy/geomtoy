import { Float, Vector2 } from "@geomtoy/util";
import type Line from "../../geometries/basic/Line";
import type LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { type Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class LineLineSegment extends BaseIntersection {
    constructor(public geometry1: Line, public geometry2: LineSegment) {
        super();
        const dg2 = geometry2.degenerate(false);
        if (dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
    }

    @cached
    onSameTrajectory() {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = this.geometry2;
        const [a, b, c] = this.geometry1.getImplicitFunctionCoefs();
        const d1 = a * x1 + b * y1 + c;
        const d2 = a * x2 + b * y2 + c;
        return Float.equalTo(d1, 0, eps.epsilon) && Float.equalTo(d2, 0, eps.epsilon);
    }

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t2: number; // time of `c` on `lineSegment`
    }[] {
        // if (this.onSameTrajectory()) return []; // do not need, see parallel determination below
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = this.geometry2;
        const [a, b, c] = this.geometry1.getImplicitFunctionCoefs();
        const d1 = a * x1 + b * y1 + c;
        const d2 = a * x2 + b * y2 + c;
        const s1 = Float.sign(d1, eps.epsilon);
        const s2 = Float.sign(d2, eps.epsilon);

        if (Float.equalTo(d1 - d2, 0, eps.epsilon)) return []; // parallel
        const intersection = [];
        /*
        If `line` is crossing `lineSegment`, the signed distance of endpoints of `lineSegment` between `line` have different sign,
        or only one of them is zero.
         */
        if ((s1 === 0) !== (s2 === 0) || s1 * s2 === -1) {
            const t = d1 / (d1 - d2);
            intersection.push({ c: Vector2.lerp([x1, y1], [x2, y2], t), t2: t });
        }
        return intersection;
    }

    @superPreprocess("handleDegeneration")
    equal(): Trilean {
        return false;
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (this.onSameTrajectory()) return false;
        return this.properIntersection().length === 0;
    }
    @superPreprocess("handleDegeneration")
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    cross() {
        return this.properIntersection()
            .filter(i => !Float.equalTo(i.t2, 0, eps.timeEpsilon) && !Float.equalTo(i.t2, 1, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return [];
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
        if (this.onSameTrajectory()) return [this.geometry2.clone()];
        return [];
    }
}

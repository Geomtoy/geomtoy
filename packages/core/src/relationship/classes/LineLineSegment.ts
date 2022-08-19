import { Maths, Vector2 } from "@geomtoy/util";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { cached } from "../../misc/decor-cache";
import BaseRelationship from "../BaseRelationship";
import Point from "../../geometries/basic/Point";
import type Line from "../../geometries/basic/Line";
import type LineSegment from "../../geometries/basic/LineSegment";
import { type Trilean } from "../../types";
import { optioner } from "../../geomtoy";

export default class LineLineSegment extends BaseRelationship {
    constructor(public geometry1: Line, public geometry2: LineSegment) {
        super();
        const dg2 = geometry2.dimensionallyDegenerate();
        if (dg2) {
            this.degeneration.relationship = null;
            return this;
        }
    }

    @cached
    onSameTrajectory() {
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = this.geometry2;
        const [a, b, c] = this.geometry1.getImplicitFunctionCoefs();
        const d1 = a * x1 + b * y1 + c;
        const d2 = a * x2 + b * y2 + c;
        const epsilon = optioner.options.epsilon;
        return Maths.equalTo(d1, 0, epsilon) && Maths.equalTo(d2, 0, epsilon);
    }

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t2: number; // time of `c` on `lineSegment`
    }[] {
        // if (this.onSameTrajectory()) return []; // do not need, see parallel determination below
        const { point1X: x1, point1Y: y1, point2X: x2, point2Y: y2 } = this.geometry2;
        const [a, b, c] = this.geometry1.getImplicitFunctionCoefs();
        const d1 = a * x1 + b * y1 + c;
        const d2 = a * x2 + b * y2 + c;
        const epsilon = optioner.options.epsilon;
        const s1 = Maths.sign(d1, epsilon);
        const s2 = Maths.sign(d2, epsilon);

        if (Maths.equalTo(d1 - d2, 0, epsilon)) return []; // parallel
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

    // no equal
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (this.onSameTrajectory()) return false;
        return this.intersection().length === 0;
    }

    // no contain
    // no containedBy
    // no cover
    // no coveredBy
    // no overlap

    @superPreprocess("handleDegeneration")
    intersect() {
        return this.intersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.intersection().map(i => new Point(i.c));
    }
    // no contact
    @superPreprocess("handleDegeneration")
    cross() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => !Maths.equalTo(i.t2, 0, epsilon) && !Maths.equalTo(i.t2, 1, epsilon))
            .map(i => new Point(i.c));
    }
    // no touch
    @superPreprocess("handleDegeneration")
    block() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon))
            .map(i => new Point(i.c));
    }
    // no blockedBy
    // no connect
    @superPreprocess("handleDegeneration")
    coincide() {
        if (this.onSameTrajectory()) return [this.geometry2.clone()];
        return [];
    }
}

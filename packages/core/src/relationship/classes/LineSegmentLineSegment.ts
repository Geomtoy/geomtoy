import { Maths, Vector2 } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { optioner } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";

export default class LineSegmentLineSegment extends BaseRelationship {
    constructor(public geometry1: LineSegment, public geometry2: LineSegment) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }
    }

    @cached
    onSameTrajectory() {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this.geometry1;
        const { point1Coordinates: c3, point2Coordinates: c4 } = this.geometry2;
        const epsilon = optioner.options.epsilon;

        const v12 = Vector2.from(c1, c2);
        const v34 = Vector2.from(c3, c4);
        const v13 = Vector2.from(c1, c3);
        const cp1 = Vector2.cross(v12, v34);
        const cp2 = Vector2.cross(v13, v12);
        return Maths.equalTo(cp1, 0, epsilon) && Maths.equalTo(cp2, 0, epsilon);
    }

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment1`
        t2: number; // time of `c` on `lineSegment2`
    }[] {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this.geometry1;
        const { point1Coordinates: c3, point2Coordinates: c4 } = this.geometry2;
        const epsilon = optioner.options.epsilon;

        const v12 = Vector2.from(c1, c2);
        const v34 = Vector2.from(c3, c4);
        const v13 = Vector2.from(c1, c3);

        const cp1 = Vector2.cross(v12, v34);
        const cp2 = Vector2.cross(v13, v12);
        const cp3 = Vector2.cross(v13, v34);

        const intersection: ReturnType<typeof this.intersection> = [];
        if (!Maths.equalTo(cp1, 0, epsilon)) {
            const t1 = cp3 / cp1;
            const t2 = cp2 / cp1;

            if (Maths.between(t1, 0, 1, false, false, epsilon) && Maths.between(t2, 0, 1, false, false, epsilon)) {
                const [x, y] = Vector2.add(c1, Vector2.scalarMultiply(v12, t1));
                intersection.push({ c: [x, y], t1, t2 });
            }
        }
        return intersection;
    }

    perspective(): {
        c1i: [number, number]; // initial coordinates of `lineSegment1`
        c1t: [number, number]; // terminal coordinates of `lineSegment1`
        c2i: [number, number]; // initial coordinates of `lineSegment2` in the perspective of `lineSegment1`
        c2t: [number, number]; // terminal coordinates of `lineSegment2` in the perspective of `lineSegment1`
        t2i: number; // time of `c2i` in the perspective of `lineSegment1`
        t2t: number; // time of `c2t` in the perspective of `lineSegment1`
    } {
        if (!this.onSameTrajectory()) throw new Error("[G]Call `onSameTrajectory` first.");
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
        const epsilon = optioner.options.epsilon;
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
        return this.intersection().map(i => new Point(i.c));
    }
    // no contact
    @superPreprocess("handleDegeneration")
    cross() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => Maths.between(i.t1, 0, 1, true, true, epsilon) && Maths.between(i.t2, 0, 1, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    // no touch
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
        const coincide: (Point | LineSegment)[] = [];
        // coincide point
        const iet = Maths.equalTo(t2i, 1, epsilon);
        const tei = Maths.equalTo(t2t, 0, epsilon);
        if (iet) coincide.push(new Point(c1t));
        if (tei) coincide.push(new Point(c1i));
        if (iet || tei) return coincide;

        // coincide segment
        const ili = Maths.lessThan(t2i, 0, epsilon);
        const ibw = Maths.between(t2i, 0, 1, false, true, epsilon);
        const tgt = Maths.greaterThan(t2t, 1, epsilon);
        const tbw = Maths.between(t2t, 0, 1, true, false, epsilon);
        // overlap
        if (ili && tbw) coincide.push(this.geometry1.portionOf(0, t2t));
        // overlap
        if (tgt && ibw) coincide.push(this.geometry1.portionOf(t2i, 1));
        // contained by
        if (tgt && ili) coincide.push(this.geometry1.clone());
        // contain or equal
        if (ibw && tbw) coincide.push(this.geometry2.clone());
        return coincide;
    }
}

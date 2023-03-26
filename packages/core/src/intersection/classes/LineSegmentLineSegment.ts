import { Maths, Vector2 } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class LineSegmentLineSegment extends BaseIntersection {
    constructor(public geometry1: LineSegment, public geometry2: LineSegment) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
    }

    @cached
    onSameTrajectory() {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this.geometry1;
        const { point1Coordinates: c3, point2Coordinates: c4 } = this.geometry2;

        const v12 = Vector2.from(c1, c2);
        const v34 = Vector2.from(c3, c4);
        const v13 = Vector2.from(c1, c3);
        const cp1 = Vector2.cross(v12, v34);
        const cp2 = Vector2.cross(v13, v12);
        return Maths.equalTo(cp1, 0, eps.vectorEpsilon) && Maths.equalTo(cp2, 0, eps.vectorEpsilon);
    }

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment1`
        t2: number; // time of `c` on `lineSegment2`
    }[] {
        const { point1Coordinates: c1, point2Coordinates: c2 } = this.geometry1;
        const { point1Coordinates: c3, point2Coordinates: c4 } = this.geometry2;

        const v12 = Vector2.from(c1, c2);
        const v34 = Vector2.from(c3, c4);
        const v13 = Vector2.from(c1, c3);

        const cp1 = Vector2.cross(v12, v34);
        const cp2 = Vector2.cross(v13, v12);
        const cp3 = Vector2.cross(v13, v34);

        const intersection: ReturnType<typeof this.properIntersection> = [];
        if (!Maths.equalTo(cp1, 0, eps.vectorEpsilon)) {
            const t1 = cp3 / cp1;
            const t2 = cp2 / cp1;

            if (Maths.between(t1, 0, 1, false, false, eps.timeEpsilon) && Maths.between(t2, 0, 1, false, false, eps.timeEpsilon)) {
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
        return this.properIntersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    cross() {
        return this.properIntersection()
            .filter(i => Maths.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return [];
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
        const coincide: (Point | LineSegment)[] = [];
        // coincide point
        const iet = Maths.equalTo(t2i, 1, eps.timeEpsilon);
        const tei = Maths.equalTo(t2t, 0, eps.timeEpsilon);
        if (iet) coincide.push(new Point(c1t));
        if (tei) coincide.push(new Point(c1i));
        if (iet || tei) return coincide;

        // coincide segment
        const ili = Maths.lessThan(t2i, 0, eps.timeEpsilon);
        const ibw = Maths.between(t2i, 0, 1, false, true, eps.timeEpsilon);
        const tgt = Maths.greaterThan(t2t, 1, eps.timeEpsilon);
        const tbw = Maths.between(t2t, 0, 1, true, false, eps.timeEpsilon);
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

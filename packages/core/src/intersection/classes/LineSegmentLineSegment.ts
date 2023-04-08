import { Float, Vector2 } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class LineSegmentLineSegment extends BaseIntersection {
    static override create(geometry1: LineSegment, geometry2: LineSegment) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };
        if (dg1 instanceof LineSegment && dg2 instanceof LineSegment) {
            ret.intersection = new LineSegmentLineSegment(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: LineSegment, public geometry2: LineSegment) {
        super();
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
        return Float.equalTo(cp1, 0, eps.vectorEpsilon) && Float.equalTo(cp2, 0, eps.vectorEpsilon);
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
        if (!Float.equalTo(cp1, 0, eps.vectorEpsilon)) {
            const t1 = cp3 / cp1;
            const t2 = cp2 / cp1;

            if (Float.between(t1, 0, 1, false, false, eps.timeEpsilon) && Float.between(t2, 0, 1, false, false, eps.timeEpsilon)) {
                const [x, y] = Vector2.add(c1, Vector2.scalarMultiply(v12, t1));
                intersection.push({ c: [x, y], t1, t2 });
            }
        }
        return intersection;
    }

    @cached
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

    equal(): Trilean {
        if (!this.onSameTrajectory()) return false;
        const { t2i, t2t } = this.perspective();
        return Float.equalTo(t2i, 0, eps.timeEpsilon) && Float.equalTo(t2t, 1, eps.timeEpsilon);
    }
    separate(): Trilean {
        if (!this.onSameTrajectory()) {
            return this.properIntersection().length === 0;
        }
        const { t2i, t2t } = this.perspective();
        return Float.greaterThan(t2i, 1, eps.timeEpsilon) || Float.lessThan(t2t, 0, eps.timeEpsilon);
    }
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    strike() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    contact() {
        return [];
    }
    cross() {
        return this.properIntersection()
            .filter(i => Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        return [];
    }
    block() {
        return this.properIntersection()
            .filter(i => (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)) && !(Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    blockedBy() {
        return this.properIntersection()
            .filter(i => (Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)) && !(Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    connect() {
        return this.properIntersection()
            .filter(i => (Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)) && (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    coincide() {
        if (!this.onSameTrajectory()) return [];
        const { t2i, t2t, c1i, c1t } = this.perspective();
        const coincide: (Point | LineSegment)[] = [];
        // coincide point
        const iet = Float.equalTo(t2i, 1, eps.timeEpsilon);
        const tei = Float.equalTo(t2t, 0, eps.timeEpsilon);
        if (iet) coincide.push(new Point(c1t));
        if (tei) coincide.push(new Point(c1i));
        if (iet || tei) return coincide;

        // coincide segment
        const ili = Float.lessThan(t2i, 0, eps.timeEpsilon);
        const ibw = Float.between(t2i, 0, 1, false, true, eps.timeEpsilon);
        const tgt = Float.greaterThan(t2t, 1, eps.timeEpsilon);
        const tbw = Float.between(t2t, 0, 1, true, false, eps.timeEpsilon);
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

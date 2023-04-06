import { Float } from "@geomtoy/util";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import BaseIntersection from "../BaseIntersection";
import LineBezier from "./LineBezier";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";

export default class LineSegmentBezier extends BaseIntersection {
    static override create(geometry1: LineSegment, geometry2: Bezier) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof LineSegment && dg2 instanceof Bezier) {
            ret.intersection = new LineSegmentBezier(dg1, dg2);
            return ret;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof QuadraticBezier) {
            ret.intersection = new LineSegmentQuadraticBezier(dg1, dg2);
            return ret;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof LineSegment) {
            ret.intersection = new LineSegmentLineSegment(dg1, dg2);
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: LineSegment, public geometry2: Bezier) {
        super();
        this.supIntersection = new LineBezier(geometry1.toLine(), geometry2);
    }
    supIntersection: LineBezier;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment`
        t2: number; // time of `c` on `quadraticBezier`
        m: number; // multiplicity
    }[] {
        return this.supIntersection
            .properIntersection()
            .map(i => {
                return { ...i, t1: this.geometry1.getTimeOfPointExtend(i.c) };
            })
            .filter(i => Float.between(i.t1, 0, 1, false, false, eps.timeEpsilon));
    }

    equal() {
        return this.properIntersection().length === 0;
    }
    separate() {
        return this.properIntersection().length === 0;
    }
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    strike() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    cross() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1 && Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon) && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
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
        return [];
    }
}

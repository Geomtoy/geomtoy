import { Float } from "@geomtoy/util";
import Ellipse from "../../geometries/basic/Ellipse";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineEllipse from "./LineEllipse";

export default class LineSegmentEllipse extends BaseIntersection {
    static override create(geometry1: LineSegment, geometry2: Ellipse) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof LineSegment && dg2 instanceof Ellipse) {
            ret.intersection = new LineSegmentEllipse(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: LineSegment, public geometry2: Ellipse) {
        super();
        this.supIntersection = new LineEllipse(geometry1.toLine(), geometry2);
    }
    supIntersection: LineEllipse;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment`
        a2: number; // angle of `c` on `ellipse`
        m: number; // multiplicity
    }[] {
        return this.supIntersection
            .properIntersection()
            .map(i => {
                return { ...i, t1: this.geometry1.getTimeOfPointExtend(i.c) };
            })
            .filter(i => Float.between(i.t1, 0, 1, false, false, eps.timeEpsilon));
    }

    equal(): Trilean {
        return false;
    }
    separate(): Trilean {
        if (!this.geometry2.isPointOutside(this.geometry1.point1Coordinates)) return false;
        if (!this.geometry2.isPointOutside(this.geometry1.point2Coordinates)) return false;
        if (this.properIntersection().length !== 0) return false;
        return true;
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
            .filter(i => i.m % 2 === 1 && Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && Float.between(i.t1, 0, 1, true, true, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    block() {
        return [];
    }
    blockedBy() {
        return this.properIntersection()
            .filter(i => Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    connect() {
        return [];
    }
    coincide() {
        return [];
    }
}

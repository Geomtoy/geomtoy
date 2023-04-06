import { Angle, Float } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineEllipse from "./LineEllipse";
import LineSegmentLineSegment from "./LineSegmentLineSegment";

export default class LineSegmentArc extends BaseIntersection {
    static override create(geometry1: LineSegment, geometry2: Arc) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof LineSegment && dg2 instanceof Arc) {
            ret.intersection = new LineSegmentArc(dg1, dg2);
            return ret;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof LineSegment) {
            ret.intersection = new LineSegmentLineSegment(dg1, dg2);
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: LineSegment, public geometry2: Arc) {
        super();
        this.supIntersection = new LineEllipse(geometry1.toLine(), geometry2.toEllipse());
    }
    supIntersection: LineEllipse;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment`
        a2: number; // angle of `c` on `arc`
        m: number; // multiplicity
    }[] {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const positive = this.geometry2.positive;
        return this.supIntersection
            .properIntersection()
            .map(i => {
                return { ...i, t1: this.geometry1.getTimeOfPointExtend(i.c) };
            })
            .filter(i => Float.between(i.t1, 0, 1, false, false, eps.timeEpsilon) && Angle.between(i.a2, sa, ea, positive, false, false, eps.angleEpsilon));
    }

    equal(): Trilean {
        return this.properIntersection().length === 0;
    }
    separate(): Trilean {
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
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(
                i =>
                    i.m % 2 === 1 &&
                    !(Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)) &&
                    !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    touch() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(
                i =>
                    i.m % 2 === 0 &&
                    !(Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)) &&
                    !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    block() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(
                i => (Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon)) && !(Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon))
            )
            .map(i => new Point(i.c));
    }
    blockedBy() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(
                i => (Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)) && !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    connect() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(
                i => (Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)) && (Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    coincide() {
        return [];
    }
}

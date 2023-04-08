import { Angle } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Line from "../../geometries/basic/Line";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineEllipse from "./LineEllipse";
import LineLineSegment from "./LineLineSegment";

export default class LineArc extends BaseIntersection {
    static override create(geometry1: Line, geometry2: Arc) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Line && dg2 instanceof Arc) {
            ret.intersection = new LineArc(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof Line && dg2 instanceof LineSegment) {
            ret.intersection = new LineLineSegment(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Line, public geometry2: Arc) {
        super();
        this.supIntersection = new LineEllipse(geometry1, geometry2.toEllipse());
    }
    supIntersection: LineEllipse;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        a2: number; // angle of `c` on `arc`
        m: number; // multiplicity
    }[] {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const positive = this.geometry2.positive;
        return this.supIntersection.properIntersection().filter(i => Angle.between(i.a2, sa, ea, positive, false, false, eps.angleEpsilon));
    }

    equal(): Trilean {
        return false;
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
            .filter(i => i.m % 2 === 1 && !Angle.equalTo(i.a2, sa, eps.angleEpsilon) && !Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(i => i.m % 2 == 0 && !Angle.equalTo(i.a2, sa, eps.angleEpsilon) && !Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            .map(i => new Point(i.c));
    }
    block() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(i => Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            .map(i => new Point(i.c));
    }
    blockedBy() {
        return [];
    }
    connect() {
        return [];
    }
    coincide() {
        return [];
    }
}

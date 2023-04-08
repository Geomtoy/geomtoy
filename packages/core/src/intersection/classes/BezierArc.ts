import { Angle, Box, Float } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import BezierEllipse from "./BezierEllipse";
import LineSegmentArc from "./LineSegmentArc";
import LineSegmentBezier from "./LineSegmentBezier";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";
import QuadraticBezierArc from "./QuadraticBezierArc";

export default class BezierArc extends BaseIntersection {
    static override create(geometry1: Bezier, geometry2: Arc) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Bezier && dg2 instanceof Arc) {
            ret.intersection = new BezierArc(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof Bezier && dg2 instanceof LineSegment) {
            ret.intersection = new LineSegmentBezier(dg2, dg1);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            ret.inverse = true;
            return ret;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof Arc) {
            ret.intersection = new QuadraticBezierArc(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof LineSegment) {
            ret.intersection = new LineSegmentQuadraticBezier(dg2, dg1);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            ret.inverse = true;
            return ret;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof Arc) {
            ret.intersection = new LineSegmentArc(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof LineSegment) {
            ret.intersection = new LineSegmentLineSegment(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Bezier, public geometry2: Arc) {
        super();
        this.supIntersection = new BezierEllipse(geometry1, geometry2.toEllipse());
    }
    supIntersection: BezierEllipse;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `bezier`
        a2: number; // angle of `c` on `arc`
        m: number; // multiplicity
    }[] {
        if (!Box.collide(this.geometry1.getBoundingBox(), this.geometry2.getBoundingBox())) return [];
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

import { Angle } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Ellipse from "../../geometries/basic/Ellipse";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import EllipseEllipse from "./EllipseEllipse";
import LineSegmentEllipse from "./LineSegmentEllipse";

export default class ArcEllipse extends BaseIntersection {
    static override create(geometry1: Arc, geometry2: Ellipse) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Arc && dg2 instanceof Ellipse) {
            ret.intersection = new ArcEllipse(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof Ellipse) {
            ret.intersection = new LineSegmentEllipse(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Arc, public geometry2: Ellipse) {
        super();
        this.supIntersection = new EllipseEllipse(geometry1.toEllipse(), geometry2);
    }
    supIntersection: EllipseEllipse;

    @cached
    onSameTrajectory() {
        return this.supIntersection.onSameTrajectory();
    }

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        a1: number; // angle of `c` on `arc`
        a2: number; // angle of `c` on `ellipse`
        m: number; //multiplicity
    }[] {
        const [sa, ea] = this.geometry1.getStartEndAngles();
        const positive = this.geometry1.positive;
        return this.supIntersection.properIntersection().filter(i => Angle.between(i.a1, sa, ea, positive, false, false, eps.angleEpsilon));
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
        const [sa, ea] = this.geometry1.getStartEndAngles();
        return this.properIntersection()
            .filter(i => i.m % 2 === 1 && !Angle.equalTo(i.a1, sa, eps.angleEpsilon) && !Angle.equalTo(i.a1, ea, eps.angleEpsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        const [sa, ea] = this.geometry1.getStartEndAngles();
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && !Angle.equalTo(i.a1, sa, eps.angleEpsilon) && !Angle.equalTo(i.a1, ea, eps.angleEpsilon))
            .map(i => new Point(i.c));
    }
    block() {
        return [];
    }
    blockedBy() {
        const [sa, ea] = this.geometry1.getStartEndAngles();
        return this.properIntersection()
            .filter(i => Angle.equalTo(i.a1, sa, eps.angleEpsilon) || Angle.equalTo(i.a1, ea, eps.angleEpsilon))
            .map(i => new Point(i.c));
    }
    connect() {
        return [];
    }
    coincide() {
        if (!this.onSameTrajectory()) return [];
        return [this.geometry1.clone()];
    }
}

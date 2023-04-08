import { Coordinates, Float } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineLineSegment from "./LineLineSegment";

export default class RayLineSegment extends BaseIntersection {
    static override create(geometry1: Ray, geometry2: LineSegment) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Ray && dg2 instanceof LineSegment) {
            ret.intersection = new RayLineSegment(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Ray, public geometry2: LineSegment) {
        super();
        this.supIntersection = new LineLineSegment(geometry1.toLine(), geometry2);
    }
    supIntersection: LineLineSegment;

    @cached
    onSameTrajectory() {
        return this.supIntersection.onSameTrajectory() ?? false;
    }
    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection,
        t2: number; // time of `c` on lineSegment
    }[] {
        return this.supIntersection.properIntersection().filter(i => this.geometry1.isPointOn(i.c));
    }
    @cached
    perspective(): {
        c1: [number, number]; // coordinates of `ray`
        c2i: [number, number]; // initial coordinates of `lineSegment`
        c2t: [number, number]; // terminal coordinates of `lineSegment`
        t1: number; // time of `c1` in the perspective of `lineSegment`
    } {
        if (!this.onSameTrajectory()) throw new Error("[G]Call `onSameTrajectory` first.");
        const c1 = this.geometry1.coordinates;
        const { point1Coordinates: c2i, point2Coordinates: c2t } = this.geometry2;
        const t1 = this.geometry2.getTimeOfPointExtend(c1);
        return {
            c1,
            c2i,
            c2t,
            t1
        };
    }

    equal(): Trilean {
        return false;
    }
    separate(): Trilean {
        if (!this.onSameTrajectory()) {
            return this.properIntersection().length === 0;
        }
        const { t1 } = this.perspective();
        return !Float.between(t1, 0, 1, false, false, eps.timeEpsilon);
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
            .filter(i => !Float.equalTo(i.t2, 0, eps.timeEpsilon) && !Float.equalTo(i.t2, 1, eps.timeEpsilon) && !Coordinates.equalTo(i.c, this.geometry1.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        return [];
    }
    block() {
        return this.properIntersection()
            .filter(i => Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    blockedBy() {
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, this.geometry1.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    connect() {
        return this.properIntersection()
            .filter(i => (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)) && Coordinates.equalTo(i.c, this.geometry1.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    coincide() {
        if (!this.onSameTrajectory()) return [];
        const { c2i, c2t, t1 } = this.perspective();
        const c2iOn = this.geometry1.isPointOn(c2i);
        const c2tOn = this.geometry1.isPointOn(c2t);
        const coincide: (Point | LineSegment)[] = [];

        const ei = Float.equalTo(t1, 0, eps.timeEpsilon);
        const et = Float.equalTo(t1, 1, eps.timeEpsilon);

        if (c2iOn && c2tOn) {
            coincide.push(this.geometry2.clone());
        }
        if (c2iOn && !c2tOn) {
            if (ei) {
                coincide.push(new Point(c2i));
            } else {
                coincide.push(this.geometry2.portionOf(0, t1));
            }
        }
        if (!c2iOn && c2tOn) {
            if (et) {
                coincide.push(new Point(c2t));
            } else {
                coincide.push(this.geometry2.portionOf(t1, 1));
            }
        }
        // if (!c2iOn && !c2tOn) // no coincide;
        return coincide;
    }
}

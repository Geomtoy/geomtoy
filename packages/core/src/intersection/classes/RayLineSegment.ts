import { Coordinates, Maths } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineLineSegment from "./LineLineSegment";

export default class RayLineSegment extends BaseIntersection {
    constructor(public geometry1: Ray, public geometry2: LineSegment) {
        super();
        const dg2 = geometry2.degenerate(false);
        if (dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
        this.supIntersection = new LineLineSegment(geometry1.toLine(), geometry2);
    }

    supIntersection?: LineLineSegment;

    @cached
    onSameTrajectory() {
        return this.supIntersection?.onSameTrajectory() ?? false;
    }
    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection,
        t2: number; // time of `c` on lineSegment
    }[] {
        const intersection = this.supIntersection?.properIntersection() ?? [];
        return intersection.filter(i => this.geometry1.isPointOn(i.c));
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
    @superPreprocess("handleDegeneration")
    equal(): Trilean {
        return false;
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (!this.onSameTrajectory()) {
            return this.properIntersection().length === 0;
        }
        const { t1 } = this.perspective();
        return !Maths.between(t1, 0, 1, false, false, eps.timeEpsilon);
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
            .filter(i => !Maths.equalTo(i.t2, 0, eps.timeEpsilon) && !Maths.equalTo(i.t2, 1, eps.timeEpsilon) && !Coordinates.equalTo(i.c, this.geometry1.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    block() {
        return this.properIntersection()
            .filter(i => Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, this.geometry1.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        return this.properIntersection()
            .filter(i => (Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)) && Coordinates.equalTo(i.c, this.geometry1.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        if (!this.onSameTrajectory()) return [];
        const { c2i, c2t, t1 } = this.perspective();
        const c2iOn = this.geometry1.isPointOn(c2i);
        const c2tOn = this.geometry1.isPointOn(c2t);
        const coincide: (Point | LineSegment)[] = [];

        const ei = Maths.equalTo(t1, 0, eps.timeEpsilon);
        const et = Maths.equalTo(t1, 1, eps.timeEpsilon);

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

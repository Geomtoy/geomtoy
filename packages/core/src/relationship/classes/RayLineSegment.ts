import { Coordinates, Maths } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { cached } from "../../misc/decor-cache";

import { optioner } from "../../geomtoy";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineLineSegment from "./LineLineSegment";

export default class RayLineSegment extends BaseRelationship {
    constructor(public geometry1: Ray, public geometry2: LineSegment) {
        super();
        const dg2 = geometry2.degenerate(false);
        if (dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }
        this.supRelationship = new LineLineSegment(geometry1.toLine(), geometry2);
    }

    supRelationship?: LineLineSegment;

    @cached
    onSameTrajectory() {
        return this.supRelationship?.onSameTrajectory() ?? false;
    }
    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection,
        t2: number; // time of `c` on lineSegment
    }[] {
        const intersection = this.supRelationship?.intersection() ?? [];
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

    // no equal
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (!this.onSameTrajectory()) {
            return this.intersection().length === 0;
        }
        const { t1 } = this.perspective();
        const epsilon = optioner.options.epsilon;
        return !Maths.between(t1, 0, 1, false, false, epsilon);
    }

    // no contain
    // no containedBy

    @superPreprocess("handleDegeneration")
    intersect() {
        return this.intersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.intersection().map(i => new Point(i.c));
    }
    // no contact
    @superPreprocess("handleDegeneration")
    cross() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => !Maths.equalTo(i.t2, 0, epsilon) && !Maths.equalTo(i.t2, 1, epsilon) && !Coordinates.isEqualTo(i.c, this.geometry1.coordinates, epsilon))
            .map(i => new Point(i.c));
    }
    // no touch
    @superPreprocess("handleDegeneration")
    block() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, this.geometry1.coordinates, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)) && Coordinates.isEqualTo(i.c, this.geometry1.coordinates, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        if (!this.onSameTrajectory()) return [];
        const { c2i, c2t, t1 } = this.perspective();
        const c2iOn = this.geometry1.isPointOn(c2i);
        const c2tOn = this.geometry1.isPointOn(c2t);
        const epsilon = optioner.options.epsilon;
        const coincide: (Point | LineSegment)[] = [];

        const ei = Maths.equalTo(t1, 0, epsilon);
        const et = Maths.equalTo(t1, 1, epsilon);

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

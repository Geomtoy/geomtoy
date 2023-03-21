import { Angle, Maths } from "@geomtoy/util";
import type Arc from "../../geometries/basic/Arc";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineEllipse from "./LineEllipse";
import LineSegmentLineSegment from "./LineSegmentLineSegment";

export default class LineSegmentArc extends BaseRelationship {
    constructor(public geometry1: LineSegment, public geometry2: Arc) {
        super();

        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }
        if (dg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentLineSegment(dg1!, dg2);
            return this;
        }

        this.supRelationship = new LineEllipse(geometry1.toLine(), geometry2.toEllipse());
    }
    supRelationship!: LineEllipse;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `lineSegment`
        a2: number; // angle of `c` on `arc`
        m: number; // multiplicity
    }[] {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const positive = this.geometry2.positive;
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection
            .map(i => {
                return { ...i, t1: this.geometry1.getTimeOfPointExtend(i.c) };
            })
            .filter(i => Maths.between(i.t1, 0, 1, false, false, eps.timeEpsilon) && Angle.between(i.a2, sa, ea, positive, false, false, eps.angleEpsilon));
    }

    // no equal
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        return this.intersection().length === 0;
    }

    // no contain
    // no containedBy

    @superPreprocess("handleDegeneration")
    intersect() {
        return this.intersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.intersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return this.intersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    cross() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.intersection()
            .filter(
                i =>
                    i.m % 2 === 1 &&
                    !(Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon)) &&
                    !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.intersection()
            .filter(
                i =>
                    i.m % 2 === 0 &&
                    !(Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon)) &&
                    !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.intersection()
            .filter(
                i => (Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon)) && !(Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.intersection()
            .filter(
                i => (Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon)) && !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.intersection()
            .filter(
                i => (Maths.equalTo(i.t1, 0, eps.timeEpsilon) || Maths.equalTo(i.t1, 1, eps.timeEpsilon)) && (Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    // no coincide
}

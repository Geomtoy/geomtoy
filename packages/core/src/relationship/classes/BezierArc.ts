import { Angle, Box, Maths } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import Bezier from "../../geometries/basic/Bezier";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import BezierEllipse from "./BezierEllipse";
import LineSegmentArc from "./LineSegmentArc";
import LineSegmentBezier from "./LineSegmentBezier";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";
import QuadraticBezierArc from "./QuadraticBezierArc";

export default class BezierArc extends BaseRelationship {
    constructor(public geometry1: Bezier, public geometry2: Arc) {
        super();

        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof Arc) {
            this.degeneration.relationship = new QuadraticBezierArc(dg1, dg2);
            return this;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentQuadraticBezier(dg2, dg1);
            this.degeneration.inverse = true;
            return this;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof Arc) {
            this.degeneration.relationship = new LineSegmentArc(dg1, dg2);
            return this;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentLineSegment(dg1, dg2);
            return this;
        }
        if (dg1 instanceof Bezier && dg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentBezier(dg2, geometry1);
            this.degeneration.inverse = true;
            return this;
        }
        this.supRelationship = new BezierEllipse(geometry1, geometry2.toEllipse());
    }
    supRelationship?: BezierEllipse;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `bezier`
        a2: number; // angle of `c` on `arc`
        m: number; // multiplicity
    }[] {
        if (!Box.collide(this.geometry1.getBoundingBox(), this.geometry2.getBoundingBox())) return [];
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const positive = this.geometry2.positive;
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => Angle.between(i.a2, sa, ea, positive, false, false, eps.angleEpsilon));
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

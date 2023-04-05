import { Angle, Box, Float } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineSegmentArc from "./LineSegmentArc";
import LineSegmentLineSegment from "./LineSegmentLineSegment";
import LineSegmentQuadraticBezier from "./LineSegmentQuadraticBezier";
import QuadraticBezierEllipse from "./QuadraticBezierEllipse";

export default class QuadraticBezierArc extends BaseIntersection {
    constructor(public geometry1: QuadraticBezier, public geometry2: Arc) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof Arc) {
            this.degeneration.intersection = new LineSegmentArc(dg1, dg2);
            return this;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof LineSegment) {
            this.degeneration.intersection = new LineSegmentLineSegment(dg1, dg2);
            return this;
        }
        if (dg1 instanceof QuadraticBezier && dg2 instanceof LineSegment) {
            this.degeneration.intersection = new LineSegmentQuadraticBezier(dg2, dg1);
            this.degeneration.inverse = true;
            return this;
        }

        this.supIntersection = new QuadraticBezierEllipse(geometry1, geometry2.toEllipse());
    }
    supIntersection?: QuadraticBezierEllipse;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `quadraticBezier`
        a2: number; // angle of `c` on `arc`
        m: number; // multiplicity
    }[] {
        if (!Box.collide(this.geometry1.getBoundingBox(), this.geometry2.getBoundingBox())) return [];
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const positive = this.geometry2.positive;
        const intersection = this.supIntersection?.properIntersection() ?? [];
        return intersection.filter(i => Angle.between(i.a2, sa, ea, positive, false, false, eps.angleEpsilon));
    }

    @superPreprocess("handleDegeneration")
    equal(): Trilean {
        return false;
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        return this.properIntersection().length === 0;
    }
    @superPreprocess("handleDegeneration")
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
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
    @superPreprocess("handleDegeneration")
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
    @superPreprocess("handleDegeneration")
    block() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(
                i => (Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon)) && !(Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(
                i => (Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)) && !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        return this.properIntersection()
            .filter(
                i => (Float.equalTo(i.t1, 0, eps.timeEpsilon) || Float.equalTo(i.t1, 1, eps.timeEpsilon)) && (Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        return [];
    }
}

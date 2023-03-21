import { Angle, Box, Maths } from "@geomtoy/util";
import Arc from "../../geometries/basic/Arc";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import EllipseEllipse from "./EllipseEllipse";
import LineSegmentArc from "./LineSegmentArc";

export default class ArcArc extends BaseRelationship {
    constructor(public geometry1: Arc, public geometry2: Arc) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }
        if (dg1 instanceof LineSegment && dg2 instanceof Arc) {
            this.degeneration.relationship = new LineSegmentArc(dg1, dg2);
            return this;
        }
        if (dg1 instanceof Arc && dg2 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentArc(dg2, dg1);
            this.degeneration.inverse = true;
            return this;
        }
        this.supRelationship = new EllipseEllipse(geometry1.toEllipse(), geometry2.toEllipse());
    }

    supRelationship?: EllipseEllipse;

    @cached
    onSameTrajectory() {
        return this.supRelationship?.onSameTrajectory() ?? false;
    }
    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        a1: number; // angle of `c` on `arc1`
        a2: number; // angle of `c` on `arc2`
        m: number; // multiplicity
    }[] {
        if (!Box.collide(this.geometry1.getBoundingBox(), this.geometry2.getBoundingBox())) return [];
        if (this.onSameTrajectory()) return [];
        const { a1i, a1t, a2i, a2t } = this.perspective();
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => Angle.between(i.a1, a1i, a1t, true, false, false, eps.angleEpsilon) && Angle.between(i.a2, a2i, a2t, true, false, false, eps.angleEpsilon));
    }
    @cached
    perspective(): {
        c1i: [number, number]; // initial coordinates of `arc1` in the perspective of positive rotation
        c1t: [number, number]; // terminal coordinates of `arc1` in the perspective of positive rotation
        c2i: [number, number]; // initial coordinates of `arc2` in the perspective of positive rotation
        c2t: [number, number]; // terminal coordinates of `arc2` in the perspective of positive rotation
        a1i: number; // angle of `c1i` in the perspective of positive rotation
        a1t: number; // angle of `c1t` in the perspective of positive rotation
        a2i: number; // angle of `c2i` in the perspective of positive rotation
        a2t: number; // angle of `c2t` in the perspective of positive rotation
    } {
        // in the perspective of positive rotation
        const [a1i, a1t] = this.geometry1.getStartEndAngles();
        const [a2i, a2t] = this.geometry2.getStartEndAngles();
        const { point1Coordinates: c1i, point2Coordinates: c1t, positive: p1 } = this.geometry1;
        const { point1Coordinates: c2i, point2Coordinates: c2t, positive: p2 } = this.geometry2;
        return {
            c1i: p1 ? c1i : c1t,
            c1t: p1 ? c1t : c1i,
            c2i: p2 ? c2i : c2t,
            c2t: p2 ? c2t : c2i,
            a1i: p1 ? a1i : a1t,
            a1t: p1 ? a1t : a1i,
            a2i: p2 ? a2i : a2t,
            a2t: p2 ? a2t : a2i
        };
    }

    @superPreprocess("handleDegeneration")
    equal(): Trilean {
        const { a1i, a1t, a2i, a2t } = this.perspective();
        return this.onSameTrajectory() && Maths.equalTo(a1i, a2i, eps.angleEpsilon) && Maths.equalTo(a1t, a2t, eps.angleEpsilon);
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (!this.onSameTrajectory()) return this.intersection().length === 0;
        const { a1i, a1t, a2i, a2t } = this.perspective();
        const dt = a1i < a1t === a2i < a2t;
        if (dt) {
            return Maths.greaterThan(a2i, a1t, eps.angleEpsilon) || Maths.lessThan(a2t, a1i, eps.angleEpsilon);
        } else {
            return Maths.greaterThan(a2i, a1t, eps.angleEpsilon) && Maths.lessThan(a2t, a1i, eps.angleEpsilon);
        }
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
        const { a1i, a1t, a2i, a2t } = this.perspective();
        return this.intersection()
            .filter(i => i.m % 2 === 1 && Angle.between(i.a1, a1i, a1t, true, true, true, eps.angleEpsilon) && Angle.between(i.a2, a2i, a2t, true, true, true, eps.angleEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const { a1i, a1t, a2i, a2t } = this.perspective();
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Angle.between(i.a1, a1i, a1t, true, true, true, eps.angleEpsilon) && Angle.between(i.a2, a2i, a2t, true, true, true, eps.angleEpsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const { a1i, a1t, a2i, a2t } = this.perspective();
        return this.intersection()
            .filter(
                i =>
                    (Angle.equalTo(i.a2, a2i, eps.angleEpsilon) || Angle.equalTo(i.a2, a2t, eps.angleEpsilon)) &&
                    !(Angle.equalTo(i.a1, a1i, eps.angleEpsilon) || Angle.equalTo(i.a1, a1t, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const { a1i, a1t, a2i, a2t } = this.perspective();
        return this.intersection()
            .filter(
                i =>
                    (Angle.equalTo(i.a1, a1i, eps.angleEpsilon) || Angle.equalTo(i.a1, a1t, eps.angleEpsilon)) &&
                    !(Angle.equalTo(i.a2, a2i, eps.angleEpsilon) || Angle.equalTo(i.a2, a2t, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const { a1i, a1t, a2i, a2t } = this.perspective();
        return this.intersection()
            .filter(
                i =>
                    (Angle.equalTo(i.a1, a1i, eps.angleEpsilon) || Angle.equalTo(i.a1, a1t, eps.angleEpsilon)) &&
                    (Angle.equalTo(i.a2, a2i, eps.angleEpsilon) || Angle.equalTo(i.a2, a2t, eps.angleEpsilon))
            )
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        if (!this.onSameTrajectory()) return [];
        const { a1i, a1t, a2i, a2t, c1i, c1t } = this.perspective();
        const coincide: (Point | Arc)[] = [];

        // coincide point
        const iet = Angle.equalTo(a2i, a1t, eps.angleEpsilon);
        const tei = Angle.equalTo(a2t, a1i, eps.angleEpsilon);
        if (iet) coincide.push(new Point(c1t));
        if (tei) coincide.push(new Point(c1i));

        // coincide segment
        const dt = a1i < a1t === a2i < a2t;
        const ili = dt ? Maths.lessThan(a2i, a1i, eps.angleEpsilon) : Maths.greaterThan(a2i, a1t, eps.angleEpsilon);
        const ibw = Angle.between(a2i, a1i, a1t, true, false, true, eps.angleEpsilon);
        const tgt = dt ? Maths.greaterThan(a2t, a1t, eps.angleEpsilon) : Maths.lessThan(a2t, a1i, eps.angleEpsilon);
        const tbw = Angle.between(a2t, a1i, a1t, true, true, false, eps.angleEpsilon);
        const ellipse = this.geometry1.toEllipse();

        if (dt) {
            // overlap
            if (ili && tbw) coincide.push(ellipse.getArcBetweenAngles(a1i, a2t, true)!);
            // overlap
            if (tgt && ibw) coincide.push(ellipse.getArcBetweenAngles(a2i, a1t, true)!);
            // contained by
            if (tgt && ili) coincide.push(this.geometry1.clone());
            // contain or equal
            if (ibw && tbw) coincide.push(this.geometry2.clone());
        } else {
            // overlap
            if (ili && tbw) coincide.push(ellipse.getArcBetweenAngles(a1i, a2t, true)!);
            // overlap
            if (tgt && ibw) coincide.push(ellipse.getArcBetweenAngles(a2i, a1t, true)!);
            // if (tgt && ili) {/* not overlap */}
            // double overlap
            if (ibw && tbw) coincide.push(ellipse.getArcBetweenAngles(a1i, a2t)!, ellipse.getArcBetweenAngles(a2i, a1t)!);
        }
        return coincide;
    }
}

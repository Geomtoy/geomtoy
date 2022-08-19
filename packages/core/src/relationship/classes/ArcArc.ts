import { Angle, Box, Maths } from "@geomtoy/util";
import BaseRelationship from "../BaseRelationship";
import Arc from "../../geometries/basic/Arc";
import Point from "../../geometries/basic/Point";
import EllipseEllipse from "./EllipseEllipse";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { optioner } from "../../geomtoy";

export default class ArcArc extends BaseRelationship {
    constructor(public geometry1: Arc, public geometry2: Arc) {
        super();
        const dg1 = geometry1.dimensionallyDegenerate();
        const dg2 = geometry2.dimensionallyDegenerate();
        if (dg1 || dg2) {
            this.degeneration.relationship = null;
            return this;
        }
        this.supRelationship = new EllipseEllipse(this.geometry1.toEllipse(), this.geometry2.toEllipse());
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
        const epsilon = optioner.options.epsilon;
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => Angle.between(i.a1, a1i, a1t, true, false, false, epsilon) && Angle.between(i.a2, a2i, a2t, true, false, false, epsilon));
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
        const epsilon = optioner.options.epsilon;
        return this.onSameTrajectory() && Maths.equalTo(a1i, a2i, epsilon) && Maths.equalTo(a1t, a2t, epsilon);
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (!this.onSameTrajectory()) return this.intersection().length === 0;
        const { a1i, a1t, a2i, a2t } = this.perspective();
        const epsilon = optioner.options.epsilon;
        const dt = a1i < a1t === a2i < a2t;
        if (dt) {
            return Maths.greaterThan(a2i, a1t, epsilon) || Maths.lessThan(a2t, a1i, epsilon);
        } else {
            return Maths.greaterThan(a2i, a1t, epsilon) && Maths.lessThan(a2t, a1i, epsilon);
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
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && Angle.between(i.a1, a1i, a1t, true, true, true, epsilon) && Angle.between(i.a2, a2i, a2t, true, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const { a1i, a1t, a2i, a2t } = this.perspective();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Angle.between(i.a1, a1i, a1t, true, true, true, epsilon) && Angle.between(i.a2, a2i, a2t, true, true, true, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const { a1i, a1t, a2i, a2t } = this.perspective();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Angle.equalTo(i.a2, a2i, epsilon) || Angle.equalTo(i.a2, a2t, epsilon)) && !(Angle.equalTo(i.a1, a1i, epsilon) || Angle.equalTo(i.a1, a1t, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const { a1i, a1t, a2i, a2t } = this.perspective();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Angle.equalTo(i.a1, a1i, epsilon) || Angle.equalTo(i.a1, a1t, epsilon)) && !(Angle.equalTo(i.a2, a2i, epsilon) || Angle.equalTo(i.a2, a2t, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const { a1i, a1t, a2i, a2t } = this.perspective();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Angle.equalTo(i.a1, a1i, epsilon) || Angle.equalTo(i.a1, a1t, epsilon)) && (Angle.equalTo(i.a2, a2i, epsilon) || Angle.equalTo(i.a2, a2t, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        if (!this.onSameTrajectory()) return [];
        const { a1i, a1t, a2i, a2t, c1i, c1t } = this.perspective();
        const epsilon = optioner.options.epsilon;
        const coincide: (Point | Arc)[] = [];

        // coincide point
        const iet = Angle.equalTo(a2i, a1t, epsilon);
        const tei = Angle.equalTo(a2t, a1i, epsilon);
        if (iet) coincide.push(new Point(c1t));
        if (tei) coincide.push(new Point(c1i));

        // coincide segment
        const dt = a1i < a1t === a2i < a2t;
        const ili = dt ? Maths.lessThan(a2i, a1i, epsilon) : Maths.greaterThan(a2i, a1t, epsilon);
        const ibw = Angle.between(a2i, a1i, a1t, true, false, true, epsilon);
        const tgt = dt ? Maths.greaterThan(a2t, a1t, epsilon) : Maths.lessThan(a2t, a1i, epsilon);
        const tbw = Angle.between(a2t, a1i, a1t, true, true, false, epsilon);
        const ellipse = this.geometry1.toEllipse();

        if (dt) {
            // overlap
            if (ili && tbw) coincide.push(ellipse.getArcBetweenAngle(a1i, a2t, true)!);
            // overlap
            if (tgt && ibw) coincide.push(ellipse.getArcBetweenAngle(a2i, a1t, true)!);
            // contained by
            if (tgt && ili) coincide.push(this.geometry1.clone());
            // contain or equal
            if (ibw && tbw) coincide.push(this.geometry2.clone());
        } else {
            // overlap
            if (ili && tbw) coincide.push(ellipse.getArcBetweenAngle(a1i, a2t, true)!);
            // overlap
            if (tgt && ibw) coincide.push(ellipse.getArcBetweenAngle(a2i, a1t, true)!);
            // if (tgt && ili) {/* not overlap */}
            // double overlap
            if (ibw && tbw) coincide.push(ellipse.getArcBetweenAngle(a1i, a2t)!, ellipse.getArcBetweenAngle(a2i, a1t)!);
        }
        return coincide;
    }
}
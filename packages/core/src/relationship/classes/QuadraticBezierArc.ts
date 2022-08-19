import { Angle, Box, Maths } from "@geomtoy/util";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import BaseRelationship from "../BaseRelationship";
import Point from "../../geometries/basic/Point";
import { Trilean } from "../../types";
import type Arc from "../../geometries/basic/Arc";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import QuadraticBezierEllipse from "./QuadraticBezierEllipse";
import LineSegment from "../../geometries/basic/LineSegment";
import LineSegmentArc from "./LineSegmentArc";
import { optioner } from "../../geomtoy";

export default class QuadraticBezierArc extends BaseRelationship {
    constructor(public geometry1: QuadraticBezier, public geometry2: Arc) {
        super();
        const dg1 = geometry1.dimensionallyDegenerate();
        const dg2 = geometry2.dimensionallyDegenerate();
        if (dg1 || dg2) {
            this.degeneration.relationship = null;
            return this;
        }
        const ndg1 = geometry1.nonDimensionallyDegenerate();
        if (ndg1 instanceof LineSegment) {
            this.degeneration.relationship = new LineSegmentArc(ndg1, geometry2);
            return this;
        }

        this.supRelationship = new QuadraticBezierEllipse(geometry1, geometry2.toEllipse());
    }
    supRelationship?: QuadraticBezierEllipse;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t1: number; // time of `c` on `quadraticBezier`
        a2: number; // angle of `c` on `arc`
        m: number; // multiplicity
    }[] {
        if (!Box.collide(this.geometry1.getBoundingBox(), this.geometry2.getBoundingBox())) return [];
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const positive = this.geometry2.positive;
        const epsilon = optioner.options.epsilon;
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => Angle.between(i.a2, sa, ea, positive, false, false, epsilon));
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
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && !(Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)) && !(Angle.equalTo(i.a2, sa, epsilon) || Angle.equalTo(i.a2, ea, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && !(Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)) && !(Angle.equalTo(i.a2, sa, epsilon) || Angle.equalTo(i.a2, ea, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Angle.equalTo(i.a2, sa, epsilon) || Angle.equalTo(i.a2, ea, epsilon)) && !(Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)) && !(Angle.equalTo(i.a2, sa, epsilon) || Angle.equalTo(i.a2, ea, epsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const epsilon = optioner.options.epsilon;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t1, 0, epsilon) || Maths.equalTo(i.t1, 1, epsilon)) && (Angle.equalTo(i.a2, sa, epsilon) || Angle.equalTo(i.a2, ea, epsilon)))
            .map(i => new Point(i.c));
    }
    // no coincide
}

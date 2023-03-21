import { Angle, Coordinates } from "@geomtoy/util";
import type Arc from "../../geometries/basic/Arc";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import type Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineEllipse from "./LineEllipse";
import RayLineSegment from "./RayLineSegment";

export default class RayArc extends BaseRelationship {
    constructor(public geometry1: Ray, public geometry2: Arc) {
        super();
        const dg2 = geometry2.degenerate(false);
        if (dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }
        if (dg2 instanceof LineSegment) {
            this.degeneration.relationship = new RayLineSegment(geometry1, dg2);
            return this;
        }

        this.supRelationship = new LineEllipse(geometry1.toLine(), geometry2.toEllipse());
    }

    supRelationship?: LineEllipse;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        a2: number; // angle of `c` on `arc`
        m: number; // multiplicity
    }[] {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const positive = this.geometry2.positive;
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => this.geometry1.isPointOn(i.c) && Angle.between(i.a2, sa, ea, positive, false, false, eps.angleEpsilon));
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
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon)) && !Coordinates.isEqualTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon)) && !Coordinates.isEqualTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => !Coordinates.isEqualTo(i.c, coordinates, eps.epsilon) && (Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, coordinates, eps.epsilon) && !(Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const [sa, ea] = this.geometry2.getStartEndAngles();
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, coordinates, eps.epsilon) && (Angle.equalTo(i.a2, sa, eps.angleEpsilon) || Angle.equalTo(i.a2, ea, eps.angleEpsilon)))
            .map(i => new Point(i.c));
    }
    // no coincide
}

import { Coordinates, Maths } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineQuadraticBezier from "./LineQuadraticBezier";
import RayLineSegment from "./RayLineSegment";

export default class RayQuadraticBezier extends BaseRelationship {
    constructor(public geometry1: Ray, public geometry2: QuadraticBezier) {
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
        this.supRelationship = new LineQuadraticBezier(geometry1.toLine(), geometry2);
    }

    supRelationship?: LineQuadraticBezier;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t2: number; // time of `c` on `quadraticBezier`
        m: number; // multiplicity
    }[] {
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => this.geometry1.isPointOn(i.c));
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
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon) && !Coordinates.isEqualTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t2, 0, 1, true, true, eps.timeEpsilon) && !Coordinates.isEqualTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)) && !Coordinates.isEqualTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, coordinates, eps.epsilon) && !(Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    connect() {
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, coordinates, eps.epsilon) && (Maths.equalTo(i.t2, 0, eps.timeEpsilon) || Maths.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    // no coincide
}

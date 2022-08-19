import { Coordinates, Maths } from "@geomtoy/util";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import BaseRelationship from "../BaseRelationship";
import Bezier from "../../geometries/basic/Bezier";
import Ray from "../../geometries/basic/Ray";
import LineBezier from "./LineBezier";
import RayLineSegment from "./RayLineSegment";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import RayQuadraticBezier from "./RayQuadraticBezier";
import { optioner } from "../../geomtoy";

export default class RayBezier extends BaseRelationship {
    constructor(public geometry1: Ray, public geometry2: Bezier) {
        super();
        const dg2 = geometry2.dimensionallyDegenerate();
        if (dg2) {
            this.degeneration.relationship = null;
            return this;
        }
        const ndg2 = geometry2.nonDimensionallyDegenerate();
        if (ndg2 instanceof QuadraticBezier) {
            this.degeneration.relationship = new RayQuadraticBezier(geometry1, ndg2);
        }
        if (ndg2 instanceof LineSegment) {
            this.degeneration.relationship = new RayLineSegment(geometry1, ndg2);
        }

        this.supRelationship = new LineBezier(geometry1.toLine(), geometry2);
    }

    supRelationship?: LineBezier;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        t2: number; // time of `c` on `bezier`
        m: number; // multiplicity
    }[] {
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => this.geometry1.isPointOn(i.c));
    }

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
        const epsilon = optioner.options.epsilon;
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => i.m % 2 === 1 && Maths.between(i.t2, 0, 1, true, true, epsilon) && !Coordinates.isEqualTo(i.c, coordinates, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const epsilon = optioner.options.epsilon;
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => i.m % 2 === 0 && Maths.between(i.t2, 0, 1, true, true, epsilon) && !Coordinates.isEqualTo(i.c, coordinates, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const epsilon = optioner.options.epsilon;
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => (Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)) && !Coordinates.isEqualTo(i.c, coordinates, epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const epsilon = optioner.options.epsilon;
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, coordinates, epsilon) && !(Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)))
            .map(i => new Point(i.c));
    }
    connect() {
        const epsilon = optioner.options.epsilon;
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, coordinates, epsilon) && (Maths.equalTo(i.t2, 0, epsilon) || Maths.equalTo(i.t2, 1, epsilon)))
            .map(i => new Point(i.c));
    }
    // no coincide
}

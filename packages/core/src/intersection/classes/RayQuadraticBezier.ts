import { Coordinates, Float } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineQuadraticBezier from "./LineQuadraticBezier";
import RayLineSegment from "./RayLineSegment";

export default class RayQuadraticBezier extends BaseIntersection {
    constructor(public geometry1: Ray, public geometry2: QuadraticBezier) {
        super();
        const dg2 = geometry2.degenerate(false);
        if (dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
        if (dg2 instanceof LineSegment) {
            this.degeneration.intersection = new RayLineSegment(geometry1, dg2);
            return this;
        }
        this.supIntersection = new LineQuadraticBezier(geometry1.toLine(), geometry2);
    }

    supIntersection?: LineQuadraticBezier;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t2: number; // time of `c` on `quadraticBezier`
        m: number; // multiplicity
    }[] {
        const intersection = this.supIntersection?.properIntersection() ?? [];
        return intersection.filter(i => this.geometry1.isPointOn(i.c));
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
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => i.m % 2 === 1 && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon) && !Coordinates.equalTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon) && !Coordinates.equalTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)) && !Coordinates.equalTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, coordinates, eps.epsilon) && !(Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    connect() {
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, coordinates, eps.epsilon) && (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        return [];
    }
}

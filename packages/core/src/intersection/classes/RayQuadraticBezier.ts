import { Coordinates, Float } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import QuadraticBezier from "../../geometries/basic/QuadraticBezier";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineQuadraticBezier from "./LineQuadraticBezier";
import RayLineSegment from "./RayLineSegment";

export default class RayQuadraticBezier extends BaseIntersection {
    static override create(geometry1: Ray, geometry2: QuadraticBezier) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Ray && dg2 instanceof QuadraticBezier) {
            ret.intersection = new RayQuadraticBezier(dg1, dg2);
            return ret;
        }
        if (dg1 instanceof Ray && dg2 instanceof LineSegment) {
            ret.intersection = new RayLineSegment(geometry1, dg2);
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Ray, public geometry2: QuadraticBezier) {
        super();
        this.supIntersection = new LineQuadraticBezier(geometry1.toLine(), geometry2);
    }
    supIntersection: LineQuadraticBezier;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        t2: number; // time of `c` on `quadraticBezier`
        m: number; // multiplicity
    }[] {
        return this.supIntersection.properIntersection().filter(i => this.geometry1.isPointOn(i.c));
    }

    equal(): Trilean {
        return false;
    }
    separate(): Trilean {
        return this.properIntersection().length === 0;
    }
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    strike() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    cross() {
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => i.m % 2 === 1 && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon) && !Coordinates.equalTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => i.m % 2 === 0 && Float.between(i.t2, 0, 1, true, true, eps.timeEpsilon) && !Coordinates.equalTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    block() {
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)) && !Coordinates.equalTo(i.c, coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    blockedBy() {
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, coordinates, eps.epsilon) && !(Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    connect() {
        const coordinates = this.geometry1.coordinates;
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, coordinates, eps.epsilon) && (Float.equalTo(i.t2, 0, eps.timeEpsilon) || Float.equalTo(i.t2, 1, eps.timeEpsilon)))
            .map(i => new Point(i.c));
    }
    coincide() {
        return [];
    }
}

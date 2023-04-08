import { Coordinates } from "@geomtoy/util";
import Circle from "../../geometries/basic/Circle";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineCircle from "./LineCircle";

export default class RayCircle extends BaseIntersection {
    static override create(geometry1: Ray, geometry2: Circle) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Ray && dg2 instanceof Circle) {
            ret.intersection = new RayCircle(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Ray, public geometry2: Circle) {
        super();
        this.supIntersection = new LineCircle(geometry1.toLine(), geometry2);
    }
    supIntersection: LineCircle;

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
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
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    block() {
        return [];
    }
    blockedBy() {
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, this.geometry1.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    connect() {
        return [];
    }
    coincide() {
        return [];
    }
}

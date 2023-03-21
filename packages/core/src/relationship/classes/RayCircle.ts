import { Coordinates } from "@geomtoy/util";
import Circle from "../../geometries/basic/Circle";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineCircle from "./LineCircle";

export default class RayCircle extends BaseRelationship {
    constructor(public geometry1: Ray, public geometry2: Circle) {
        super();
        const dg2 = geometry2.degenerate(false);
        if (dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }

        this.supRelationship = new LineCircle(geometry1.toLine(), geometry2);
    }
    supRelationship?: LineCircle;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        m: number; // multiplicity
    }[] {
        const intersection = this.supRelationship?.intersection() ?? [];
        return intersection.filter(i => this.geometry1.isPointOn(i.c));
    }

    // no equal
    separate(): Trilean {
        return this.intersection().length === 0;
    }

    // no contain
    // no containedBy

    intersect() {
        return this.intersection().map(i => new Point(i.c));
    }
    strike() {
        return this.intersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    contact() {
        return this.intersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    cross() {
        return this.intersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    touch() {
        return this.intersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    // no block
    blockedBy() {
        return this.intersection()
            .filter(i => Coordinates.equalTo(i.c, this.geometry1.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    // no connect
    // no coincide
}

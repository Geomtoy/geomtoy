import { Coordinates } from "@geomtoy/util";
import Ellipse from "../../geometries/basic/Ellipse";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { optioner } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineEllipse from "./LineEllipse";

export default class RayEllipse extends BaseRelationship {
    constructor(public geometry1: Ray, public geometry2: Ellipse) {
        super();
        this.supRelationship = new LineEllipse(this.geometry1.toLine(), this.geometry2);
    }
    supRelationship: LineEllipse;

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        m: number; // multiplicity
    }[] {
        const intersection = this.supRelationship.intersection();
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
        const epsilon = optioner.options.epsilon;
        const coordinates = this.geometry1.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, coordinates, epsilon))
            .map(i => new Point(i.c));
    }
    // no connect
    // no coincide
}

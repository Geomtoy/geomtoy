import { Maths, Vector2 } from "@geomtoy/util";
import Circle from "../../geometries/basic/Circle";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";

export default class LineCircle extends BaseRelationship {
    constructor(public geometry1: Line, public geometry2: Circle) {
        super();
        const dg2 = geometry2.degenerate(false);
        if (dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }
    }

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        m: number; // multiplicity
    }[] {
        const { radius: r, centerCoordinates: cc } = this.geometry2;
        const pc = this.geometry1.getClosestPointFromPoint(cc)[0].coordinates;
        const sd = Vector2.squaredMagnitude(Vector2.from(cc, pc));
        const r2 = r ** 2;

        const intersection: ReturnType<typeof this.intersection> = [];

        if (Maths.equalTo(sd, r2, eps.epsilon)) {
            intersection.push({ c: pc, m: 2 });
        }
        if (Maths.lessThan(sd, r2, eps.epsilon)) {
            const di = Maths.sqrt(r ** 2 - sd);
            const angle = this.geometry1.angle;
            const v1 = Vector2.from2(angle, di);
            const v2 = Vector2.from2(angle - Maths.PI, di);
            intersection.push({ c: Vector2.add(pc, v1), m: 1 }, { c: Vector2.add(pc, v2), m: 1 });
        }
        return intersection;
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
    // no blockedBy
    // no connect
    // no coincide
}

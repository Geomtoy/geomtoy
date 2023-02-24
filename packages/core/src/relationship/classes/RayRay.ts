import { Coordinates, Vector2 } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { optioner } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineLine from "./LineLine";

export default class RayRay extends BaseRelationship {
    constructor(public geometry1: Ray, public geometry2: Ray) {
        super();
        this.supRelationship = new LineLine(geometry1.toLine(), geometry2.toLine());
    }
    supRelationship: LineLine;

    @cached
    onSameTrajectory() {
        return this.supRelationship.onSameTrajectory();
    }
    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
    }[] {
        return this.supRelationship.intersection().filter(i => this.geometry1.isPointOn(i.c) && this.geometry2.isPointOn(i.c));
    }
    // no equal
    separate(): Trilean {
        if (this.onSameTrajectory()) return false;
        return this.intersection().length === 0;
    }

    // no contain
    // no containedBy

    intersect() {
        return this.intersection().map(i => new Point(i.c));
    }
    strike() {
        return this.intersection().map(i => new Point(i.c));
    }
    // no contact
    cross() {
        const epsilon = optioner.options.epsilon;
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
        return this.intersection()
            .filter(i => !Coordinates.isEqualTo(i.c, c1, epsilon) && !Coordinates.isEqualTo(i.c, c2, epsilon))
            .map(i => new Point(i.c));
    }
    // no touch
    block() {
        const epsilon = optioner.options.epsilon;
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, c2, epsilon) && !Coordinates.isEqualTo(i.c, c1, epsilon))
            .map(i => new Point(i.c));
    }
    blockedBy() {
        const epsilon = optioner.options.epsilon;
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, c1, epsilon) && !Coordinates.isEqualTo(i.c, c2, epsilon))
            .map(i => new Point(i.c));
    }
    connect() {
        const epsilon = optioner.options.epsilon;
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, c1, epsilon) && Coordinates.isEqualTo(i.c, c2, epsilon))
            .map(i => new Point(i.c));
    }
    coincide() {
        if (!this.onSameTrajectory()) return [];
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
        const epsilon = optioner.options.epsilon;
        const coincide: (Ray | Point | LineSegment)[] = [];
        const sameDirection = Vector2.dot(Vector2.from2(this.geometry1.angle, 1), Vector2.from2(this.geometry2.angle, 1)) > 0;
        const on = this.geometry1.isPointOn(c2);
        if (sameDirection) {
            if (on) {
                coincide.push(this.geometry2.clone());
            } else {
                coincide.push(this.geometry1.clone());
            }
        } else {
            if (on) {
                if (Coordinates.isEqualTo(c1, c2, epsilon)) {
                    coincide.push(new Point(c1));
                } else {
                    coincide.push(new LineSegment(c1, c2));
                }
            }
        }
        return coincide;
    }
}

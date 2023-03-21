import { Coordinates } from "@geomtoy/util";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";
import LineLine from "./LineLine";

export default class LineRay extends BaseRelationship {
    constructor(public geometry1: Line, public geometry2: Ray) {
        super();
        this.supRelationship = new LineLine(geometry1, geometry2.toLine());
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
        return this.supRelationship.intersection().filter(i => this.geometry2.isPointOn(i.c));
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
    // no touch
    cross() {
        return this.intersection()
            .filter(i => !Coordinates.isEqualTo(i.c, this.geometry2.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    block() {
        return this.intersection()
            .filter(i => Coordinates.isEqualTo(i.c, this.geometry2.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    // no blockedBy
    // no connect
    coincide() {
        if (this.onSameTrajectory()) return [this.geometry2.clone()];
        return [];
    }
}

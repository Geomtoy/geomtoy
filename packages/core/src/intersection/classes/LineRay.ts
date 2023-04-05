import { Coordinates } from "@geomtoy/util";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineLine from "./LineLine";

export default class LineRay extends BaseIntersection {
    constructor(public geometry1: Line, public geometry2: Ray) {
        super();
        this.supIntersection = new LineLine(geometry1, geometry2.toLine());
    }
    supIntersection: LineLine;

    @cached
    onSameTrajectory() {
        return this.supIntersection.onSameTrajectory();
    }
    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
    }[] {
        return this.supIntersection.properIntersection().filter(i => this.geometry2.isPointOn(i.c));
    }
    equal(): Trilean {
        return false;
    }
    separate(): Trilean {
        if (this.onSameTrajectory()) return false;
        return this.properIntersection().length === 0;
    }
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    strike() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    contact() {
        return [];
    }
    cross() {
        return this.properIntersection()
            .filter(i => !Coordinates.equalTo(i.c, this.geometry2.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        return [];
    }
    block() {
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, this.geometry2.coordinates, eps.epsilon))
            .map(i => new Point(i.c));
    }
    blockedBy() {
        return [];
    }
    connect() {
        return [];
    }
    coincide() {
        if (this.onSameTrajectory()) return [this.geometry2.clone()];
        return [];
    }
}
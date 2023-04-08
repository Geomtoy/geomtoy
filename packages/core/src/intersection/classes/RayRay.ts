import { Angle, Coordinates, Vector2 } from "@geomtoy/util";
import LineSegment from "../../geometries/basic/LineSegment";
import Point from "../../geometries/basic/Point";
import Ray from "../../geometries/basic/Ray";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";
import LineLine from "./LineLine";

export default class RayRay extends BaseIntersection {
    static override create(geometry1: Ray, geometry2: Ray) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Ray && dg2 instanceof Ray) {
            ret.intersection = new RayRay(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Ray, public geometry2: Ray) {
        super();
        this.supIntersection = new LineLine(geometry1.toLine(), geometry2.toLine());
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
        return this.supIntersection.properIntersection().filter(i => this.geometry1.isPointOn(i.c) && this.geometry2.isPointOn(i.c));
    }
    equal(): Trilean {
        return Angle.equalTo(this.geometry1.angle, this.geometry2.angle) && Coordinates.equalTo(this.geometry1.coordinates, this.geometry2.coordinates);
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
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
        return this.properIntersection()
            .filter(i => !Coordinates.equalTo(i.c, c1, eps.epsilon) && !Coordinates.equalTo(i.c, c2, eps.epsilon))
            .map(i => new Point(i.c));
    }
    touch() {
        return [];
    }
    block() {
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, c2, eps.epsilon) && !Coordinates.equalTo(i.c, c1, eps.epsilon))
            .map(i => new Point(i.c));
    }
    blockedBy() {
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, c1, eps.epsilon) && !Coordinates.equalTo(i.c, c2, eps.epsilon))
            .map(i => new Point(i.c));
    }
    connect() {
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
        return this.properIntersection()
            .filter(i => Coordinates.equalTo(i.c, c1, eps.epsilon) && Coordinates.equalTo(i.c, c2, eps.epsilon))
            .map(i => new Point(i.c));
    }
    coincide() {
        if (!this.onSameTrajectory()) return [];
        const c1 = this.geometry1.coordinates;
        const c2 = this.geometry2.coordinates;
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
                if (Coordinates.equalTo(c1, c2, eps.epsilon)) {
                    coincide.push(new Point(c1));
                } else {
                    coincide.push(new LineSegment(c1, c2));
                }
            }
        }
        return coincide;
    }
}

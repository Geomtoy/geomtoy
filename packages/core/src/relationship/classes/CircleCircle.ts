import { Coordinates, Maths, Vector2 } from "@geomtoy/util";
import Circle from "../../geometries/basic/Circle";
import Point from "../../geometries/basic/Point";
import { optioner } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";

export default class CircleCircle extends BaseRelationship {
    constructor(public geometry1: Circle, public geometry2: Circle) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.relationship = null;
            return this;
        }
    }

    @cached
    onSameTrajectory() {
        const { centerCoordinates: cc1, radius: r1 } = this.geometry1;
        const { centerCoordinates: cc2, radius: r2 } = this.geometry2;
        const epsilon = optioner.options.epsilon;
        return Coordinates.isEqualTo(cc1, cc2, epsilon) && Maths.equalTo(r1, r2, epsilon);
    }

    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection
        m: number; // multiplicity
    }[] {
        if (this.onSameTrajectory()) return [];
        const { centerCoordinates: cc1, radius: r1 } = this.geometry1;
        const { centerCoordinates: cc2, radius: r2 } = this.geometry2;
        const v = Vector2.from(cc1, cc2);
        const sd = Vector2.squaredMagnitude(v);
        const ssr = (r1 + r2) ** 2;
        const sdr = (r1 - r2) ** 2;

        const epsilon = optioner.options.epsilon;
        const intersection: ReturnType<typeof this.intersection> = [];
        if (Maths.lessThan(sd, ssr, epsilon) && Maths.greaterThan(sd, sdr, epsilon)) {
            const angle = Maths.acos(r1 ** 2 + sd - r2 ** 2) / (2 * r1 * Maths.sqrt(sd));
            const baseAngle = Vector2.angle(v);
            intersection.push(
                {
                    c: this.geometry1.getPointAtAngle(baseAngle + angle).coordinates,
                    m: 1
                },
                {
                    c: this.geometry1.getPointAtAngle(baseAngle - angle).coordinates,
                    m: 1
                }
            );
        }
        if (Maths.equalTo(sd, ssr, epsilon) || Maths.equalTo(sd, sdr, epsilon)) {
            intersection.push({
                c: this.geometry1.getPointAtAngle(Vector2.angle(v)).coordinates,
                m: 2
            });
        }
        return intersection;
    }

    equal(): Trilean {
        return this.onSameTrajectory();
    }
    separate(): Trilean {
        if (!this.geometry1.isPointOutside(this.geometry2.centerCoordinates)) return false;
        if (!this.geometry2.isPointOutside(this.geometry1.centerCoordinates)) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }

    contain(): Trilean {
        if (!this.geometry1.isPointInside(this.geometry2.centerCoordinates)) return false;
        if (this.onSameTrajectory()) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }
    containedBy(): Trilean {
        if (!this.geometry2.isPointInside(this.geometry1.centerCoordinates)) return false;
        if (this.onSameTrajectory()) return false;
        if (this.intersection().length !== 0) return false;
        return true;
    }

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
    coincide() {
        if (!this.onSameTrajectory()) return [];
        return [this.geometry1.clone()];
    }
}

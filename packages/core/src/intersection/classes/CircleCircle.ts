import { Coordinates, Float, Maths, Vector2 } from "@geomtoy/util";
import Circle from "../../geometries/basic/Circle";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class CircleCircle extends BaseIntersection {
    static override create(geometry1: Circle, geometry2: Circle) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Circle && dg2 instanceof Circle) {
            ret.intersection = new CircleCircle(dg1, dg2);
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Circle, public geometry2: Circle) {
        super();
    }

    @cached
    onSameTrajectory() {
        const { centerCoordinates: cc1, radius: r1 } = this.geometry1;
        const { centerCoordinates: cc2, radius: r2 } = this.geometry2;
        return Coordinates.equalTo(cc1, cc2, eps.epsilon) && Float.equalTo(r1, r2, eps.epsilon);
    }

    @cached
    properIntersection(): {
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

        const intersection: ReturnType<typeof this.properIntersection> = [];
        if (Float.lessThan(sd, ssr, eps.epsilon) && Float.greaterThan(sd, sdr, eps.epsilon)) {
            const cosTheta = (sd + r1 ** 2 - r2 ** 2) / (2 * Maths.sqrt(sd)) / r1;
            const angle = Maths.acos(cosTheta);
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
        if (Float.equalTo(sd, ssr, eps.epsilon) || Float.equalTo(sd, sdr, eps.epsilon)) {
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
        if (this.onSameTrajectory()) return false;
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
        return [];
    }
    connect() {
        return [];
    }
    coincide() {
        if (!this.onSameTrajectory()) return [];
        return [this.geometry1.clone()];
    }
}

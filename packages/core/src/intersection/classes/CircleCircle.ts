import { Coordinates, Float, Maths, Vector2 } from "@geomtoy/util";
import Circle from "../../geometries/basic/Circle";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class CircleCircle extends BaseIntersection {
    constructor(public geometry1: Circle, public geometry2: Circle) {
        super();
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);
        if (dg1 instanceof Point || dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
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
    @superPreprocess("handleDegeneration")
    equal(): Trilean {
        return this.onSameTrajectory();
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
        if (this.onSameTrajectory()) return false;
        return this.properIntersection().length === 0;
    }
    @superPreprocess("handleDegeneration")
    intersect() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    strike() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    contact() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    cross() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 1)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    touch() {
        return this.properIntersection()
            .filter(i => i.m % 2 === 0)
            .map(i => new Point(i.c));
    }
    @superPreprocess("handleDegeneration")
    block() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    blockedBy() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    connect() {
        return [];
    }
    @superPreprocess("handleDegeneration")
    coincide() {
        if (!this.onSameTrajectory()) return [];
        return [this.geometry1.clone()];
    }
}

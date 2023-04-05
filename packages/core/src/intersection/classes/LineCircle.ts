import { Float, Maths, Vector2 } from "@geomtoy/util";
import Circle from "../../geometries/basic/Circle";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { superPreprocess } from "../../misc/decor-super-preprocess";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class LineCircle extends BaseIntersection {
    constructor(public geometry1: Line, public geometry2: Circle) {
        super();
        const dg2 = geometry2.degenerate(false);
        if (dg2 instanceof Point) {
            this.degeneration.intersection = null;
            return this;
        }
    }

    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection
        m: number; // multiplicity
    }[] {
        const { radius: r, centerCoordinates: cc } = this.geometry2;
        const pc = this.geometry1.getClosestPointFromPoint(cc)[0].coordinates;
        const sd = Vector2.squaredMagnitude(Vector2.from(cc, pc));
        const r2 = r ** 2;

        const intersection: ReturnType<typeof this.properIntersection> = [];

        if (Float.equalTo(sd, r2, eps.epsilon)) {
            intersection.push({ c: pc, m: 2 });
        }
        if (Float.lessThan(sd, r2, eps.epsilon)) {
            const di = Maths.sqrt(r ** 2 - sd);
            const angle = this.geometry1.angle;
            const v1 = Vector2.from2(angle, di);
            const v2 = Vector2.from2(angle - Maths.PI, di);
            intersection.push({ c: Vector2.add(pc, v1), m: 1 }, { c: Vector2.add(pc, v2), m: 1 });
        }
        return intersection;
    }

    @superPreprocess("handleDegeneration")
    equal(): Trilean {
        return false;
    }
    @superPreprocess("handleDegeneration")
    separate(): Trilean {
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
        return [];
    }
}

import { Float, Maths, Vector2 } from "@geomtoy/util";
import Circle from "../../geometries/basic/Circle";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class LineCircle extends BaseIntersection {
    static override create(geometry1: Line, geometry2: Circle) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };
        if (dg1 instanceof Line && dg2 instanceof Circle) {
            ret.intersection = new LineCircle(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }
        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Line, public geometry2: Circle) {
        super();
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
    equal(): Trilean {
        return false;
    }
    separate(): Trilean {
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
        return [];
    }
}

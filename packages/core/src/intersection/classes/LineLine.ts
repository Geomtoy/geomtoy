import { Float } from "@geomtoy/util";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import { eps } from "../../geomtoy";
import { cached, DISABLE_CACHE_SYMBOL } from "../../misc/decor-cached";
import { Trilean } from "../../types";
import BaseIntersection from "../BaseIntersection";

export default class LineLine extends BaseIntersection {
    static override create(geometry1: Line, geometry2: Line) {
        const dg1 = geometry1.degenerate(false);
        const dg2 = geometry2.degenerate(false);

        const ret = {
            intersection: BaseIntersection.nullIntersection,
            inverse: false
        } as {
            intersection: BaseIntersection;
            inverse: boolean;
        };

        if (dg1 instanceof Line && dg2 instanceof Line) {
            ret.intersection = new LineLine(dg1, dg2);
            ret.intersection[DISABLE_CACHE_SYMBOL] = false;
            return ret;
        }

        // null or point degeneration
        return ret;
    }

    constructor(public geometry1: Line, public geometry2: Line) {
        super();
    }

    @cached
    onSameTrajectory() {
        const [a1, b1, c1] = this.geometry1.getImplicitFunctionCoefs();
        const [a2, b2, c2] = this.geometry2.getImplicitFunctionCoefs();
        const m = a1 * b2 - a2 * b1;
        const n = a1 * c2 - a2 * c1;
        return Float.equalTo(m, 0, eps.epsilon) && Float.equalTo(n, 0, eps.epsilon);
    }
    @cached
    properIntersection(): {
        c: [number, number]; // coordinates of intersection(although there is only one, we still use array);
    }[] {
        if (this.onSameTrajectory()) return [];
        const [a1, b1, c1] = this.geometry1.getImplicitFunctionCoefs();
        const [a2, b2, c2] = this.geometry2.getImplicitFunctionCoefs();
        const m = a1 * b2 - a2 * b1;
        const intersection: ReturnType<typeof this.properIntersection> = [];
        if (!Float.equalTo(m, 0, eps.epsilon)) {
            const x = (c2 * b1 - c1 * b2) / m;
            const y = (c1 * a2 - c2 * a1) / m;
            intersection.push({ c: [x, y] });
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
        return this.properIntersection().map(i => new Point(i.c));
    }
    contact() {
        return [];
    }
    cross() {
        return this.properIntersection().map(i => new Point(i.c));
    }
    touch() {
        return [];
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

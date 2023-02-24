import { Maths } from "@geomtoy/util";
import Line from "../../geometries/basic/Line";
import Point from "../../geometries/basic/Point";
import { optioner } from "../../geomtoy";
import { cached } from "../../misc/decor-cache";
import { Trilean } from "../../types";
import BaseRelationship from "../BaseRelationship";

export default class LineLine extends BaseRelationship {
    constructor(public geometry1: Line, public geometry2: Line) {
        super();
    }

    @cached
    onSameTrajectory() {
        const [a1, b1, c1] = this.geometry1.getImplicitFunctionCoefs();
        const [a2, b2, c2] = this.geometry2.getImplicitFunctionCoefs();
        const m = a1 * b2 - a2 * b1;
        const n = a1 * c2 - a2 * c1;
        const epsilon = optioner.options.epsilon;
        return Maths.equalTo(m, 0, epsilon) && Maths.equalTo(n, 0, epsilon);
    }
    @cached
    intersection(): {
        c: [number, number]; // coordinates of intersection(although there is only one, we still use array);
    }[] {
        if (this.onSameTrajectory()) return [];
        const [a1, b1, c1] = this.geometry1.getImplicitFunctionCoefs();
        const [a2, b2, c2] = this.geometry2.getImplicitFunctionCoefs();
        const m = a1 * b2 - a2 * b1;
        const epsilon = optioner.options.epsilon;
        const intersection: ReturnType<typeof this.intersection> = [];
        if (!Maths.equalTo(m, 0, epsilon)) {
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
        return this.intersection().map(i => new Point(i.c));
    }
    // no block
    // no blockedBy
    // no connect
    coincide() {
        if (!this.onSameTrajectory()) return [];
        return [this.geometry1.clone()];
    }
}

import { Utility } from "@geomtoy/util";
import type Geometry from "../base/Geometry";
import type Point from "../geometries/basic/Point";
import { IntersectionPredicate, type AllResult, type Trilean } from "../types";

//@see https://en.wikipedia.org/wiki/Contact_(mathematics)
/*
When the intersection with `multiplicity` = 1, the intersection is transversal:
- only "strike".
When the intersection with `multiplicity` > 1, the intersection is tangential:
- for `multiplicity` is even, only "contact".
- for `multiplicity` is odd, "strike" and "contact".

But in this case, the general understanding is this "contact" is not "contact". So we still define this case only as `strike`.

For the understanding convenience, we give some examples here(You may draw a picture): 
- Bezier curve ([50, 50], [150, 50], [50, 150], [150, 150]) and a vertical line segment pass through [100, 100].
- Two ellipses has two intersection: one with multiplicity = 3 and one with multiplicity = 1.
*/

export default abstract class BaseIntersection {
    degeneration: {
        intersection: BaseIntersection | null;
        inverse: boolean;
    } = {
        intersection: this,
        inverse: false
    };

    private static _nullIntersection = {
        equal: () => undefined,
        separate: () => undefined,
        intersect: () => [],
        strike: () => [],
        contact: () => [],
        cross: () => [],
        touch: () => [],
        block: () => [],
        blockedBy: () => [],
        connect: () => [],
        coincide: () => []
    };

    handleDegeneration(p: IntersectionPredicate) {
        if (this.degeneration.intersection === null) {
            return BaseIntersection._nullIntersection[p]();
        }
        if (this.degeneration.intersection !== this) {
            const { intersection, inverse } = this.degeneration;
            const inversePredicates = {
                equal: "equal",
                separate: "separate",
                intersect: "intersect",
                strike: "strike",
                contact: "contact",
                cross: "cross",
                touch: "touch",
                block: inverse ? "blockedBy" : "block",
                blockedBy: inverse ? "block" : "blockedBy",
                connect: "connect",
                coincide: " coincide"
            };
            return intersection[inversePredicates[p] as IntersectionPredicate]?.() ?? BaseIntersection._nullIntersection[p]();
        }
        return this;
    }

    abstract equal(): Trilean;
    abstract separate(): Trilean;
    abstract intersect(): Point[];
    abstract strike(): Point[];
    abstract contact(): Point[];
    abstract cross(): Point[];
    abstract touch(): Point[];
    abstract block(): Point[];
    abstract blockedBy(): Point[];
    abstract connect(): Point[];
    abstract coincide(): Geometry[];

    all(predicates?: IntersectionPredicate[]) {
        if (predicates !== undefined) {
            predicates = Utility.uniqBy(predicates, p => p); // remove duplicated
        } else {
            predicates = Object.values(IntersectionPredicate);
        }
        const result: { [key in IntersectionPredicate]?: any } = {};
        predicates.forEach(p => {
            if (this[p] !== undefined) {
                result[p as IntersectionPredicate] = this[p]!();
            }
        });
        return result as AllResult<this>;
    }
}

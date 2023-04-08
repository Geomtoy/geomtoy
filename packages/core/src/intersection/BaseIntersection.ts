import { Utility } from "@geomtoy/util";
import type Geometry from "../base/Geometry";
import type Point from "../geometries/basic/Point";
import { DISABLE_CACHE_SYMBOL } from "../misc/decor-cached";
import { IntersectionPredicate, type Trilean } from "../types";

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
    [DISABLE_CACHE_SYMBOL] = true;

    static create(geometry1: Geometry, geometry2: Geometry): { intersection: BaseIntersection; inverse: boolean } {
        return {
            intersection: this.nullIntersection,
            inverse: false
        };
    }

    static nullIntersection = new (class NullIntersection extends BaseIntersection {
        equal(): Trilean {
            return undefined;
        }
        separate(): Trilean {
            return undefined;
        }
        intersect() {
            return [];
        }
        strike() {
            return [];
        }
        contact() {
            return [];
        }
        cross() {
            return [];
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
            return [];
        }
    })();

    static readonly inversePredicates = {
        equal: ["equal", "equal"],
        separate: ["separate", "separate"],
        intersect: ["intersect", "intersect"],
        strike: ["strike", "strike"],
        contact: ["contact", "contact"],
        cross: ["cross", "cross"],
        touch: ["touch", "touch"],
        block: ["block", "blockedBy"],
        blockedBy: ["blockedBy", "block"],
        connect: ["connect", "connect"],
        coincide: ["coincide", "coincide"]
    };

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

    static result(intersectionInfo: ReturnType<typeof BaseIntersection.create>, p: IntersectionPredicate) {
        if (intersectionInfo.intersection === BaseIntersection.nullIntersection) {
            return intersectionInfo.intersection[p]();
        }
        const { intersection, inverse } = intersectionInfo;
        return intersection[BaseIntersection.inversePredicates[p][inverse ? 1 : 0] as IntersectionPredicate]();
    }
    static all(intersectionInfo: ReturnType<typeof BaseIntersection.create>, predicates?: IntersectionPredicate[]) {
        if (predicates !== undefined) {
            predicates = Utility.uniqBy(predicates, p => p); // remove duplicated
        } else {
            predicates = Object.values(IntersectionPredicate);
        }
        const result: { [key in IntersectionPredicate]?: any } = {};
        predicates.forEach(p => {
            result[p as IntersectionPredicate] = this.result(intersectionInfo, p);
        });
        return result;
    }
}

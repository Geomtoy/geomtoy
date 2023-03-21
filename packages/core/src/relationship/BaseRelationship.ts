import { Coordinates, Utility } from "@geomtoy/util";
import type Geometry from "../base/Geometry";
import type Point from "../geometries/basic/Point";
import { eps } from "../geomtoy";
import { RelationshipPredicate, type RelateResult, type Trilean } from "../types";

//@see https://en.wikipedia.org/wiki/Contact_(mathematics)
/*
When the intersection with `multiplicity` = 1, the intersection is transversal:
- only "striking".
When the intersection with `multiplicity` > 1, the intersection is tangential:
- for `multiplicity` is even, only "touching".
- for `multiplicity` is odd, "striking" and "touching".
  But in this case, the general understanding is this "touching" is not "touching". So we still define
  this case only as `striking`.
  For the convenience of the reader's understanding, 
  we give some examples here(You may draw a picture): 
  - Bezier curve ([50, 50], [150, 50], [50, 150], [150, 150]) and a vertical line segment pass through [100, 100].
  - Two ellipses has two intersection: one with multiplicity = 3 and one with multiplicity = 1.
*/

export default abstract class BaseRelationship {
    degeneration: {
        relationship: BaseRelationship | null;
        inverse: boolean;
    } = {
        relationship: this,
        inverse: false
    };

    private static _nullRelationship = {
        equal: () => undefined,
        separate: () => undefined,
        contain: () => undefined,
        containedBy: () => undefined,
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

    handleDegeneration(p: RelationshipPredicate) {
        if (this.degeneration.relationship === null) {
            return BaseRelationship._nullRelationship[p]();
        }
        if (this.degeneration.relationship !== this) {
            const { relationship, inverse } = this.degeneration;
            const inversePredicates = {
                equal: "equal",
                separate: "separate",
                contain: inverse ? "containedBy" : "contain",
                containedBy: inverse ? "contain" : "containedBy",
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
            return relationship[inversePredicates[p] as RelationshipPredicate]?.() ?? BaseRelationship._nullRelationship[p]();
        }
        return this;
    }

    protected uniqCoordinates_(coordinatesArray: [number, number][]) {
        return Utility.uniqWith(coordinatesArray, (a, b) => Coordinates.isEqualTo(a, b, eps.epsilon));
    }

    equal?(): Trilean;
    separate?(): Trilean;

    contain?(): Trilean;
    containedBy?(): Trilean;

    intersect?(): Point[];
    strike?(): Point[];
    contact?(): Point[];
    cross?(): Point[];
    touch?(): Point[];
    block?(): Point[];
    blockedBy?(): Point[];
    connect?(): Point[];
    coincide?(): Geometry[];

    relate(predicates?: RelationshipPredicate[]) {
        if (predicates !== undefined) {
            predicates = Utility.uniqBy(predicates, p => p); // remove duplicated
        } else {
            predicates = Object.values(RelationshipPredicate);
        }
        const result: { [key in RelationshipPredicate]?: any } = {};
        predicates.forEach(p => {
            if (this[p] !== undefined) {
                result[p as RelationshipPredicate] = this[p]!();
            }
        });
        return result as RelateResult<this>;
    }
}

import util from "../utility";
import assert from "../utility/assertion";

import BaseObject from "../base/BaseObject";
import Contain from "./Contain";
import Cross from "./Cross";
import Joint from "./Joint";
import Overlap from "./Overlap";
import Separate from "./Separate";
import Touch from "./Touch";
import Wrap from "./Wrap";

import type Geomtoy from "..";
import type { AnyRelationship, AnyShape, RelationshipMethod, RelationshipMethodName } from "../types";

class Relationship extends BaseObject {
    constructor(owner: Geomtoy) {
        super(owner);
        return Object.seal(this);
    }

    static relationshipOperators = {
        Contain,
        Cross,
        Joint,
        Overlap,
        Separate,
        Touch,
        Wrap
    };

    private _relationship<T extends AnyShape, U extends AnyShape, V extends AnyRelationship>(rsOp: V, shape: T, otherShape: U, quick?: boolean) {
        assert.isShape(shape, "shape");
        assert.isShape(otherShape, "otherShape");

        const type1 = shape.type;
        const type2 = otherShape.type;
        const opName = rsOp.name;
        const opVerb = rsOp.verb;
        const methodName = `${util.lowerFirstChar(type1)}${opVerb}${type2}` as RelationshipMethodName<T, U, V>;
        if (!(methodName in rsOp)) {
            throw new Error(`[G]There is no relationship of \`${opName}\` of \`${type1}\` and \`${type2}\`.`);
        } else {
            const method = rsOp[methodName] as RelationshipMethod<T, U, V>;
            return method.call(this, shape, otherShape, quick) as ReturnType<RelationshipMethod<T, U, V>>;
        }
    }

    contain<T extends AnyShape, U extends AnyShape>(shape: T, otherShape: U) {
        return this._relationship(Contain, shape, otherShape);
    }
    cross<T extends AnyShape, U extends AnyShape>(shape: T, otherShape: U, quick = false) {
        return this._relationship(Cross, shape, otherShape, quick);
    }

    toString(): string {
        return `${this.name}(${this.uuid}) owned by Geomtoy(${this.owner.uuid})`;
    }
    toArray() {
        return [];
    }
    toObject() {
        return {};
    }
}

export default Relationship;

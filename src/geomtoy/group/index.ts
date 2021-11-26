import { validAndWithSameOwner } from "../decorator"
import assert from "../utility/assertion"
import util from "../utility"

import BaseObject from "../base/BaseObject"

import type Geomtoy from ".."
import type Shape from "../base/Shape"

class Group extends BaseObject {
    public _items: Shape[] = []

    constructor(owner: Geomtoy, items: Shape[])
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any) {
        super(o)
        if (util.isArray(a1)) {
            Object.assign(this, { items: a1 })
        }
        return Object.seal(this)
    }

    get items() {
        return this._items
    }
    set items(value) {
        assert.isShapeArray(value, "items")
        this._items = value
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tlength: ${this.items.length}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return this.items
    }
    toObject() {
        return { items: this.items }
    }
}

validAndWithSameOwner(Group)
/**
 * @category BaseObject
 */
export default Group

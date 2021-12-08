import { validAndWithSameOwner } from "../decorator"
import assert from "../utility/assertion"
import util from "../utility"

import EventTarget from "../base/EventTarget"

import type Geomtoy from ".."
import type Shape from "../base/Shape"

class Group extends EventTarget {
    private _items: Shape[] = []

    constructor(owner: Geomtoy, items: Shape[])
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any) {
        super(o)
        if (util.isArray(a1)) {
            Object.assign(this, { items: a1 })
        }
        return Object.seal(this)
    }
    static readonly events = Object.freeze({
        itemsReset: "reset" as const,
        shapeAdded: "shapeAdd" as const,
        shapeRemoved: "shapeRemove" as const,
        shapeChanged: "shapeChange" as const
    });

    get items() {
        return this._items
    }
    set items(value) {
        assert.isShapeArray(value, "items")
        this._items = value
    }
    addShape(shape: Shape) {
        this._items
    }
    removeShape(shape: Shape) {
        
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
        return []
    }
    toObject() {
        return {}
    }
}

validAndWithSameOwner(Group)
/**
 * @category BaseObject
 */
export default Group

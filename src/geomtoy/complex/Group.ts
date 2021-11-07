import { validAndWithSameOwner } from "../decorator"
import assert from "../utility/assertion"
import util from "../utility"

import Geomtoy from ".."
import GeomObject from "../base/GeomObject"

class Group extends GeomObject {
    public _items: GeomObject[] = []

    constructor(owner: Geomtoy, items: GeomObject[])
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any) {
        super(o)
        if (util.isArray(a1)) {
            Object.assign(this, { items: a1 })
        }
        return Object.seal(this)
    }

    eventNames = Object.freeze([])

    get items() {
        return this._items
    }
    set items(value) {
        assert.isGeomObjectArray(value, "items")
        this._items = value
    }
    isValid(): boolean {
        return true
    }
    clone() {
        return new Group(this.owner, this.items)
    }
    copyFrom(group: Group | null) {
        if (group === null) {
            this._items = []
        } else {
            this._items = group._items
        }
        this.trigger(this.eventNames.join(" "))
        return this
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
 * @category GeomObject
 */
export default Group

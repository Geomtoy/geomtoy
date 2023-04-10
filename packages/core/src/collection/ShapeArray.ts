import { Utility } from "@geomtoy/util";
import Shape from "../base/Shape";
import EventSourceObject from "../event/EventSourceObject";
import Graphics from "../graphics";
import type { ParentShape, ViewportDescriptor } from "../types";
import { initArrayProxy } from "./helper";

export default class ShapeArray<T extends Shape> extends Shape implements ParentShape {
    private _items: T[] = [];
    private _itemsProxy!: T[];

    constructor(items: T[] = []) {
        super();
        Object.assign(this, { items });
        this._initProxy();
        this.initState_();
    }
    static override events = {
        itemsReset: "reset" as const,
        itemChanged: "itemChange" as const,
        itemAdded: "itemAdd" as const,
        itemRemoved: "itemRemove" as const
    };
    private _setItems(value: T[]) {
        if (Utility.is(this._items, value)) return;
        this._items.length = 0;
        for (const [i, v] of value.entries()) this._items[i] = v;
        this.trigger_(new EventSourceObject(this, ShapeArray.events.itemsReset));
    }
    get items() {
        return this._itemsProxy;
    }
    set items(value) {
        this._setItems(value);
    }
    private _initProxy() {
        this._itemsProxy = initArrayProxy.call<this, [T[]], T[]>(this, this._items);
    }

    move(deltaX: number, deltaY: number) {
        for (const item of this._items) {
            item.move(deltaX, deltaY);
        }
        return this;
    }
    clone() {
        return new ShapeArray(this._items);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new Graphics();
        for (const item of this._items) {
            g.concat(item.getGraphics(viewport));
        }
        return g;
    }
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            items: this._items.map(item => item.toJSON())
        };
    }
}

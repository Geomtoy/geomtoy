import { Utility } from "@geomtoy/util";
import Shape from "../base/Shape";
import EventSourceObject from "../event/EventSourceObject";
import Graphics from "../graphics";
import type { ParentShape, ViewportDescriptor } from "../types";
import { initObjectProxy } from "./helper";

export default class ShapeObject<T extends Shape> extends Shape implements ParentShape {
    private _items: { [key: string]: T } = {};
    private _itemsProxy!: { [key: string]: T };

    constructor(items: { [key: string]: T } = {}) {
        super();
        Object.assign(this, { items });
        this._initProxy();
    }
    static override events = {
        itemsReset: "reset" as const,
        itemChanged: "itemChange" as const,
        itemAdded: "itemAdd" as const,
        itemRemoved: "itemRemove" as const
    };
    private _setItems(value: { [key: string]: T }) {
        if (!Utility.is(this._items, value)) this.trigger_(new EventSourceObject(this, ShapeObject.events.itemsReset));
        for (const k of Object.keys(this._items)) delete this._items[k];
        for (const [k, v] of Object.entries(value)) this._items[k] = v;
    }
    get items() {
        return this._itemsProxy;
    }
    set items(value) {
        this._setItems(value);
    }
    private _initProxy() {
        this._itemsProxy = initObjectProxy.call<this, [{ [key: string]: T }], { [key: string]: T }>(this, this._items);
    }
    move(deltaX: number, deltaY: number) {
        for (const item of Object.values(this._items)) {
            item.move(deltaX, deltaY);
        }
        return this;
    }
    clone() {
        return new ShapeObject(this._items);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new Graphics();
        for (const item of Object.values(this._items)) {
            g.concat(item.getGraphics(viewport));
        }
        return g;
    }
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
            `\titems: {`,
            ...Object.entries(this._items).map(([key,item])=> `\t\t${key}: ${item.name}(${item.id})`),
            `\t}`,
            `}`
        ].join("\n")
    }
}

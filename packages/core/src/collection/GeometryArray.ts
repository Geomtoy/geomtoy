import { Box, Utility } from "@geomtoy/util";
import Geometry from "../base/Geometry";
import EventSourceObject from "../event/EventSourceObject";
import Graphics from "../graphics";
import Transformation from "../transformation";
import type { ParentShape, ViewportDescriptor } from "../types";
import { initArrayProxy } from "./helper";
import ShapeArray from "./ShapeArray";

export default class GeometryArray<T extends Geometry> extends Geometry implements ParentShape {
    private _items: T[] = [];
    private _itemsProxy!: T[];

    constructor(items: T[] = []) {
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
    private _setItems(value: T[]) {
        if (!Utility.isEqualTo(this._items, value)) this.trigger_(new EventSourceObject(this, ShapeArray.events.itemsReset));
        this._items.length = 0;
        for (const [i, v] of value.entries()) this._items[i] = v;
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

    initialized() {
        return true;
    }
    degenerate(check: false): this;
    degenerate(check: true): false;
    degenerate(check: boolean) {
        return check ? false : this;
    }

    getBoundingBox() {
        let bbox = Box.nullBox();
        for (const item of this._items) {
            const dg = item.degenerate(false);
            if (dg === null) continue;
            bbox = Box.extend(bbox, dg.getBoundingBox());
        }
        return bbox;
    }
    apply(transformation: Transformation) {
        const transformed = [] as Geometry[];
        for (const item of this._items) {
            const dg = item.degenerate(false);
            if (dg === null) continue;
            transformed.push(item.apply(transformation));
        }
        return new GeometryArray(transformed);
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
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.id}){`,
            `\titems: [`,
            ...this._items.map((item)=> `\t\t${item.name}(${item.id})`),
            `\t]`,
            `}`
        ].join("\n")
    }
}

import { Box, Utility } from "@geomtoy/util";
import Geometry from "../base/Geometry";
import EventSourceObject from "../event/EventSourceObject";
import Graphics from "../graphics";
import Transformation from "../transformation";
import { ViewportDescriptor } from "../types";
import { initObjectProxy } from "./helper";

export default class GeometryObject<T extends Geometry> extends Geometry {
    private _items: { [key: string]: T } = {};
    private _itemsProxy!: { [key: string]: T };

    constructor(items: { [key: string]: T } = {}) {
        super();
        Object.assign(this, { items });
        this._initProxy();
    }
    static override events = {
        itemsReset: "reset",
        itemChanged: "itemChange",
        itemAdded: "itemAdd",
        itemRemoved: "itemRemove"
    };
    private _setItems(value: { [key: string]: T }) {
        if (!Utility.isEqualTo(this._items, value)) this.trigger_(new EventSourceObject(this, GeometryObject.events.itemsReset));
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
        for (const item of Object.values(this._items)) {
            if (item.degenerate !== undefined) {
                const dg = item.degenerate(false);
                if (dg === null) continue;
                Box.extend(bbox, dg.getBoundingBox());
            }
            bbox = Box.extend(bbox, item.getBoundingBox());
        }
        return bbox;
    }
    apply(transformation: Transformation) {
        const transformed = {} as { [key: string]: Geometry };
        for (const [key, value] of Object.entries(this._items)) {
            const t = value.apply(transformation);
            if (t !== null) transformed[key] = t;
        }
        return new GeometryObject(transformed);
    }

    move(deltaX: number, deltaY: number) {
        for (const item of Object.values(this._items)) {
            item.move(deltaX, deltaY);
        }
        return this;
    }
    clone() {
        return new GeometryObject(this._items);
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

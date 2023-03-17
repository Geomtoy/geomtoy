import { Box } from "@geomtoy/util";
import Geometry from "../base/Geometry";
import Graphics from "../graphics";
import Transformation from "../transformation";
import type { ParentShape, ViewportDescriptor } from "../types";
import GeometryObject from "./GeometryObject";
import { initSealedObjectProxy } from "./helper";

export default class SealedGeometryObject<T extends { [key: string]: Geometry }> extends Geometry implements ParentShape {
    private _items: T;
    private _itemsProxy!: T;

    constructor(items: T) {
        super();
        this._items = { ...items };
        this._initProxy();
    }
    static override events = {
        itemChanged: "itemChange" as const
    };

    get items() {
        return this._itemsProxy;
    }

    private _initProxy() {
        this._itemsProxy = initSealedObjectProxy.call<this, [T], T>(this, this._items);
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
            const dg = item.degenerate(false);
            if (dg === null) continue;
            bbox = Box.extend(bbox, dg.getBoundingBox());
        }
        return bbox;
    }
    apply(transformation: Transformation) {
        const transformed = {} as { [key: string]: Geometry };
        for (const [key, value] of Object.entries(this._items)) {
            const dg = value.degenerate(false);
            if (dg === null) continue;
            transformed[key] = value.apply(transformation);
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
        return new SealedGeometryObject(this._items);
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

import { Box } from "@geomtoy/util";
import Geometry from "../base/Geometry";
import Graphics from "../graphics";
import { isParentShape } from "../misc/parent-shape";
import Transformation from "../transformation";
import type { ParentShape, ViewportDescriptor } from "../types";
import GeometryArray from "./GeometryArray";
import { initSealedArrayProxy } from "./helper";

export default class SealedGeometryArray<T extends Geometry[]> extends Geometry implements ParentShape {
    private _items: [...T];
    private _itemsProxy!: [...T];

    constructor(items: [...T]) {
        super();
        this._items = [...items];
        this._initProxy();
        this.initState_();
    }

    static override events = {
        itemChanged: "itemChange" as const
    };

    get items() {
        return this._itemsProxy;
    }

    private _initProxy() {
        this._itemsProxy = initSealedArrayProxy.call<this, [[...T]], [...T]>(this, this._items);
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
        return new SealedGeometryArray(this._items);
    }
    deepClone() {
        const ret = new SealedGeometryArray(this._items);
        for (const [i, v] of this._items.entries()) {
            if (isParentShape(v)) {
                ret._items[i as keyof T] = v.deepClone() as unknown as T[number];
            } else {
                ret._items[i as keyof T] = v.clone() as T[number];
            }
        }
        return ret;
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

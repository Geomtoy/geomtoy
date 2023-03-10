import { Box } from "@geomtoy/util";
import Geometry from "../base/Geometry";
import Graphics from "../graphics";
import Transformation from "../transformation";
import { ViewportDescriptor } from "../types";
import GeometryArray from "./GeometryArray";
import { initSealedArrayProxy } from "./helper";

export default class SealedGeometryArray<T extends Geometry[]> extends Geometry {
    private _items: [...T];
    private _itemsProxy!: [...T];

    constructor(items: [...T]) {
        super();
        this._items = [...items];
        this._initProxy();
    }

    static override events = {
        itemChanged: "itemChange"
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
            ...this._items.map(item=> `\t\t${item.name}(${item.id})`),
            `\t]`,
            `}`
        ].join("\n")
    }
}

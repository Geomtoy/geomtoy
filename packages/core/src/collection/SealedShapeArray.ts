import Shape from "../base/Shape";
import Graphics from "../graphics";
import type { ParentShape, ViewportDescriptor } from "../types";
import { initSealedArrayProxy } from "./helper";

export default class SealedShapeArray<T extends Shape[]> extends Shape implements ParentShape {
    private _items: [...T];
    private _itemsProxy!: [...T];

    constructor(items: [...T]) {
        super();
        this._items = [...items];
        this._initProxy();
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

    move(deltaX: number, deltaY: number) {
        for (const item of this._items) {
            item.move(deltaX, deltaY);
        }
        return this;
    }
    clone() {
        return new SealedShapeArray(this._items);
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

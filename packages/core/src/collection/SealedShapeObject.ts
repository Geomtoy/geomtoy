import Shape from "../base/Shape";
import Graphics from "../graphics";
import type { ParentShape, ViewportDescriptor } from "../types";
import { initSealedObjectProxy } from "./helper";

export default class SealedShapeObject<T extends { [key: string]: Shape }> extends Shape implements ParentShape {
    private _items: T;
    private _itemsProxy!: T;

    constructor(items: T) {
        super();
        this._items = { ...items };
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
        this._itemsProxy = initSealedObjectProxy.call<this, [T], T>(this, this._items);
    }

    move(deltaX: number, deltaY: number) {
        for (const item of Object.values(this._items)) {
            item.move(deltaX, deltaY);
        }
        return this;
    }
    clone() {
        return new SealedShapeObject(this._items);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new Graphics();
        for (const item of Object.values(this._items)) {
            g.concat(item.getGraphics(viewport));
        }
        return g;
    }

    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            items: Object.entries(this._items).reduce((acc, [key, item]) => {
                acc[key] = item.toJSON();
                return acc;
            }, {} as any)
        };
    }
}

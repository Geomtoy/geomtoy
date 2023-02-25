import { Assert, Box, Type, Utility } from "@geomtoy/util";
import EventSourceObject from "../../event/EventSourceObject";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import Arc from "../basic/Arc";
import Bezier from "../basic/Bezier";
import LineSegment from "../basic/LineSegment";
import Point from "../basic/Point";
import QuadraticBezier from "../basic/QuadraticBezier";

import Geometry from "../../base/Geometry";
import Graphics from "../../graphics";
import FillRuleHelper from "../../helper/FillRuleHelper";
import { statedWithBoolean } from "../../misc/decor-cache";
import { getCoordinates } from "../../misc/point-like";
import { parseSvgPath } from "../../misc/svg-path";
import Transformation from "../../transformation";
import { FillRule, ViewportDescriptor } from "../../types";
import Path from "./Path";
import Polygon from "./Polygon";

export default class Compound extends Geometry {
    private _fillRule: FillRule = "nonzero";
    private _items: (Path | Polygon)[] = [];

    constructor(items: (Path | Polygon)[], fillRule?: FillRule);
    constructor(fillRule?: FillRule);
    constructor(a0?: any, a1?: any) {
        super();
        if (Type.isArray(a0)) {
            Object.assign(this, { items: a0, fillRule: a1 ?? this._fillRule });
        }
        if (Type.isString(a0)) {
            Object.assign(this, { fillRule: a0 });
        }
    }

    static override events = {
        itemsReset: "reset" as const,
        itemAdded: "itemAdd" as const,
        itemRemoved: "itemRemove" as const,
        itemChanged: "itemChange" as const,
        fillRuleChanged: "fillRule" as const
    };
    private _setItems(value: (Path | Polygon)[]) {
        this.trigger_(new EventSourceObject(this, Compound.events.itemsReset));
        this._items = [...value];
    }
    private _setFillRule(value: FillRule) {
        if (!Utility.isEqualTo(this._fillRule, value)) this.trigger_(new EventSourceObject(this, Compound.events.fillRuleChanged));
        this._fillRule = value;
    }
    get items(): (Path | Polygon)[] {
        return [...this._items];
    }
    set items(value) {
        Assert.condition(Type.isArray(value) && value.every(item => item instanceof Path || item instanceof Polygon), "[G]The `items` should be an array of `Path` or `Polygon`.");
        this._setItems(value);
    }
    get fillRule() {
        return this._fillRule;
    }
    set fillRule(value) {
        this._setFillRule(value);
    }

    get itemCount() {
        return this._items.length;
    }

    static fromSvgString(data: string) {
        const paths = parseSvgPath(data);
        const compound = new Compound();
        for (const path of paths) {
            compound.appendItem(new Path(path.commands, path.closed));
        }
        return compound;
    }

    initialized() {
        return true;
    }
    move(deltaX: number, deltaY: number) {
        Assert.isRealNumber(deltaX, "deltaX");
        Assert.isRealNumber(deltaY, "deltaY");
        if (deltaX === 0 && deltaY === 0) return this;
        this._items.forEach((item, index) => {
            item.move(deltaX, deltaY);
            this.trigger_(new EventSourceObject(this, Compound.events.itemChanged, index));
        });
        return this;
    }

    @statedWithBoolean(false, false)
    getSegments(clean = false, assumeClosed = false) {
        return this._items.reduce((acc, item) => {
            acc.push(...item.getSegments(clean, assumeClosed));
            return acc;
        }, [] as (LineSegment | QuadraticBezier | Bezier | Arc)[]);
    }

    private _isCompoundItem(v: any): v is Path | Polygon {
        return v instanceof Polygon || v instanceof Path;
    }
    private _assertIsCompoundItem(value: any, p: string) {
        Assert.condition(this._isCompoundItem(value), `[G]The \`${p}\` should be a \`Path\` or \`Polygon\`.`);
    }

    getItem(index: number): Polygon | Path | null {
        return this._items[index] ?? null;
    }
    setItem(index: number, item: Polygon | Path) {
        this._assertIsCompoundItem(item, "item");
        const oldItem = this._items[index] ?? null;
        if (!Utility.isEqualTo(item, oldItem)) {
            this.trigger_(new EventSourceObject(this, Compound.events.itemChanged, index));
            this._items[index] = item;
        }
        return true;
    }
    insertItem(index: number, item: Polygon | Path) {
        this._assertIsCompoundItem(item, "item");
        if (this._items[index] === undefined) return false;
        this.trigger_(new EventSourceObject(this, Compound.events.itemAdded, index + 1));
        this._items.splice(index, 0, item);
        return index + 1;
    }
    removeItem(index: number) {
        if (this._items[index] === undefined) return false;
        this.trigger_(new EventSourceObject(this, Compound.events.itemRemoved, index));
        this._items.splice(index, 1);
        return true;
    }
    appendItem(item: Polygon | Path) {
        this._assertIsCompoundItem(item, "item");
        const index = this.itemCount;
        this.trigger_(new EventSourceObject(this, Compound.events.itemAdded, index));
        this._items.push(item);
        return index;
    }
    prependItem(item: Polygon | Path) {
        this._assertIsCompoundItem(item, "item");
        const index = 0;
        this.trigger_(new EventSourceObject(this, Compound.events.itemAdded, index));
        this._items.unshift(item);
        return index;
    }
    /**
     * Whether point `point` is on compound `this`.
     * @note
     * The `closed` property DOES effect this method.
     * @param point
     */
    isPointOn(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        return this._items.some(item => item.isPointOn(c));
    }
    /**
     * Whether point `point` is inside compound `this`.
     * @note
     * The `closed` property does NOT effect this method, and it is assumed to be true.
     * @param point
     */
    isPointInside(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const helper = new FillRuleHelper();
        if (this.fillRule === "nonzero") {
            const wn = helper.windingNumberOfPoint(c, 0, this.getSegments(true, true));
            if (wn === undefined) return false;
            return wn === 0 ? false : true;
        } else {
            const cn = helper.crossingNumberOfPoint(c, 0, this.getSegments(true, true));
            if (cn === undefined) return false;
            return cn % 2 === 0 ? false : true;
        }
    }
    /**
     * Whether point `point` is outside compound `this`.
     * @note
     * The `closed` property does NOT effect this method, and it is assumed to be true.
     * @param point
     */
    isPointOutside(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        const helper = new FillRuleHelper();
        if (this.fillRule === "nonzero") {
            const wn = helper.windingNumberOfPoint(c, 0, this.getSegments(true, true));
            if (wn === undefined) return false;
            return wn === 0 ? true : false;
        } else {
            const cn = helper.crossingNumberOfPoint(c, 0, this.getSegments(true, true));
            if (cn === undefined) return false;
            return cn % 2 === 0 ? true : false;
        }
    }

    clean() {
        const retCompound = new Compound(this._fillRule);
        for (const item of this._items) {
            retCompound.appendItem(item.clean());
        }
        return retCompound;
    }

    getBoundingBox() {
        let bbox = [Infinity, Infinity, -Infinity, -Infinity] as [number, number, number, number];
        for (const item of this._items) {
            bbox = Box.extend(bbox, item.getBoundingBox());
        }
        return bbox;
    }

    apply(transformation: Transformation) {
        const retCompound = new Compound();
        retCompound._fillRule = this._fillRule;
        this._items.forEach(item => {
            retCompound.appendItem(item.apply(transformation));
        });
        return retCompound;
    }
    getGraphics(viewport: ViewportDescriptor) {
        if (!this.initialized()) return new Graphics();

        const g = new Graphics();
        this._items.forEach(item => {
            const itemG = item.getGraphics(viewport);
            itemG.graphics.forEach(gg => {
                (gg as GeometryGraphic).fillRule = this.fillRule;
            });
            g.concat(itemG);
        });
        return g;
    }
    clone() {
        return new Compound(this._items);
    }
    copyFrom(shape: Compound | null) {
        if (shape === null) shape = new Compound();
        this._setItems(shape.items);
        return this;
    }
    override toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`, 
            `\titems: [`,
            ...this.items.map(item => `\t\t${item.name}(${item.uuid})`),
            `\t]`,
            `}`
        ].join("\n");
    }
}

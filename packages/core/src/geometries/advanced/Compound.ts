import { Assert, Type, Utility } from "@geomtoy/util";
import Shape from "../../base/Shape";
import Arc from "../basic/Arc";
import Bezier from "../basic/Bezier";
import LineSegment from "../basic/LineSegment";
import Point from "../basic/Point";
import QuadraticBezier from "../basic/QuadraticBezier";
import GeometryGraphics from "../../graphics/GeometryGraphics";
import EventObject from "../../event/EventObject";

import Transformation from "../../transformation";
import { statedWithBoolean } from "../../misc/decor-cache";
import Path from "./Path";
import Polygon from "./Polygon";
import { FillRule, ViewportDescriptor } from "../../types";
import FillRuleHelper from "../../helper/FillRuleHelper";
import { getCoordinates } from "../../misc/point-like";

export default class Compound extends Shape {
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

    get events() {
        return {
            itemsReset: "reset" as const,
            itemAdded: "itemAdd" as const,
            itemRemoved: "itemRemove" as const,
            itemChanged: "itemChange" as const,
            fillRuleChanged: "fillRuleChange" as const
        };
    }
    private _setItems(value: (Path | Polygon)[]) {
        if (!Utility.isEqualTo(this._items, value)) this.trigger_(EventObject.simple(this, this.events.itemsReset));
        this._items = [...value];
        this._items.forEach(item => (item.fillRule = this.fillRule));
    }
    private _setFillRule(value: FillRule) {
        if (!Utility.isEqualTo(this._fillRule, value)) this.trigger_(EventObject.simple(this, this.events.fillRuleChanged));
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

    protected initialized_() {
        return true;
    }

    move(deltaX: number, deltaY: number) {
        Assert.isRealNumber(deltaX, "deltaX");
        Assert.isRealNumber(deltaY, "deltaY");
        if (deltaX === 0 && deltaY === 0) return this;
        this._items.forEach(item => item.move(deltaX, deltaY));
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        Assert.isRealNumber(angle, "angle");
        Assert.isRealNumber(distance, "distance");
        if (distance === 0) return this;
        this._items.forEach(item => item.moveAlongAngle(angle, distance));
        return this;
    }
    getSegment(indexOrUuid: number | string) {}

    @statedWithBoolean(false, false)
    getSegments(excludeNotAllowed = false, assumeClosed = false) {
        return this._items.reduce((acc, item) => {
            acc.push(...item.getSegments(excludeNotAllowed, assumeClosed));
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
            this.trigger_(EventObject.collection(this, this.events.itemChanged, index, ""));
            this._items[index] = item;
        }
        return true;
    }
    insertItem(index: number, item: Polygon | Path) {
        this._assertIsCompoundItem(item, "item");
        if (this._items[index] === undefined) return false;
        this.trigger_(EventObject.collection(this, this.events.itemAdded, index + 1, ""));
        this._items.splice(index, 0, item);
        return index + 1;
    }
    removeItem(index: number) {
        if (this._items[index] === undefined) return false;
        this.trigger_(EventObject.collection(this, this.events.itemRemoved, index, ""));
        this._items.splice(index, 1);
        return true;
    }
    appendItem(item: Polygon | Path) {
        this._assertIsCompoundItem(item, "item");
        const index = this.itemCount;
        this.trigger_(EventObject.collection(this, this.events.itemAdded, index, ""));
        this._items.push(item);
        return index;
    }
    prependItem(item: Polygon | Path) {
        this._assertIsCompoundItem(item, "item");
        const index = 0;
        this.trigger_(EventObject.collection(this, this.events.itemAdded, index, ""));
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

    apply(transformation: Transformation) {
        const retCompound = new Compound();
        retCompound._fillRule = this._fillRule;
        this._items.forEach(item => {
            retCompound.appendItem(item.apply(transformation));
        });
        return retCompound;
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new GeometryGraphics();
        g.fillRule = this.fillRule;
        this._items.forEach(item => {
            g.append(item.getGraphics(viewport));
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
    override toString(): string {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`, 
            `\titems: [`,
            `${this.items.map(v => `\t\t${v.name}`).join(",\n")}`,
            `\t]`,
            `}`
        ].join("\n");
    }
    toArray(): any[] {
        throw this.items;
    }
    toObject(): object {
        throw new Error("Method not implemented.");
    }
}

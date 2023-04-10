import { Assert, Box, Type, Utility } from "@geomtoy/util";
import Geometry from "../../base/Geometry";
import EventSourceObject from "../../event/EventSourceObject";
import Graphics from "../../graphics";
import GeometryGraphic from "../../graphics/GeometryGraphic";
import FillRuleHelper from "../../helper/FillRuleHelper";
import { validGeometryArguments } from "../../misc/decor-geometry";
import { statedWithBoolean } from "../../misc/decor-stated";
import { getCoordinates } from "../../misc/point-like";
import { parseSvgPath } from "../../misc/svg-path";
import Transformation from "../../transformation";
import type { FillRule, ParentShape, ViewportDescriptor } from "../../types";
import Arc from "../basic/Arc";
import Bezier from "../basic/Bezier";
import LineSegment from "../basic/LineSegment";
import Point from "../basic/Point";
import QuadraticBezier from "../basic/QuadraticBezier";
import Path from "./Path";
import Polygon from "./Polygon";

export default class Compound extends Geometry implements ParentShape {
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
        this.initState_();
    }

    static override events = {
        itemsReset: "reset" as const,
        itemAdded: "itemAdd" as const,
        itemRemoved: "itemRemove" as const,
        itemChanged: "itemChange" as const,
        fillRuleChanged: "fillRule" as const
    };
    private _setItems(value: (Path | Polygon)[]) {
        this._items = value;
        this.trigger_(new EventSourceObject(this, Compound.events.itemsReset));
    }
    private _setFillRule(value: FillRule) {
        if (Utility.is(this._fillRule, value)) return;
        this._fillRule = value;
        this.trigger_(new EventSourceObject(this, Compound.events.fillRuleChanged));
    }
    get items(): (Path | Polygon)[] {
        return [...this._items];
    }
    set items(value) {
        Assert.condition(Type.isArray(value) && value.every(item => item instanceof Path || item instanceof Polygon), "[G]The `items` should be an array of `Path` or `Polygon`.");
        this._setItems([...value]);
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
    degenerate(check: false): this;
    degenerate(check: true): false;
    degenerate(check: boolean) {
        return check ? false : this;
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

    /**
     * Get the closest point on compound `this` from point `point`.
     * @param point
     */
    @validGeometryArguments
    getClosestPointFromPoint(point: [number, number] | Point) {
        const c = getCoordinates(point, "point");
        let minPoint = new Point();
        let minSd = Infinity;

        for (const seg of this.getSegments(true)) {
            const [p, sd] = seg.getClosestPointFromPoint(c);
            if (sd < minSd) {
                minPoint = p;
                minSd = sd;
            }
        }
        return [minPoint, minSd] as [point: Point, distanceSquare: number];
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
        if (Utility.is(item, oldItem)) return true;
        this._items[index] = item;
        this.trigger_(new EventSourceObject(this, Compound.events.itemChanged, index));
        return true;
    }
    insertItem(index: number, item: Polygon | Path) {
        this._assertIsCompoundItem(item, "item");
        if (this._items[index] === undefined) return false;
        this._items.splice(index, 0, item);
        this.trigger_(new EventSourceObject(this, Compound.events.itemAdded, index));
        return index;
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
        this._items.push(item);
        this.trigger_(new EventSourceObject(this, Compound.events.itemAdded, index));
        return index;
    }
    prependItem(item: Polygon | Path) {
        this._assertIsCompoundItem(item, "item");
        const index = 0;
        this._items.unshift(item);
        this.trigger_(new EventSourceObject(this, Compound.events.itemAdded, index));
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
        let bbox = Box.nullBox();
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
        const gg = new GeometryGraphic();
        gg.fillRule = this.fillRule;
        g.append(gg);

        for (const item of this._items) {
            const ig = item.getGraphics(viewport).graphics;
            if (ig.length === 0) continue;
            else {
                for (let i = 0, l = ig.length; i < l; i++) {
                    if (i === 0) {
                        gg.commands.push(...(ig[0] as GeometryGraphic).commands);
                    } else {
                        g.append(ig[i] as GeometryGraphic);
                    }
                }
            }
        }
        return g;
    }
    clone() {
        const ret = new Compound();
        ret._items = this._items.map(item => item.clone());
        ret._fillRule = this._fillRule;
        return ret;
    }
    copyFrom(shape: Compound | null) {
        if (shape === null) shape = new Compound();
        this._setItems(shape.items);
        return this;
    }
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            fillRule: this._fillRule,
            items: this._items.map(item => item.toJSON())
        };
    }
}

import { Assert, Coordinates, Size, Type, Utility, Vector2 } from "@geomtoy/util";
import Shape from "../base/Shape";
import EventSourceObject from "../event/EventSourceObject";
import Point from "../geometries/basic/Point";
import Graphics from "../graphics";
import ImageGraphic from "../graphics/ImageGraphic";
import { Anchor } from "../types";

const IMAGE_DEFAULT_WIDTH = 100;
const IMAGE_DEFAULT_HEIGHT = 100;
const IMAGE_DEFAULT_ANCHOR = Anchor.LeftTop;

export default class Image extends Shape {
    private _x = 0;
    private _y = 0;
    private _width = IMAGE_DEFAULT_WIDTH;
    private _height = IMAGE_DEFAULT_HEIGHT;
    private _sourceX = NaN;
    private _sourceY = NaN;
    private _sourceWidth = NaN;
    private _sourceHeight = NaN;
    private _source = "";
    private _consistent = false;
    private _anchor = IMAGE_DEFAULT_ANCHOR;

    constructor(x: number, y: number, width: number, height: number, source: string, consistent?: boolean, anchor?: Anchor);
    constructor(coordinates: [number, number], width: number, height: number, source: string, consistent?: boolean, anchor?: Anchor);
    constructor(point: Point, width: number, height: number, source: string, consistent?: boolean, anchor?: Anchor);
    constructor(x: number, y: number, size: [number, number], source: string, consistent?: boolean, anchor?: Anchor);
    constructor(coordinates: [number, number], size: [number, number], source: string, consistent?: boolean, anchor?: Anchor);
    constructor(point: Point, size: [number, number], source: string, consistent?: boolean, anchor?: Anchor);
    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        sourceX: number,
        sourceY: number,
        sourceWidth: number,
        sourceHeight: number,
        source: string,
        consistent?: boolean,
        anchor?: Anchor
    );
    constructor(
        coordinates: [number, number],
        width: number,
        height: number,
        sourceCoordinates: [number, number],
        sourceWidth: number,
        sourceHeight: number,
        source: string,
        consistent?: boolean,
        anchor?: Anchor
    );
    constructor(point: Point, width: number, height: number, sourcePoint: Point, sourceWidth: number, sourceHeight: number, source: string, consistent?: boolean, anchor?: Anchor);
    constructor(x: number, y: number, size: [number, number], sourceX: number, sourceY: number, sourceSize: [number, number], source: string, consistent?: boolean, anchor?: Anchor);
    constructor(coordinates: [number, number], size: [number, number], sourceCoordinates: [number, number], sourceSize: [number, number], source: string, consistent?: boolean, anchor?: Anchor);
    constructor(point: Point, size: [number, number], sourcePoint: Point, sourceSize: [number, number], source: string, consistent?: boolean, anchor?: Anchor);
    constructor(source: string, consistent?: boolean, anchor?: Anchor);
    constructor(consistent?: boolean, anchor?: Anchor);
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any, a8?: any, a9?: any, a10?: any) {
        super();
        if (Type.isNumber(a0)) {
            if (Type.isNumber(a2)) {
                if (Type.isString(a4)) {
                    Object.assign(this, { x: a0, y: a1, width: a2, height: a3, source: a4, consistent: a5 ?? this._consistent, anchor: a6 ?? this._anchor });
                }
                if (Type.isNumber(a4)) {
                    Object.assign(this, {
                        x: a0,
                        y: a1,
                        width: a2,
                        height: a3,
                        sourceX: a4,
                        sourceY: a5,
                        sourceWidth: a6,
                        sourceHeight: a7,
                        source: a8,
                        consistent: a9 ?? this._consistent,
                        anchor: a10 ?? this._anchor
                    });
                }
            }
            if (Type.isArray(a2)) {
                if (Type.isString(a3)) {
                    Object.assign(this, { x: a0, y: a1, size: a2, source: a3, consistent: a4 ?? this._consistent, anchor: a5 ?? this._anchor });
                }
                if (Type.isNumber(a3)) {
                    Object.assign(this, { x: a0, y: a1, size: a2, sourceX: a3, sourceY: a4, sourceSize: a5, source: a6, consistent: a7 ?? this._consistent, anchor: a8 ?? this._anchor });
                }
            }
        }
        if (Type.isArray(a0)) {
            if (Type.isNumber(a1)) {
                if (Type.isString(a3)) {
                    Object.assign(this, { coordinates: a0, width: a1, height: a2, source: a3, consistent: a4 ?? this._consistent, anchor: a5 ?? this._anchor });
                }
                if (Type.isArray(a3)) {
                    Object.assign(this, {
                        coordinates: a0,
                        width: a1,
                        height: a2,
                        sourceCoordinates: a3,
                        sourceWidth: a4,
                        sourceHeight: a5,
                        source: a6,
                        consistent: a7 ?? this._consistent,
                        anchor: a8 ?? this._anchor
                    });
                }
            }
            if (Type.isArray(a1)) {
                if (Type.isString(a2)) {
                    Object.assign(this, { coordinates: a0, size: a1, source: a2, consistent: a3 ?? this._consistent, anchor: a4 ?? this._anchor });
                }
                if (Type.isArray(a2)) {
                    Object.assign(this, { coordinates: a0, size: a1, sourceCoordinates: a2, sourceSize: a3, source: a4, consistent: a5 ?? this._consistent, anchor: a6 ?? this._anchor });
                }
            }
        }
        if (a0 instanceof Point) {
            if (Type.isNumber(a1)) {
                if (Type.isString(a3)) {
                    Object.assign(this, { point: a0, width: a1, height: a2, source: a3, consistent: a4 ?? this._consistent, anchor: a5 ?? this._anchor });
                }
                if (a3 instanceof Point) {
                    Object.assign(this, {
                        point: a0,
                        width: a1,
                        height: a2,
                        sourcePoint: a3,
                        sourceWidth: a4,
                        sourceHeight: a5,
                        source: a6,
                        consistent: a7 ?? this._consistent,
                        anchor: a8 ?? this._anchor
                    });
                }
            }
            if (Type.isArray(a1)) {
                if (Type.isString(a2)) {
                    Object.assign(this, { point: a0, size: a1, source: a2, consistent: a3 ?? this._consistent, anchor: a4 ?? this._anchor });
                }
                if (a2 instanceof Point) {
                    Object.assign(this, { point: a0, size: a1, sourcePoint: a2, sourceSize: a3, source: a4, consistent: a5 ?? this._consistent, anchor: a6 ?? this._anchor });
                }
            }
        }
        if (Type.isString(a0)) {
            Object.assign(this, {
                source: a0,
                consistent: a1 ?? this._consistent,
                anchor: a2 ?? this._anchor
            });
        }
        if (Type.isBoolean(a0)) {
            Object.assign(this, {
                consistent: a0 ?? this._consistent,
                anchor: a1 ?? this._anchor
            });
        }
        this.initState_();
    }

    static override events = {
        xChanged: "x" as const,
        yChanged: "y" as const,
        sourceXChanged: "sourceX" as const,
        sourceYChanged: "sourceY" as const,
        widthChanged: "width" as const,
        heightChanged: "height" as const,
        sourceWidthChanged: "sourceWidth" as const,
        sourceHeightChanged: "sourceHeight" as const,
        sourceChanged: "source" as const,
        consistentChanged: "consistent" as const,
        anchorChanged: "anchor" as const
    };

    private _setX(value: number) {
        if (Utility.is(this._x, value)) return;
        this._x = value;
        this.trigger_(new EventSourceObject(this, Image.events.xChanged));
    }
    private _setY(value: number) {
        if (Utility.is(this._y, value)) return;
        this._y = value;
        this.trigger_(new EventSourceObject(this, Image.events.yChanged));
    }
    private _setWidth(value: number) {
        if (Utility.is(this._width, value)) return;
        this._width = value;
        this.trigger_(new EventSourceObject(this, Image.events.widthChanged));
    }
    private _setHeight(value: number) {
        if (Utility.is(this._height, value)) return;
        this._height = value;
        this.trigger_(new EventSourceObject(this, Image.events.heightChanged));
    }
    private _setSourceX(value: number) {
        if (Utility.is(this._sourceX, value)) return;
        this._sourceX = value;
        this.trigger_(new EventSourceObject(this, Image.events.sourceXChanged));
    }
    private _setSourceY(value: number) {
        if (Utility.is(this._sourceY, value)) return;
        this._sourceY = value;
        this.trigger_(new EventSourceObject(this, Image.events.sourceYChanged));
    }
    private _setSourceWidth(value: number) {
        if (Utility.is(this._sourceWidth, value)) return;
        this._sourceWidth = value;
        this.trigger_(new EventSourceObject(this, Image.events.sourceWidthChanged));
    }
    private _setSourceHeight(value: number) {
        if (Utility.is(this._sourceHeight, value)) return;
        this._sourceHeight = value;
        this.trigger_(new EventSourceObject(this, Image.events.sourceHeightChanged));
    }
    private _setImageSource(value: string) {
        if (Utility.is(this._source, value)) return;
        this._source = value;
        this.trigger_(new EventSourceObject(this, Image.events.sourceChanged));
    }
    private _setConsistent(value: boolean) {
        if (Utility.is(this._consistent, value)) return;
        this._consistent = value;
        this.trigger_(new EventSourceObject(this, Image.events.consistentChanged));
    }
    private _setAnchor(value: Anchor) {
        if (Utility.is(this._anchor, value)) return;
        this._anchor = value;
        this.trigger_(new EventSourceObject(this, Image.events.anchorChanged));
    }

    get x() {
        return this._x;
    }
    set x(value) {
        Assert.isRealNumber(value, "x");
        this._setX(value);
    }
    get y() {
        return this._y;
    }
    set y(value) {
        Assert.isRealNumber(value, "y");
        this._setY(value);
    }
    get coordinates() {
        return [this._x, this._y] as [number, number];
    }
    set coordinates(value) {
        Assert.isCoordinates(value, "coordinates");
        this._setX(Coordinates.x(value));
        this._setY(Coordinates.y(value));
    }
    get point() {
        return new Point(this._x, this._y);
    }
    set point(value) {
        this._setX(value.x);
        this._setY(value.y);
    }
    get width() {
        return this._width;
    }
    set width(value) {
        Assert.isPositiveNumber(value, "width");
        this._setWidth(value);
    }
    get height() {
        return this._height;
    }
    set height(value) {
        Assert.isPositiveNumber(value, "height");
        this._setHeight(value);
    }
    get size() {
        return [this._width, this._height] as [number, number];
    }
    set size(value) {
        Assert.isNonZeroSize(value, "size");
        this._setWidth(Size.width(value));
        this._setHeight(Size.height(value));
    }

    get sourceX() {
        return this._sourceX;
    }
    set sourceX(value) {
        Assert.isRealNumber(value, "sourceX");
        this._setSourceX(value);
    }
    get sourceY() {
        return this._sourceY;
    }
    set sourceY(value) {
        Assert.isRealNumber(value, "sourceY");
        this._setSourceY(value);
    }
    get sourceCoordinates() {
        return [this._sourceX, this._sourceY] as [number, number];
    }
    set sourceCoordinates(value) {
        Assert.isCoordinates(value, "sourceCoordinates");
        this._setSourceX(Coordinates.x(value));
        this._setSourceY(Coordinates.y(value));
    }
    get sourcePoint() {
        return new Point(this._sourceX, this._sourceY);
    }
    set sourcePoint(value) {
        this._setSourceX(value.x);
        this._setSourceY(value.y);
    }
    get sourceWidth() {
        return this._sourceWidth;
    }
    set sourceWidth(value) {
        Assert.isPositiveNumber(value, "sourceWidth");
        this._setSourceWidth(value);
    }
    get sourceHeight() {
        return this._sourceHeight;
    }
    set sourceHeight(value) {
        Assert.isPositiveNumber(value, "sourceHeight");
        this._setSourceHeight(value);
    }
    get sourceSize() {
        return [this._sourceWidth, this._sourceHeight] as [number, number];
    }
    set sourceSize(value) {
        Assert.isNonZeroSize(value, "sourceSize");
        this._setSourceWidth(Size.width(value));
        this._setSourceHeight(Size.height(value));
    }
    get source() {
        return this._source;
    }
    set source(value) {
        this._setImageSource(value);
    }
    get consistent() {
        return this._consistent;
    }
    set consistent(value) {
        this._setConsistent(value);
    }
    get anchor() {
        return this._anchor;
    }
    set anchor(value) {
        this._setAnchor(value);
    }

    move(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }

    getGraphics() {
        const ig = new ImageGraphic();
        const g = new Graphics(ig);
        ig.image(this._x, this._y, this._width, this._height, this._sourceX, this._sourceY, this._sourceWidth, this._sourceHeight, this._source, this._consistent, this._anchor);
        return g;
    }
    clone() {
        return new Image(this._x, this._y, this._width, this._height, this._sourceX, this._sourceY, this._sourceWidth, this._sourceHeight, this._source, this._consistent, this._anchor);
    }
    copyFrom(shape: Image | null) {
        if (shape === null) shape = new Image();
        this._setX(shape._x);
        this._setY(shape._y);
        this._setWidth(shape._width);
        this._setHeight(shape._height);
        this._setSourceX(shape._sourceX);
        this._setSourceY(shape._sourceY);
        this._setSourceWidth(shape._sourceWidth);
        this._setSourceHeight(shape._sourceHeight);
        this._setImageSource(shape._source);
        this._setConsistent(shape._consistent);
        this._setAnchor(shape._anchor);
        return this;
    }
    override toJSON() {
        return {
            name: this.name,
            id: this.id,
            x: this._x,
            y: this._y,
            width: this._width,
            height: this._height,
            sourceX: this._sourceX,
            sourceY: this._sourceY,
            sourceWidth: this._sourceWidth,
            sourceHeight: this._sourceHeight,
            source: this._source,
            consistent: this._consistent,
            anchor: this._anchor
        };
    }
}

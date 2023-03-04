import { Assert, Coordinates, Type, Utility, Vector2 } from "@geomtoy/util";
import Shape from "../base/Shape";
import EventSourceObject from "../event/EventSourceObject";
import Point from "../geometries/basic/Point";
import Graphics from "../graphics";
import TextGraphic from "../graphics/TextGraphic";
import { TextAnchor, type FontConfig } from "../types";

const FONT_DEFAULT_CONFIG: FontConfig = {
    fontSize: 16,
    fontFamily: "sans-serif",
    fontBold: false,
    fontItalic: false
};
const TEXT_DEFAULT_ANCHOR = TextAnchor.LeftTop;

export default class Text extends Shape {
    private _x = 0;
    private _y = 0;
    private _offsetX = 0;
    private _offsetY = 0;
    private _text = "";
    private _font: FontConfig = { ...FONT_DEFAULT_CONFIG };
    private _anchor = TEXT_DEFAULT_ANCHOR;

    constructor(x: number, y: number, offsetX: number, offsetY: number, text: string, font?: FontConfig, anchor?: TextAnchor);
    constructor(coordinates: [number, number], offsetX: number, offsetY: number, text: string, font?: FontConfig, anchor?: TextAnchor);
    constructor(point: Point, offsetX: number, offsetY: number, text: string, font?: FontConfig, anchor?: TextAnchor);
    constructor(text: string, font?: FontConfig, anchor?: TextAnchor);
    constructor(font?: FontConfig, anchor?: TextAnchor);
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { x: a0, y: a1, offsetX: a2, offsetY: a3, text: a4, font: a5 ?? this._font, anchor: a6 ?? this._anchor });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { coordinates: a0, offsetX: a1, offsetY: a2, text: a3, font: a4 ?? this._font, anchor: a5 ?? this._anchor });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { point: a0, offsetX: a1, offsetY: a2, text: a3, font: a4 ?? this._font, anchor: a5 ?? this._anchor });
        }
        if (Type.isString(a0)) {
            Object.assign(this, { text: a0, font: a1 ?? this._font, anchor: a2 ?? this._anchor });
        }
        if (Type.isPlainObject(a0)) {
            Object.assign(this, { font: a0 ?? this._font, anchor: a1 ?? this._anchor });
        }
    }

    static override events = {
        xChanged: "x" as const,
        yChanged: "y" as const,
        offsetXChanged: "offsetX" as const,
        offsetYChanged: "offsetY" as const,
        textChanged: "text" as const,
        fontChanged: "font" as const,
        anchorChanged: "anchor" as const
    };

    private _setX(value: number) {
        if (!Utility.isEqualTo(this._x, value)) this.trigger_(new EventSourceObject(this, Text.events.xChanged, this._x));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.isEqualTo(this._y, value)) this.trigger_(new EventSourceObject(this, Text.events.yChanged));
        this._y = value;
    }
    private _setOffsetX(value: number) {
        if (!Utility.isEqualTo(this._offsetX, value)) this.trigger_(new EventSourceObject(this, Text.events.offsetXChanged));
        this._offsetX = value;
    }
    private _setOffsetY(value: number) {
        if (!Utility.isEqualTo(this._offsetY, value)) this.trigger_(new EventSourceObject(this, Text.events.offsetYChanged));
        this._offsetY = value;
    }
    private _setText(value: string) {
        if (!Utility.isEqualTo(this._text, value)) this.trigger_(new EventSourceObject(this, Text.events.textChanged));
        this._text = value;
    }
    private _setFont(value: Partial<FontConfig>) {
        if (!Utility.isEqualTo(this.font, value)) this.trigger_(new EventSourceObject(this, Text.events.fontChanged));
        this._font = { ...this._font, ...value };
    }
    private _setAnchor(value: TextAnchor) {
        if (!Utility.isEqualTo(this._anchor, value)) this.trigger_(new EventSourceObject(this, Text.events.anchorChanged));
        this._anchor = value;
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
    get offsetX() {
        return this._offsetX;
    }
    set offsetX(value) {
        this._setOffsetX(value);
    }
    get offsetY() {
        return this._offsetY;
    }
    set offsetY(value) {
        this._setOffsetY(value);
    }
    get text() {
        return this._text;
    }
    set text(value) {
        this._setText(value);
    }
    get font(): FontConfig {
        return { ...this._font };
    }
    set font(value: Partial<FontConfig>) {
        this._setFont(value);
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
        const tg = new TextGraphic();
        const g = new Graphics(tg);
        const {
            x,
            y,
            offsetX,
            offsetY,
            text,
            font: { fontSize, fontFamily, fontBold, fontItalic },
            anchor
        } = this;
        tg.text(x, y, offsetX, offsetY, text, fontSize, fontFamily, fontBold, fontItalic, anchor);
        return g;
    }
    clone() {
        return new Text(this._x, this._y, this._offsetX, this._offsetY, this._text, this._font, this._anchor);
    }
    copyFrom(shape: Text | null) {
        if (shape === null) shape = new Text();
        this._setX(shape._x);
        this._setY(shape._y);
        this._setOffsetX(shape._offsetX);
        this._setOffsetY(shape._offsetY);
        this._setText(shape._text);
        this._setFont(shape._font);
        this._setAnchor(shape._anchor);
        return this;
    }
    override toString() {
        return [
            `${this.name}(${this.id}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\toffsetX: ${this.offsetX}`,
            `\toffsetY: ${this.offsetY}`,
            `\ttext: ${this.text}`,
            `\tfont: ${JSON.stringify(this._font)}`,
            `\tanchor: ${this.anchor}`,
            `\t}`,
            `}`
        ].join("\n");
    }
}

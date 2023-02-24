import { Assert, Coordinates, Type, Utility, Vector2 } from "@geomtoy/util";

import Shape from "../base/Shape";
import EventSourceObject from "../event/EventSourceObject";
import Point from "../geometries/basic/Point";
import Graphics from "../graphics";
import TextGraphic from "../graphics/TextGraphic";

import type { FontConfig } from "../types";

const FONT_DEFAULT_CONFIG: FontConfig = {
    fontSize: 16,
    fontFamily: "sans-serif",
    fontBold: false,
    fontItalic: false
};

export default class Text extends Shape {
    private _x = 0;
    private _y = 0;
    private _offsetX = 0;
    private _offsetY = 0;
    private _text = "";
    private _font: FontConfig = Utility.cloneDeep(FONT_DEFAULT_CONFIG);

    constructor(x: number, y: number, offsetX: number, offsetY: number, text: string, font?: FontConfig);
    constructor(coordinates: [number, number], offsetX: number, offsetY: number, text: string, font?: FontConfig);
    constructor(point: Point, offsetX: number, offsetY: number, text: string, font?: FontConfig);
    constructor(text: string, font?: FontConfig);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { x: a0, y: a1, offsetX: a2, offsetY: a3, text: a4, font: a5 ?? this._font });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { coordinates: a0, offsetX: a1, offsetY: a2, text: a3, font: a4 ?? this._font });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { point: a0, offsetX: a1, offsetY: a2, text: a3, font: a4 ?? this._font });
        }
        if (Type.isString(a0)) {
            Object.assign(this, { text: a0, font: a1 ?? this._font });
        }
    }

    static override events = {
        xChanged: "x" as const,
        yChanged: "y" as const,
        offsetXChanged: "offsetX" as const,
        offsetYChanged: "offsetY" as const,
        textChanged: "text" as const
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
        return Utility.cloneDeep(this._font);
    }
    set font(value: Partial<FontConfig>) {
        Utility.assignDeep(this._font, value);
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
            font: { fontSize, fontFamily, fontBold, fontItalic }
        } = this;
        tg.text(x, y, offsetX, offsetY, text, fontSize, fontFamily, fontBold, fontItalic);
        return g;
    }
    clone() {
        return new Text(this.x, this.y, this.offsetX, this.offsetY, this.text, this.font);
    }
    copyFrom(shape: Text | null) {
        if (shape === null) shape = new Text();
        this._setX(shape._x);
        this._setY(shape._y);
        this._setOffsetX(shape._offsetX);
        this._setOffsetY(shape._offsetY);
        this._setText(shape._text);
        this.font = shape._font;
        return this;
    }
    override toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\toffsetX: ${this.offsetX}`,
            `\toffsetY: ${this.offsetY}`,
            `\ttext: ${this.text}`,
            `\tfont: ${JSON.stringify(this._font)}`,
            `\t}`,
            `}`
        ].join("\n");
    }
}

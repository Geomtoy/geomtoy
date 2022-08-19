import { Assert, Type, Utility, Coordinates, Vector2 } from "@geomtoy/util";

import Shape from "../base/Shape";
import Point from "../geometries/basic/Point";
import TextGraphics from "../graphics/TextGraphics";
import EventObject from "../event/EventObject";

import type { FontConfig } from "../types";

const FONT_DEFAULT_CONFIG: FontConfig = {
    fontSize: 16,
    fontFamily: "sans-serif",
    fontBold: false,
    fontItalic: false
};

export default class Text extends Shape {
    constantSize = true;

    private _x = NaN;
    private _y = NaN;
    private _text = "";
    private _font: FontConfig = Utility.cloneDeep(FONT_DEFAULT_CONFIG);

    constructor(x: number, y: number, text: string, font?: FontConfig);
    constructor(coordinates: [number, number], text: string, font?: FontConfig);
    constructor(point: Point, text: string, font?: FontConfig);
    constructor(text: string, font?: FontConfig);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any) {
        super();
        if (Type.isNumber(a0)) {
            Object.assign(this, { x: a0, y: a1, text: a2, font: a3 ?? this._font });
        }
        if (Type.isArray(a0)) {
            Object.assign(this, { coordinates: a0, text: a1, font: a2 ?? this._font });
        }
        if (a0 instanceof Point) {
            Object.assign(this, { point: a0, text: a1, font: a2 ?? this._font });
        }
        if (Type.isString(a0)) {
            Object.assign(this, { text: a0, font: a1 ?? this._font });
        }
    }

    get events() {
        return {
            xChanged: "x" as const,
            yChanged: "y" as const,
            textChanged: "text" as const
        };
    }

    private _setX(value: number) {
        if (!Utility.isEqualTo(this._x, value)) this.trigger_(EventObject.simple(this, this.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.isEqualTo(this._y, value)) this.trigger_(EventObject.simple(this, this.events.yChanged));
        this._y = value;
    }
    private _setText(value: string) {
        if (!Utility.isEqualTo(this._text, value)) this.trigger_(EventObject.simple(this, this.events.textChanged));
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

    protected initialized_() {
        // prettier-ignore
        return (
            !Number.isNaN(this._x) &&
            !Number.isNaN(this._y)
        );
    }

    move(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        this.coordinates = Vector2.add(this.coordinates, Vector2.from2(angle, distance));
        return this;
    }

    getGraphics() {
        const g = new TextGraphics();
        if (!this.initialized_()) return g;
        const {
            constantSize,
            x,
            y,
            text,
            font: { fontSize, fontFamily, fontBold, fontItalic }
        } = this;
        g.text(constantSize, x, y, text, fontSize, fontFamily, fontBold, fontItalic);
        return g;
    }
    clone() {
        return new Text(this.x, this.y, this.text, this.font);
    }
    copyFrom(shape: Text | null) {
        if (shape === null) shape = new Text();
        this._setX(shape._x);
        this._setY(shape._y);
        this._setText(shape._text);
        this.font = shape._font;
        return this;
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\ttext: ${this.text}`,
            `\tfont: {`,
            `\t\tfontSize: ${this._font.fontSize}`,
            `\t\tfontFamily: ${this._font.fontFamily}`,
            `\t\tfontBold: ${this._font.fontBold}`,
            `\t\tfontItalic: ${this._font.fontItalic}`,
            `\t}`,
            `}`
        ].join("\n");
    }
    toArray() {
        return [this.x, this.y, this.text, { fontSize: this._font.fontSize, fontFamily: this._font.fontFamily, fontBold: this._font.fontBold, fontItalic: this._font.fontItalic }];
    }
    toObject() {
        return {
            x: this.x,
            y: this.y,
            text: this.text,
            font: {
                fontSize: this._font.fontSize,
                fontFamily: this._font.fontFamily,
                fontBold: this._font.fontBold,
                fontItalic: this._font.fontItalic
            }
        };
    }
}

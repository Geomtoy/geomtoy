import { Assert, Type, Utility, Coordinates, Vector2 } from "@geomtoy/util";
import { validAndWithSameOwner } from "../../decorator";

import Shape from "../../base/Shape";
import Point from "./Point";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../../geomtoy";
import type { FontConfig } from "../../types";

const defaultFontConfig: FontConfig = {
    fontSize: 16,
    fontFamily: "sans-serif",
    fontBold: false,
    fontItalic: false
};

class Text extends Shape {
    private _x = NaN;
    private _y = NaN;
    private _text = "";
    private _font: FontConfig = Utility.cloneDeep(defaultFontConfig);

    constructor(owner: Geomtoy, x: number, y: number, text: string, font?: FontConfig);
    constructor(owner: Geomtoy, coordinates: [number, number], text: string, font?: FontConfig);
    constructor(owner: Geomtoy, point: Point, text: string, font?: FontConfig);
    constructor(owner: Geomtoy, text: string, font?: FontConfig);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any) {
        super(o);
        if (Type.isNumber(a1)) {
            Object.assign(this, { x: a1, y: a2, text: a3, font: a4 ?? Utility.cloneDeep(defaultFontConfig) });
        }
        if (Type.isArray(a1)) {
            Object.assign(this, { coordinates: a1, text: a2, font: a3 ?? Utility.cloneDeep(defaultFontConfig) });
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point: a1, text: a2, font: a3 ?? Utility.cloneDeep(defaultFontConfig) });
        }
        if (Type.isString(a1)) {
            Object.assign(this, { text: a1, font: a2 ?? Utility.cloneDeep(defaultFontConfig) });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        xChanged: "x" as const,
        yChanged: "y" as const,
        textChanged: "text" as const
    });

    private _setX(value: number) {
        if (!Utility.isEqualTo(this._x, value)) this.trigger_(EventObject.simple(this, Text.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.isEqualTo(this._y, value)) this.trigger_(EventObject.simple(this, Text.events.yChanged));
        this._y = value;
    }
    private _setText(value: string) {
        if (!Utility.isEqualTo(this._text, value)) this.trigger_(EventObject.simple(this, Text.events.textChanged));
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
        return new Point(this.owner, this._x, this._y);
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

    isValid() {
        if (!Coordinates.isValid(this.coordinates)) return false;
        if (this.text === "") return false;
        return true;
    }

    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    moveSelf(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    moveAlongAngleSelf(angle: number, distance: number) {
        this.coordinates = Vector2.add(this.coordinates, Vector2.from2(angle, distance));
        return this;
    }

    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;
        const {
            x,
            y,
            text,
            font: { fontSize, fontFamily, fontBold, fontItalic }
        } = this;
        g.text(x, y, text, fontSize, fontFamily, fontBold, fontItalic);
        return g;
    }
    clone() {
        return new Text(this.owner, this.x, this.y, this.text, this.font);
    }
    copyFrom(shape: Text | null) {
        if (shape === null) shape = new Text(this.owner);
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
            `} owned by Geomtoy(${this.owner.uuid})`
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
validAndWithSameOwner(Text);

export default Text;

import { Assert, Coordinates, Size, Type, Utility, Vector2 } from "@geomtoy/util";

import Shape from "../base/Shape";
import EventSourceObject from "../event/EventSourceObject";
import Point from "../geometries/basic/Point";
import Graphics from "../graphics";
import ImageGraphic from "../graphics/ImageGraphic";

const IMAGE_DEFAULT_WIDTH = 100;
const IMAGE_DEFAULT_HEIGHT = 100;

export default class Image extends Shape {
    private _x = 0;
    private _y = 0;
    private _width = IMAGE_DEFAULT_WIDTH;
    private _height = IMAGE_DEFAULT_HEIGHT;
    private _sourceX = NaN;
    private _sourceY = NaN;
    private _sourceWidth = NaN;
    private _sourceHeight = NaN;
    private _imageSource: string = "";

    constructor(x: number, y: number, width: number, height: number, imageSource: string);
    constructor(coordinates: [number, number], width: number, height: number, imageSource: string);
    constructor(point: Point, width: number, height: number, imageSource: string);
    constructor(x: number, y: number, size: [number, number], imageSource: string);
    constructor(coordinates: [number, number], size: [number, number], imageSource: string);
    constructor(point: Point, size: [number, number], imageSource: string);
    constructor(x: number, y: number, width: number, height: number, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, imageSource: string);
    constructor(coordinates: [number, number], width: number, height: number, sourceCoordinates: [number, number], sourceWidth: number, sourceHeight: number, imageSource: string);
    constructor(point: Point, width: number, height: number, sourcePoint: Point, sourceWidth: number, sourceHeight: number, imageSource: string);
    constructor(x: number, y: number, size: [number, number], sourceX: number, sourceY: number, sourceSize: [number, number], imageSource: string);
    constructor(coordinates: [number, number], size: [number, number], sourceCoordinates: [number, number], sourceSize: [number, number], imageSource: string);
    constructor(point: Point, size: [number, number], sourcePoint: Point, sourceSize: [number, number], imageSource: string);
    constructor(imageSource: string);
    constructor();
    constructor(a0?: any, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any, a8?: any) {
        super();
        if (Type.isNumber(a0)) {
            if (Type.isNumber(a2)) {
                if (Type.isString(a4)) {
                    Object.assign(this, { x: a0, y: a1, width: a2, height: a3, imageSource: a4 });
                }
                if (Type.isNumber(a4)) {
                    Object.assign(this, { x: a0, y: a1, width: a2, height: a3, sourceX: a4, sourceY: a5, sourceWidth: a6, sourceHeight: a7, imageSource: a8 });
                }
            }
            if (Type.isArray(a2)) {
                if (Type.isString(a3)) {
                    Object.assign(this, { x: a0, y: a1, size: a2, imageSource: a3 });
                }
                if (Type.isNumber(a3)) {
                    Object.assign(this, { x: a0, y: a1, size: a2, sourceX: a3, sourceY: a4, sourceSize: a5, imageSource: a6 });
                }
            }
        }
        if (Type.isArray(a0)) {
            if (Type.isNumber(a1)) {
                if (Type.isString(a3)) {
                    Object.assign(this, { coordinates: a0, width: a1, height: a2, imageSource: a3 });
                }
                if (Type.isArray(a3)) {
                    Object.assign(this, { coordinates: a0, width: a1, height: a2, sourceCoordinates: a3, sourceWidth: a4, sourceHeight: a5, imageSource: a6 });
                }
            }
            if (Type.isArray(a1)) {
                if (Type.isString(a2)) {
                    Object.assign(this, { coordinates: a0, size: a1, imageSource: a2 });
                }
                if (Type.isArray(a2)) {
                    Object.assign(this, { coordinates: a0, size: a1, sourceCoordinates: a2, sourceSize: a3, imageSource: a4 });
                }
            }
        }
        if (a0 instanceof Point) {
            if (Type.isNumber(a1)) {
                if (Type.isString(a3)) {
                    Object.assign(this, { point: a0, width: a1, height: a2, imageSource: a3 });
                }
                if (a3 instanceof Point) {
                    Object.assign(this, { point: a0, width: a1, height: a2, sourcePoint: a3, sourceWidth: a4, sourceHeight: a5, imageSource: a6 });
                }
            }
            if (Type.isArray(a1)) {
                if (Type.isString(a2)) {
                    Object.assign(this, { point: a0, size: a1, imageSource: a2 });
                }
                if (a2 instanceof Point) {
                    Object.assign(this, { point: a0, size: a1, sourcePoint: a2, sourceSize: a3, imageSource: a4 });
                }
            }
        }
        if (Type.isString(a0)) {
            Object.assign(this, {
                imageSource: a0
            });
        }
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
        imageSourceChanged: "imageSource" as const
    };

    private _setX(value: number) {
        if (!Utility.isEqualTo(this._x, value)) this.trigger_(new EventSourceObject(this, Image.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!Utility.isEqualTo(this._y, value)) this.trigger_(new EventSourceObject(this, Image.events.yChanged));
        this._y = value;
    }
    private _setWidth(value: number) {
        if (!Utility.isEqualTo(this._width, value)) this.trigger_(new EventSourceObject(this, Image.events.widthChanged));
        this._width = value;
    }
    private _setHeight(value: number) {
        if (!Utility.isEqualTo(this._height, value)) this.trigger_(new EventSourceObject(this, Image.events.heightChanged));
        this._height = value;
    }
    private _setSourceX(value: number) {
        if (!Utility.isEqualTo(this._sourceX, value)) this.trigger_(new EventSourceObject(this, Image.events.sourceXChanged));
        this._sourceX = value;
    }
    private _setSourceY(value: number) {
        if (!Utility.isEqualTo(this._sourceY, value)) this.trigger_(new EventSourceObject(this, Image.events.sourceYChanged));
        this._sourceY = value;
    }
    private _setSourceWidth(value: number) {
        if (!Utility.isEqualTo(this._sourceWidth, value)) this.trigger_(new EventSourceObject(this, Image.events.sourceWidthChanged));
        this._sourceWidth = value;
    }
    private _setSourceHeight(value: number) {
        if (!Utility.isEqualTo(this._sourceHeight, value)) this.trigger_(new EventSourceObject(this, Image.events.sourceHeightChanged));
        this._sourceHeight = value;
    }
    private _setImageSource(value: string) {
        if (!Utility.isEqualTo(this._imageSource, value)) this.trigger_(new EventSourceObject(this, Image.events.imageSourceChanged));
        this._imageSource = value;
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
        Assert.isNonZeroLength(value, "width");
        this._setWidth(value);
    }
    get height() {
        return this._height;
    }
    set height(value) {
        Assert.isNonZeroLength(value, "height");
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
        Assert.isNonZeroLength(value, "sourceWidth");
        this._setSourceWidth(value);
    }
    get sourceHeight() {
        return this._sourceHeight;
    }
    set sourceHeight(value) {
        Assert.isNonZeroLength(value, "sourceHeight");
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
    get imageSource() {
        return this._imageSource;
    }
    set imageSource(value) {
        this._setImageSource(value);
    }

    move(deltaX: number, deltaY: number) {
        this.coordinates = Vector2.add(this.coordinates, [deltaX, deltaY]);
        return this;
    }

    getGraphics() {
        const ig = new ImageGraphic();
        const g = new Graphics(ig);
        const { x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight, imageSource } = this;
        ig.image(x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight, imageSource);
        return g;
    }
    clone() {
        return new Image(this.x, this.y, this.width, this.height, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.imageSource);
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
        this._setImageSource(shape._imageSource);
        return this;
    }
    override toString() {
        return [
            `${this.name}(${this.id}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\twidth: ${this.width}`,
            `\theight: ${this.height}`,
            `\tsourceX: ${this.sourceX}`,
            `\tsourceY: ${this.sourceY}`,
            `\tsourceWidth: ${this.sourceWidth}`,
            `\tsourceHeight: ${this.sourceHeight}`,
            `\timageSource: ${this.imageSource}`,
            `}`
        ].join("\n");
    }
}

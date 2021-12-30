import util from "../../utility";
import coord from "../../utility/coord";
import size from "../../utility/size";
import assert from "../../utility/assertion";
import { validAndWithSameOwner } from "../../decorator";

import Shape from "../../base/Shape";
import Point from "./Point";
import Graphics from "../../graphics";
import EventObject from "../../event/EventObject";

import type Geomtoy from "../..";

class Image extends Shape {
    private _x = NaN;
    private _y = NaN;
    private _width = NaN;
    private _height = NaN;
    private _sourceX = NaN;
    private _sourceY = NaN;
    private _sourceWidth = NaN;
    private _sourceHeight = NaN;
    private _imageSource: string = "";

    constructor(owner: Geomtoy, x: number, y: number, width: number, height: number, imageSource: string);
    constructor(owner: Geomtoy, coordinates: [number, number], width: number, height: number, imageSource: string);
    constructor(owner: Geomtoy, point: Point, width: number, height: number, imageSource: string);
    constructor(owner: Geomtoy, x: number, y: number, size: [number, number], imageSource: string);
    constructor(owner: Geomtoy, coordinates: [number, number], size: [number, number], imageSource: string);
    constructor(owner: Geomtoy, point: Point, size: [number, number], imageSource: string);
    constructor(owner: Geomtoy, x: number, y: number, width: number, height: number, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, imageSource: string);
    constructor(owner: Geomtoy, coordinates: [number, number], width: number, height: number, sourceCoordinates: [number, number], sourceWidth: number, sourceHeight: number, imageSource: string);
    constructor(owner: Geomtoy, point: Point, width: number, height: number, sourcePoint: Point, sourceWidth: number, sourceHeight: number, imageSource: string);
    constructor(owner: Geomtoy, x: number, y: number, size: [number, number], sourceX: number, sourceY: number, sourceSize: [number, number], imageSource: string);
    constructor(owner: Geomtoy, coordinates: [number, number], size: [number, number], sourceCoordinates: [number, number], sourceSize: [number, number], imageSource: string);
    constructor(owner: Geomtoy, point: Point, size: [number, number], sourcePoint: Point, sourceSize: [number, number], imageSource: string);
    constructor(owner: Geomtoy, imageSource: string);
    constructor(owner: Geomtoy);
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any, a8?: any, a9?: any) {
        super(o);
        if (util.isNumber(a1)) {
            if (util.isNumber(a3)) {
                if (util.isString(a5)) {
                    Object.assign(this, { x: a1, y: a2, width: a3, height: a4, imageSource: a5 });
                }
                if (util.isNumber(a5)) {
                    Object.assign(this, { x: a1, y: a2, width: a3, height: a4, sourceX: a5, sourceY: a6, sourceWidth: a7, sourceHeight: a8, imageSource: a9 });
                }
            }
            if (util.isArray(a3)) {
                if (util.isString(a4)) {
                    Object.assign(this, { x: a1, y: a2, size: a3, imageSource: a4 });
                }
                if (util.isNumber(a4)) {
                    Object.assign(this, { x: a1, y: a2, size: a3, sourceX: a4, sourceY: a5, sourceSize: a6, imageSource: a7 });
                }
            }
        }
        if (util.isArray(a1)) {
            if (util.isNumber(a2)) {
                if (util.isString(a4)) {
                    Object.assign(this, { coordinates: a1, width: a2, height: a3, imageSource: a4 });
                }
                if (util.isArray(a4)) {
                    Object.assign(this, { coordinates: a1, width: a2, height: a3, sourceCoordinates: a4, sourceWidth: a5, sourceHeight: a6, imageSource: a7 });
                }
            }
            if (util.isArray(a2)) {
                if (util.isString(a3)) {
                    Object.assign(this, { coordinates: a1, size: a2, imageSource: a3 });
                }
                if (util.isArray(a3)) {
                    Object.assign(this, { coordinates: a1, size: a2, sourceCoordinates: a3, sourceSize: a4, imageSource: a5 });
                }
            }
        }
        if (a1 instanceof Point) {
            if (util.isNumber(a2)) {
                if (util.isString(a4)) {
                    Object.assign(this, { point: a1, width: a2, height: a3, imageSource: a4 });
                }
                if (a4 instanceof Point) {
                    Object.assign(this, { point: a1, width: a2, height: a3, sourcePoint: a4, sourceWidth: a5, sourceHeight: a6, imageSource: a7 });
                }
            }
            if (util.isArray(a2)) {
                if (util.isString(a3)) {
                    Object.assign(this, { point: a1, size: a2, imageSource: a3 });
                }
                if (a3 instanceof Point) {
                    Object.assign(this, { point: a1, size: a2, sourcePoint: a3, sourceSize: a4, imageSource: a5 });
                }
            }
        }
        if (util.isString(a1)) {
            Object.assign(this, {
                imageSource: a1
            });
        }
        return Object.seal(this);
    }

    static readonly events = Object.freeze({
        xChanged: "x" as const,
        yChanged: "y" as const,
        sourceXChanged: "sourceX" as const,
        sourceYChanged: "sourceY" as const,
        widthChanged: "width" as const,
        heightChanged: "height" as const,
        sourceWidthChanged: "sourceWidth" as const,
        sourceHeightChanged: "sourceHeight" as const,
        imageSourceChanged: "imageSource" as const
    });

    private _setX(value: number) {
        if (!util.isEqualTo(this._x, value)) this.trigger_(EventObject.simple(this, Image.events.xChanged));
        this._x = value;
    }
    private _setY(value: number) {
        if (!util.isEqualTo(this._y, value)) this.trigger_(EventObject.simple(this, Image.events.yChanged));
        this._y = value;
    }
    private _setWidth(value: number) {
        if (!util.isEqualTo(this._width, value)) this.trigger_(EventObject.simple(this, Image.events.widthChanged));
        this._width = value;
    }
    private _setHeight(value: number) {
        if (!util.isEqualTo(this._height, value)) this.trigger_(EventObject.simple(this, Image.events.heightChanged));
        this._height = value;
    }
    private _setSourceX(value: number) {
        if (!util.isEqualTo(this._sourceX, value)) this.trigger_(EventObject.simple(this, Image.events.sourceXChanged));
        this._sourceX = value;
    }
    private _setSourceY(value: number) {
        if (!util.isEqualTo(this._sourceY, value)) this.trigger_(EventObject.simple(this, Image.events.sourceYChanged));
        this._sourceY = value;
    }
    private _setSourceWidth(value: number) {
        if (!util.isEqualTo(this._sourceWidth, value)) this.trigger_(EventObject.simple(this, Image.events.sourceWidthChanged));
        this._sourceWidth = value;
    }
    private _setSourceHeight(value: number) {
        if (!util.isEqualTo(this._sourceHeight, value)) this.trigger_(EventObject.simple(this, Image.events.sourceHeightChanged));
        this._sourceHeight = value;
    }
    private _setImageSource(value: string) {
        if (!util.isEqualTo(this._imageSource, value)) this.trigger_(EventObject.simple(this, Image.events.imageSourceChanged));
        this._imageSource = value;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        assert.isRealNumber(value, "x");
        this._setX(value);
    }
    get y() {
        return this._y;
    }
    set y(value) {
        assert.isRealNumber(value, "y");
        this._setY(value);
    }
    get coordinates() {
        return [this._x, this._y] as [number, number];
    }
    set coordinates(value) {
        assert.isCoordinates(value, "coordinates");
        this._setX(coord.x(value));
        this._setY(coord.y(value));
    }
    get point() {
        return new Point(this.owner, this._x, this._y);
    }
    set point(value) {
        this._setX(value.x);
        this._setY(value.y);
    }
    get width() {
        return this._width;
    }
    set width(value) {
        assert.isPositiveNumber(value, "width");
        this._setWidth(value);
    }
    get height() {
        return this._height;
    }
    set height(value) {
        assert.isPositiveNumber(value, "height");
        this._setHeight(value);
    }
    get size() {
        return [this._width, this._height] as [number, number];
    }
    set size(value) {
        assert.isSize(value, "size");
        this._setWidth(size.width(value));
        this._setHeight(size.height(value));
    }

    get sourceX() {
        return this._sourceX;
    }
    set sourceX(value) {
        assert.isRealNumber(value, "sourceX");
        this._setSourceX(value);
    }
    get sourceY() {
        return this._sourceY;
    }
    set sourceY(value) {
        assert.isRealNumber(value, "sourceY");
        this._setSourceY(value);
    }
    get sourceCoordinates() {
        return [this._sourceX, this._sourceY] as [number, number];
    }
    set sourceCoordinates(value) {
        assert.isCoordinates(value, "sourceCoordinates");
        this._setSourceX(coord.x(value));
        this._setSourceY(coord.y(value));
    }
    get sourcePoint() {
        return new Point(this.owner, this._sourceX, this._sourceY);
    }
    set sourcePoint(value) {
        this._setSourceX(value.x);
        this._setSourceY(value.y);
    }
    get sourceWidth() {
        return this._sourceWidth;
    }
    set sourceWidth(value) {
        assert.isPositiveNumber(value, "sourceWidth");
        this._setSourceWidth(value);
    }
    get sourceHeight() {
        return this._sourceHeight;
    }
    set sourceHeight(value) {
        assert.isPositiveNumber(value, "sourceHeight");
        this._setSourceHeight(value);
    }
    get sourceSize() {
        return [this._sourceWidth, this._sourceHeight] as [number, number];
    }
    set sourceSize(value) {
        assert.isSize(value, "sourceSize");
        this._setSourceWidth(size.width(value));
        this._setSourceHeight(size.height(value));
    }
    get imageSource() {
        return this._imageSource;
    }
    set imageSource(value) {
        this._setImageSource(value);
    }

    isValid() {
        const { coordinates: c, size: s } = this;
        if (!coord.isValid(c)) return false;
        if (!size.isValid(s)) return false;
        if (this._imageSource === "") return false;
        return true;
    }
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY);
    }
    /**
     * Move text `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.coordinates = coord.move(this.coordinates, deltaX, deltaY);
        return this;
    }
    /**
     * Move text `this` with `distance` along `angle` to get new text.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance);
    }
    /**
     * Move text `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.coordinates = coord.moveAlongAngle(this.coordinates, angle, distance);
        return this;
    }

    getGraphics() {
        const g = new Graphics();
        if (!this.isValid()) return g;

        const { x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight, imageSource } = this;
        g.image(x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight, imageSource);
        return g;
    }
    clone() {
        return new Image(this.owner, this.x, this.y, this.width, this.height, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, this.imageSource);
    }
    copyFrom(shape: Image | null) {
        if (shape === null) shape = new Image(this.owner);
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
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tx: ${this.x}`,
            `\ty: ${this.y}`,
            `\twidth: ${this.width}`,
            `\theight: ${this.height}`,
            `\tsourceX: ${this.sourceX}`,
            `\tsourceY: ${this.sourceY}`,
            `\tsourceWidth: ${this.sourceWidth}`,
            `\tsourceHeight: ${this.sourceHeight}`,
            `\timageSource: ${this.imageSource}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n");
    }
    toArray() {
        return [this.x, this.y, this.width, this.height, this.sourceX, this.sourceY, this.sourceWidth, this._sourceHeight, this.imageSource];
    }
    toObject() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            sourceX: this.sourceX,
            sourceY: this.sourceY,
            sourceWidth: this.sourceWidth,
            sourceHeight: this.sourceHeight,
            imageSource: this.imageSource
        };
    }
}
validAndWithSameOwner(Image);
/**
 * @category Shape
 */
export default Image;

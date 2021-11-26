import util from "../../utility"
import coord from "../../utility/coordinate"
import size from "../../utility/size"
import assert from "../../utility/assertion"
import { validAndWithSameOwner } from "../../decorator"

import Shape from "../../base/Shape"
import Point from "./Point"
import Graphics from "../../graphics"

import type Geomtoy from "../.."

class Image extends Shape {
    private _coordinate: [number, number] = [NaN, NaN]
    private _sourceCoordinate: [number, number] = [NaN, NaN]
    private _size: [number, number] = [NaN, NaN]
    private _sourceSize: [number, number] = [NaN, NaN]
    private _imageSource = ""

    constructor(owner: Geomtoy, x: number, y: number, width: number, height: number, imageSource: string)
    constructor(owner: Geomtoy, coordinate: [number, number], width: number, height: number, imageSource: string)
    constructor(owner: Geomtoy, point: Point, width: number, height: number, imageSource: string)

    constructor(owner: Geomtoy, x: number, y: number, size: [number, number], imageSource: string)
    constructor(owner: Geomtoy, coordinate: [number, number], size: [number, number], imageSource: string)
    constructor(owner: Geomtoy, point: Point, size: [number, number], imageSource: string)

    //prettier-ignore
    constructor(owner: Geomtoy, x: number, y: number, width: number, height: number, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, imageSource: string)
    //prettier-ignore
    constructor(owner: Geomtoy, coordinate: [number, number], width: number, height: number, sourceCoordinate: [number, number], sourceWidth: number, sourceHeight: number, imageSource: string)
    constructor(owner: Geomtoy, point: Point, width: number, height: number, sourcePoint: Point, sourceWidth: number, sourceHeight: number, imageSource: string)

    constructor(owner: Geomtoy, x: number, y: number, size: [number, number], sourceX: number, sourceY: number, sourceSize: [number, number], imageSource: string)
    constructor(owner: Geomtoy, coordinate: [number, number], size: [number, number], sourceCoordinate: [number, number], sourceSize: [number, number], imageSource: string)
    constructor(owner: Geomtoy, point: Point, size: [number, number], sourcePoint: Point, sourceSize: [number, number], imageSource: string)

    constructor(owner: Geomtoy, imageSource: string)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any, a8?: any, a9?: any) {
        super(o)
        if (util.isNumber(a1)) {
            if (util.isNumber(a3)) {
                if (util.isString(a5)) {
                    Object.assign(this, { x: a1, y: a2, width: a3, height: a4, imageSource: a5 })
                }
                if (util.isNumber(a5)) {
                    Object.assign(this, { x: a1, y: a2, width: a3, height: a4, sourceX: a5, sourceY: a6, sourceWidth: a7, sourceHeight: a8, imageSource: a9 })
                }
            }
            if (util.isArray(a3)) {
                if (util.isString(a4)) {
                    Object.assign(this, { x: a1, y: a2, size: a3, imageSource: a4 })
                }
                if (util.isNumber(a4)) {
                    Object.assign(this, { x: a1, y: a2, size: a3, sourceX: a4, sourceY: a5, sourceSize: a6, imageSource: a7 })
                }
            }
        }
        if (util.isArray(a1)) {
            if (util.isNumber(a2)) {
                if (util.isString(a4)) {
                    Object.assign(this, { coordinate: a1, width: a2, height: a3, imageSource: a4 })
                }
                if (util.isArray(a4)) {
                    Object.assign(this, { coordinate: a1, width: a2, height: a3, sourceCoordinate: a4, sourceWidth: a5, sourceHeight: a6, imageSource: a7 })
                }
            }
            if (util.isArray(a2)) {
                if (util.isString(a3)) {
                    Object.assign(this, { coordinate: a1, size: a2, imageSource: a3 })
                }
                if (util.isArray(a3)) {
                    Object.assign(this, { coordinate: a1, size: a2, sourceCoordinate: a3, sourceSize: a4, imageSource: a5 })
                }
            }
        }
        if (a1 instanceof Point) {
            if (util.isNumber(a2)) {
                if (util.isString(a4)) {
                    Object.assign(this, { point: a1, width: a2, height: a3, imageSource: a4 })
                }
                if (a4 instanceof Point) {
                    Object.assign(this, { point: a1, width: a2, height: a3, sourcePoint: a4, sourceWidth: a5, sourceHeight: a6, imageSource: a7 })
                }
            }
            if (util.isArray(a2)) {
                if (util.isString(a3)) {
                    Object.assign(this, { point: a1, size: a2, imageSource: a3 })
                }
                if (a3 instanceof Point) {
                    Object.assign(this, { point: a1, size: a2, sourcePoint: a3, sourceSize: a4, imageSource: a5 })
                }
            }
        }
        if (util.isString(a1)) {
            Object.assign(this, {
                imageSource: a1
            })
        }
        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        xChanged: "xChanged",
        yChanged: "yChanged",
        sourceXChanged: "sourceXChanged",
        sourceYChanged: "sourceYChanged",
        widthChanged: "widthChanged",
        heightChanged: "heightChanged",
        sourceWidthChanged: "sourceWidthChanged",
        sourceHeightChanged: "sourceHeightChanged",
        imageSourceChanged: "imageSourceChanged"
    })

    private _setX(value: number) {
        this.willTrigger_(coord.x(this._coordinate), value, [Image.events.xChanged])
        coord.x(this._coordinate, value)
    }
    private _setY(value: number) {
        this.willTrigger_(coord.y(this._coordinate), value, [Image.events.yChanged])
        coord.y(this._coordinate, value)
    }
    private _setWidth(value: number) {
        this.willTrigger_(size.width(this._size), value, [Image.events.widthChanged])
        size.width(this._size, value)
    }
    private _setHeight(value: number) {
        this.willTrigger_(size.height(this._size), value, [Image.events.heightChanged])
        size.height(this._size, value)
    }

    private _setSourceX(value: number) {
        this.willTrigger_(coord.x(this._sourceCoordinate), value, [Image.events.sourceXChanged])
        coord.x(this._sourceCoordinate, value)
    }
    private _setSourceY(value: number) {
        this.willTrigger_(coord.y(this._sourceCoordinate), value, [Image.events.sourceYChanged])
        coord.y(this._sourceCoordinate, value)
    }
    private _setSourceWidth(value: number) {
        this.willTrigger_(size.width(this._sourceSize), value, [Image.events.sourceWidthChanged])
        size.width(this._sourceSize, value)
    }
    private _setSourceHeight(value: number) {
        this.willTrigger_(size.height(this._sourceSize), value, [Image.events.sourceHeightChanged])
        size.height(this._sourceSize, value)
    }

    private _setImageSource(value: string) {
        this.willTrigger_(this._imageSource, value, [Image.events.imageSourceChanged])
        this._imageSource = value
    }

    get x() {
        return coord.x(this._coordinate)
    }
    set x(value) {
        assert.isRealNumber(value, "x")
        this._setX(value)
    }
    get y() {
        return coord.y(this._coordinate)
    }
    set y(value) {
        assert.isRealNumber(value, "y")
        this._setY(value)
    }
    get coordinate() {
        return coord.clone(this._coordinate)
    }
    set coordinate(value) {
        assert.isCoordinate(value, "coordinate")
        this._setX(coord.x(value))
        this._setY(coord.y(value))
    }
    get point() {
        return new Point(this.owner, this._coordinate)
    }
    set point(value) {
        assert.isPoint(value, "point")
        this._setX(value.x)
        this._setY(value.y)
    }
    get width() {
        return size.width(this._size)
    }
    set width(value) {
        assert.isPositiveNumber(value, "width")
        this._setWidth(value)
    }
    get height() {
        return size.height(this._size)
    }
    set height(value) {
        assert.isPositiveNumber(value, "height")
        this._setHeight(value)
    }
    get size() {
        return size.clone(this._size)
    }
    set size(value) {
        assert.isSize(value, "size")
        this._setWidth(size.width(value))
        this._setHeight(size.height(value))
    }

    get sourceX() {
        return coord.x(this._sourceCoordinate)
    }
    set sourceX(value) {
        assert.isRealNumber(value, "sourceX")
        this._setSourceX(value)
    }
    get sourceY() {
        return coord.y(this._sourceCoordinate)
    }
    set sourceY(value) {
        assert.isRealNumber(value, "sourceY")
        this._setSourceY(value)
    }
    get sourceCoordinate() {
        return coord.clone(this._sourceCoordinate)
    }
    set sourceCoordinate(value) {
        assert.isCoordinate(value, "sourceCoordinate")
        this._setSourceX(coord.x(value))
        this._setSourceY(coord.y(value))
    }
    get sourcePoint() {
        return new Point(this.owner, this._sourceCoordinate)
    }
    set sourcePoint(value) {
        assert.isPoint(value, "sourcePoint")
        this._setSourceX(value.x)
        this._setSourceY(value.y)
    }
    get sourceWidth() {
        return size.width(this._sourceSize)
    }
    set sourceWidth(value) {
        assert.isPositiveNumber(value, "sourceWidth")
        this._setSourceWidth(value)
    }
    get sourceHeight() {
        return size.height(this._sourceSize)
    }
    set sourceHeight(value) {
        assert.isPositiveNumber(value, "sourceHeight")
        this._setSourceHeight(value)
    }
    get sourceSize() {
        return size.clone(this._sourceSize)
    }
    set sourceSize(value) {
        assert.isSize(value, "sourceSize")
        this._setSourceWidth(size.width(value))
        this._setSourceHeight(size.height(value))
    }

    get imageSource() {
        return this._imageSource
    }
    set imageSource(value) {
        assert.isString(value, "imageSource")
        this._setImageSource(value)
    }

    isValid() {
        if (!coord.isValid(this._coordinate)) return false
        if (!size.isValid(this._size)) return false
        if (this._imageSource === "") return false
        return true
    }
    move(deltaX: number, deltaY: number) {
        return this.clone().moveSelf(deltaX, deltaY)
    }
    /**
     * Move text `this` itself by `offsetX` and `offsetY`.
     */
    moveSelf(deltaX: number, deltaY: number) {
        this.coordinate = coord.move(this.coordinate, deltaX, deltaY)
        return this
    }
    /**
     * Move text `this` with `distance` along `angle` to get new text.
     */
    moveAlongAngle(angle: number, distance: number) {
        return this.clone().moveAlongAngleSelf(angle, distance)
    }
    /**
     * Move text `this` itself with `distance` along `angle`.
     */
    moveAlongAngleSelf(angle: number, distance: number) {
        this.coordinate = coord.moveAlongAngle(this.coordinate, angle, distance)
        return this
    }

    getGraphics() {
        const g = new Graphics()
        if (!this.isValid()) return g

        const { x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight, imageSource } = this
        g.image(x, y, width, height, sourceX, sourceY, sourceWidth, sourceHeight, imageSource)
        return g
    }
    clone() {
        return new Image(this.owner, this.coordinate, this.size, this.sourceCoordinate, this.sourceSize, this.imageSource)
    }
    copyFrom(image: Image | null) {
        if (image === null) image = new Image(this.owner)
        this._setX(coord.x(image._coordinate))
        this._setY(coord.y(image._coordinate))
        this._setWidth(size.width(image._size))
        this._setHeight(size.height(image._size))
        this._setSourceX(coord.x(image._sourceCoordinate))
        this._setSourceY(coord.y(image._sourceCoordinate))
        this._setSourceWidth(size.width(image._sourceSize))
        this._setSourceHeight(size.height(image._sourceSize))
        this._setImageSource(image._imageSource)
        return this
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tcoordinate: ${this.coordinate.join(", ")}`,
            `\tsize: ${this.size.join(", ")}`,
            `\tsourceCoordinate: ${this.sourceCoordinate.join(", ")}`,
            `\tsourceSize: ${this.sourceSize.join(", ")}`,
            `\timageSource: ${this.imageSource}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray() {
        return [this.coordinate, this.size, this.sourceCoordinate, this.sourceSize, this.imageSource]
    }
    toObject() {
        return {
            coordinate: this.coordinate,
            size: this.size,
            sourceCoordinate: this.sourceCoordinate,
            sourceSize: this.sourceSize,
            imageSource: this.imageSource
        }
    }
}
validAndWithSameOwner(Image)
/**
 * @category Shape
 */
export default Image

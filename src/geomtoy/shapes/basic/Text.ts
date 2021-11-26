import { validAndWithSameOwner } from "../../decorator"
import util from "../../utility"
import coord from "../../utility/coordinate"
import assert from "../../utility/assertion"

import { defaultFontConfig } from "../../consts"

import Shape from "../../base/Shape"
import Point from "./Point"
import Graphics from "../../graphics"

import type Geomtoy from "../.."
import type Transformation from "../../transformation"
import type { FontConfig } from "../../types"

class Text extends Shape {
    private _coordinate: [number, number] = [NaN, NaN]
    private _text = ""
    private _font: FontConfig = defaultFontConfig

    constructor(owner: Geomtoy, x: number, y: number, text: string, font?: FontConfig)
    constructor(owner: Geomtoy, coordinate: [number, number], text: string, font?: FontConfig)
    constructor(owner: Geomtoy, point: Point, text: string, font?: FontConfig)
    constructor(owner: Geomtoy, text: string, font?: FontConfig)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, {
                x: a1,
                y: a2,
                text: a3,
                font: a4 ?? defaultFontConfig
            })
        }
        if (util.isArray(a1)) {
            Object.assign(this, {
                coordinate: a1,
                text: a2,
                font: a4 ?? defaultFontConfig
            })
        }
        if (a1 instanceof Point) {
            Object.assign(this, {
                point: a1,
                text: a2,
                font: a4 ?? defaultFontConfig
            })
        }
        if (util.isString(a1)) {
            Object.assign(this, {
                text: a1,
                font: a4 ?? defaultFontConfig
            })
        }
        return Object.seal(this)
    }

    static readonly events = Object.freeze({
        xChanged: "xChanged",
        yChanged: "yChanged",
        textChanged: "textChanged"
    })

    private _setX(value: number) {
        this.willTrigger_(coord.x(this._coordinate), value, [Text.events.xChanged])
        coord.x(this._coordinate, value)
    }
    private _setY(value: number) {
        this.willTrigger_(coord.y(this._coordinate), value, [Text.events.yChanged])
        coord.y(this._coordinate, value)
    }
    private _setText(value: string) {
        this.willTrigger_(this._text, value, [Text.events.textChanged])
        this._text = value
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
    get text() {
        return this._text
    }
    set text(value) {
        assert.isString(value, "text")
        this._setText(value)
    }
    get font(): FontConfig {
        return util.cloneDeep(this._font)
    }
    set font(value: Partial<FontConfig>) {
        util.assignDeep(this._font, value)
    }

    isValid() {
        if (!coord.isValid(this._coordinate)) return false
        return true
    }

    /**
     * Move text `this` by `deltaX` and `deltaY` to get new text.
     */
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

    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.")
    }
    getGraphics() {
        const g = new Graphics()
        if (!this.isValid()) return g
        const {
            x,
            y,
            text,
            font: { fontSize, fontFamily, fontBold, fontItalic }
        } = this
        g.text(x, y, text, fontSize, fontFamily, fontBold, fontItalic)
        return g
    }
    clone() {
        return new Text(this.owner, this.coordinate, this.text, this.font)
    }
    copyFrom(text: Text | null) {
        if (text === null) text = new Text(this.owner)
        this._setX(coord.x(text._coordinate))
        this._setY(coord.y(text._coordinate))
        this._setText(text._text)
        util.assignDeep(this._font, util.cloneDeep(text._font))
        return this
    }
    toString() {
        return [
            `${this.name}(${this.uuid}){`,
            `\tcoordinate: ${this._coordinate.join(", ")}`,
            `\ttext: ${this._text}`,
            `\tfont: {`,
            `\t\tfontSize: ${this._font.fontSize}`,
            `\t\tfontFamily: ${this._font.fontFamily}`,
            `\t\tfontBold: ${this._font.fontBold}`,
            `\t\tfontItalic: ${this._font.fontItalic}`,
            `\t}`,
            `} owned by Geomtoy(${this.owner.uuid})`
        ].join("\n")
    }
    toArray(): any[] {
        throw new Error("Method not implemented.")
    }
    toObject(): object {
        throw new Error("Method not implemented.")
    }
}
validAndWithSameOwner(Text)
/**
 * @category Shape
 */
export default Text

import Geomtoy from "."
import GeomObject from "./base/GeomObject"
import { validAndWithSameOwner } from "./decorator"
import assert from "./utility/assertion"
import Graphics from "./graphics"
import { Shape } from "./interfaces"
import Point from "./Point"
import Transformation from "./transformation"
import util from "./utility"
import coord from "./utility/coordinate"

const defaultFontSize = 16
const defaultFontFamily = "sans-serif"
const defaultFontBold = false
const defaultFontItalic = false
class Text extends GeomObject implements Shape {
    private _coordinate: [number, number] = [NaN, NaN]
    private _text = ""
    private _fontSize = defaultFontSize
    private _fontFamily = defaultFontFamily
    private _fontBold = defaultFontBold
    private _fontItalic = defaultFontItalic

    constructor(owner: Geomtoy, x: number, y: number, text: string, fontSize?: number, fontFamily?: string, fontBold?: boolean, fontItalic?: boolean)
    constructor(owner: Geomtoy, coordinate: [number, number], text: string, fontSize?: number, fontFamily?: string, fontBold?: boolean, fontItalic?: boolean)
    constructor(owner: Geomtoy, point: Point, text: string, fontSize?: number, fontFamily?: string, fontBold?: boolean, fontItalic?: boolean)
    constructor(owner: Geomtoy, text: string, fontSize?: number, fontFamily?: string, fontBold?: boolean, fontItalic?: boolean)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any, a5?: any, a6?: any, a7?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, {
                x: a1,
                y: a2,
                text: a3,
                fontSize: a4 ?? defaultFontSize,
                fontFamily: a5 ?? defaultFontFamily,
                fontBold: a6 ?? defaultFontBold,
                fontItalic: a7 ?? defaultFontItalic
            })
        }
        if (util.isArray(a1)) {
            Object.assign(this, {
                coordinate: a1,
                text: a2,
                fontSize: a3 ?? defaultFontSize,
                fontFamily: a4 ?? defaultFontFamily,
                fontBold: a5 ?? defaultFontBold,
                fontItalic: a6 ?? defaultFontItalic
            })
        }
        if (a1 instanceof Point) {
            Object.assign(this, {
                point: a1,
                text: a2,
                fontSize: a3 ?? defaultFontSize,
                fontFamily: a4 ?? defaultFontFamily,
                fontBold: a5 ?? defaultFontBold,
                fontItalic: a6 ?? defaultFontItalic
            })
        }
        if (util.isString(a1)) {
            Object.assign(this, {
                text: a1,
                fontSize: a2 ?? defaultFontSize,
                fontFamily: a3 ?? defaultFontFamily,
                fontBold: a4 ?? defaultFontBold,
                fontItalic: a5 ?? defaultFontItalic
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
    get fontSize() {
        return this._fontSize
    }
    set fontSize(value) {
        assert.isRealNumber(value, "fontSize")
        this._fontSize = value
    }
    get fontFamily() {
        return this._fontFamily
    }
    set fontFamily(value) {
        assert.isString(value, "fontFamily")
        this._fontFamily = value
    }
    get fontBold() {
        return this._fontBold
    }
    set fontBold(value) {
        assert.isBoolean(value, "fontBold")
        this._fontBold = value
    }
    get fontItalic() {
        return this._fontItalic
    }
    set fontItalic(value) {
        assert.isBoolean(value, "fontItalic")
        this._fontItalic = value
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

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    getGraphics() {
        const g = new Graphics()
        if (!this.isValid()) return g.commands
        const { x, y, text, fontSize, fontFamily, fontBold, fontItalic } = this
        g.text(x, y, text, fontSize, fontFamily, fontBold, fontItalic)
        return g.commands
    }

    clone() {
        return new Text(this.owner, this.coordinate, this.text, this.fontSize, this.fontFamily, this.fontBold, this.fontItalic)
    }
    copyFrom(text: Text | null) {
        if (text === null) text = new Text(this.owner)
        this._setX(coord.x(text._coordinate))
        this._setY(coord.y(text._coordinate))
        this._setText(text._text)
        this._fontSize = text._fontSize
        this._fontFamily = text._fontFamily
        this._fontBold = text._fontBold
        this._fontItalic = text._fontItalic
        return this
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            `\tcoordinate: ${this.coordinate.join(", ")}`,
            `\ttext: ${this.text}`,
            `\tfontSize: ${this.fontSize}`,
            `\tfontFamily: ${this.fontFamily}`,
            `\tfontBold: ${this.fontBold}`,
            `\tfontItalic: ${this.fontItalic}`,
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
 * @category GeomObject
 */
export default Text

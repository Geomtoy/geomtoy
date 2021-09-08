import Geomtoy from "."
import GeomObject from "./base/GeomObject"
import { assertIsCoordinate, assertIsPoint, assertIsRealNumber, assertIsString, sealed, validAndWithSameOwner } from "./decorator"
import Graphics from "./graphics"
import { Visible } from "./interfaces"
import Point from "./Point"
import Transformation from "./transformation"
import { defaultFont, Font } from "./types"
import util from "./utility"
import coord from "./utility/coordinate"
import Matrix from "./helper/Matrix"

@sealed
@validAndWithSameOwner
class Text extends GeomObject implements Visible {
    #coordinate: [number, number] = [NaN, NaN]
    #text: string = ""
    #font: Font = Object.assign({}, defaultFont)

    constructor(owner: Geomtoy, x: number, y: number, text: string, font?: Partial<Font>)
    constructor(owner: Geomtoy, coordinate: [number, number], text: string, font?: Partial<Font>)
    constructor(owner: Geomtoy, point: Point, text: string, font?: Partial<Font>)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any, a4?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { x: a1, y: a2, text: a3 })
            if (a4) this.setFont(a4)
        }
        if (util.isArray(a1)) {
            Object.assign(this, { coordinate: a1, text: a2 })
            if (a3) this.setFont(a3)
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point: a1, text: a2 })
            if (a3) this.setFont(a3)
        }
        return Object.seal(this)
    }
    get x() {
        return coord.x(this.#coordinate)
    }
    set x(value) {
        assertIsRealNumber(value, "x")
        coord.x(this.#coordinate, value)
    }
    get y() {
        return coord.y(this.#coordinate)
    }
    set y(value) {
        assertIsRealNumber(value, "y")
        coord.y(this.#coordinate, value)
    }
    get coordinate() {
        return coord.copy(this.#coordinate)
    }
    set coordinate(value) {
        assertIsCoordinate(value, "coordinate")
        coord.assign(this.#coordinate, value)
    }
    get point() {
        return new Point(this.owner, this.#coordinate)
    }
    set point(value) {
        assertIsPoint(value, "point")
        coord.assign(this.#coordinate, value.coordinate)
    }
    get text() {
        return this.#text
    }
    set text(value) {
        assertIsString(value, "text")
        this.#text = value
    }

    isValid() {
        return coord.isValid(this.#coordinate) && util.isString(this.#text)
    }

    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }

    getFont() {
        return Object.assign({}, this.#font)
    }
    setFont(value: Partial<Font>) {
        this.#font.size = value.size ? value.size : this.#font.size
        this.#font.family = value.family ? value.family : this.#font.family
        this.#font.bold = value.bold ? value.bold : this.#font.bold
        this.#font.italic = value.italic ? value.italic : this.#font.italic
    }

    getGraphics() {
        const g = new Graphics()
        const { x, y, text } = this
        const font = this.getFont()
        g.text(x, y, text, font)
        return g.commands
    }

    clone(): GeomObject {
        throw new Error("Method not implemented.")
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
    toArray(): any[] {
        throw new Error("Method not implemented.")
    }
    toObject(): object {
        throw new Error("Method not implemented.")
    }
}

export default Text

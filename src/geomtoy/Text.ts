import Geomtoy from "."
import GeomObject from "./base/GeomObject"
import { is } from "./decorator"
import Graphics from "./graphics"
import { Visible } from "./interfaces"
import Point from "./Point"
import Transformation from "./transformation"
import { GraphicsImplType, SvgCommand, CanvasCommand } from "./types"
import util from "./utility"
import coord from "./utility/coordinate"

class Text extends GeomObject  implements Visible{
    #coordinate: [number, number] = [NaN, NaN]
    #text: string = ""

    constructor(owner: Geomtoy, x: number, y: number, text?: string ,font?:string,)
    constructor(owner: Geomtoy, coordinate: [number, number], text?: string)
    constructor(owner: Geomtoy, point: Point, text?: string)
    constructor(owner: Geomtoy)
    constructor(o: Geomtoy, a1?: any, a2?: any, a3?: any) {
        super(o)
        if (util.isNumber(a1)) {
            Object.assign(this, { x: a1, y: a2, text: a3 ?? "" })
        }
        if (util.isArray(a1)) {
            Object.assign(this, { coordinate: a1, text: a2 ?? "" })
        }
        if (a1 instanceof Point) {
            Object.assign(this, { point: a1, text: a2 ?? "" })
        }
        return Object.seal(this)
    }
    @is("realNumber")
    get x() {
        return coord.x(this.#coordinate)
    }
    set x(value) {
        coord.x(this.#coordinate, value)
    }
    @is("realNumber")
    get y() {
        return coord.y(this.#coordinate)
    }
    set y(value) {
        coord.y(this.#coordinate, value)
    }
    @is("coordinate")
    get coordinate() {
        return coord.copy(this.#coordinate)
    }
    set coordinate(value) {
        coord.assign(this.#coordinate, value)
    }
    @is("point")
    get point() {
        return new Point(this.owner, this.#coordinate)
    }
    set point(value) {
        coord.assign(this.#coordinate, value.coordinate)
    }

    isValid(): boolean {
        throw new Error("Method not implemented.")
    }



    apply(transformation: Transformation): GeomObject {
        throw new Error("Method not implemented.")
    }
    getGraphics(type: GraphicsImplType): (SvgCommand | CanvasCommand)[] {
        let g =new Graphics()
        
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

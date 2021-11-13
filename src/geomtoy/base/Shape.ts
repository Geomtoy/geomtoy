import Geomtoy from ".."
import Transformation from "../transformation"
import { GraphicsCommand } from "../types"
import EventTarget from "./EventTarget"

abstract class Shape extends EventTarget {
    constructor(owner: Geomtoy) {
        super(owner)
    }
    get type() {
        return this.constructor.name
    }
    abstract isValid(): boolean
    abstract clone(): Shape
    abstract copyFrom(object: null | Shape): this
    abstract apply(transformation: Transformation): Shape
    abstract getGraphics(): GraphicsCommand[]
    abstract move(deltaX: number, deltaY: number): Shape
    abstract moveSelf(deltaX: number, deltaY: number): this
    abstract moveAlongAngle(angle: number, distance: number): Shape
    abstract moveAlongAngleSelf(angle: number, distance: number): this
    toString() {
        return `${this.name}(${this.uuid}) owned by Geomtoy(${this.owner.uuid})`
    }
    toArray(): any[] {
        return [this.type]
    }
    toObject(): object {
        return { type: this.type }
    }
}
export default Shape

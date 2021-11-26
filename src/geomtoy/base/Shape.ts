import EventTarget from "./EventTarget"
import Arc from "../shapes/basic/Arc"
import Bezier from "../shapes/basic/Bezier"
import Circle from "../shapes/basic/Circle"
import Ellipse from "../shapes/basic/Ellipse"
import Line from "../shapes/basic/Line"
import LineSegment from "../shapes/basic/LineSegment"
import Point from "../shapes/basic/Point"
import QuadraticBezier from "../shapes/basic/QuadraticBezier"
import Ray from "../shapes/basic/Ray"
import Rectangle from "../shapes/basic/Rectangle"
import RegularPolygon from "../shapes/basic/RegularPolygon"
import Square from "../shapes/basic/Square"
import Text from "../shapes/basic/Text"
import Triangle from "../shapes/basic/Triangle"
import Vector from "../shapes/basic/Vector"

import type Geomtoy from ".."
import type Transformation from "../transformation"
import type Graphics from "../graphics"

abstract class Shape extends EventTarget {
    constructor(owner: Geomtoy) {
        super(owner)
    }
    get type() {
        return this.name
    }
    static shapes = {
        Arc,
        Bezier,
        Circle,
        Ellipse,
        Line,
        LineSegment,
        Point,
        QuadraticBezier,
        Ray,
        Rectangle,
        RegularPolygon,
        Square,
        Text,
        Triangle,
        Vector
    }

    abstract isValid(): boolean
    abstract clone(): Shape
    abstract copyFrom(object: null | Shape): this
    abstract getGraphics(): Graphics
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

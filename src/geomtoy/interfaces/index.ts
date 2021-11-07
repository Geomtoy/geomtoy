import GeomObject from "../base/GeomObject"
import Point from "../Point"
import Transformation from "../transformation"
import { GraphicsCommand, Direction } from "../types"

export interface AreaMeasurable {
    getPerimeter(): number
    getArea(): number
    getWindingDirection(): Direction
    setWindingDirection?(direction: Direction): void
}



export interface LengthMeasurable {
    getLength(): number
}

export interface Visible {
    apply(transformation: Transformation): GeomObject
    getGraphics(): GraphicsCommand[]
    move(deltaX: number, deltaY: number) :GeomObject 
    moveSelf(deltaX: number, deltaY: number) :this
    moveAlongAngle(angle: number, distance: number):GeomObject 
    moveAlongAngleSelf(angle: number, distance: number) :this
}

export interface RotationFeatured{
    get rotation()
    set rotation(value:number)
}
export interface Shape{
    apply(transformation: Transformation): GeomObject
    getGraphics(): GraphicsCommand[]
    move(deltaX: number, deltaY: number) :GeomObject 
    moveSelf(deltaX: number, deltaY: number) :this
    moveAlongAngle(angle: number, distance: number):GeomObject 
    moveAlongAngleSelf(angle: number, distance: number) :this
}
export interface ClosedShape extends Shape{
    getPerimeter(): number
    getArea(): number
    getWindingDirection(): Direction
    setWindingDirection?(direction: Direction): void
    isPointOn(point:Point):boolean
    isPointOutside(point:Point):boolean
    isPointInside(point:Point):boolean
}

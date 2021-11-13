import Shape from "../base/Shape"
import Point from "../Point"
import { Direction } from "../types"

export interface ClosedShape extends Shape {
    getLength(): number
    getArea(): number
    getWindingDirection(): Direction
    setWindingDirection?(direction: Direction): void
    isPointOn(point: [number, number] | Point): boolean
    isPointOutside(point: [number, number] | Point): boolean
    isPointInside(point: [number, number] | Point): boolean
}
export interface FiniteOpenShape {
    getLength(): number
    isPointOn(point: [number, number] | Point): boolean
}
export interface InfiniteOpenShape {
    isPointOn(point: [number, number] | Point): boolean
}

export interface RotationFeatured {
    get rotation()
    set rotation(value: number)
}
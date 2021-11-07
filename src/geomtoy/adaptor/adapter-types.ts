import Geomtoy from ".."
import GeomObject from "../base/GeomObject"
import { Visible } from "../interfaces"

export type LineJoinType = "bevel" | "miter" | "round"
export type LineCapType = "butt" | "round" | "square"

export type AdapterOptions = {
    lineJoin: LineJoinType
    miterLimit: number
    lineCap: LineCapType
}
export type PathLike = SVGPathElement | Path2D
export type ContainerElement = SVGSVGElement | HTMLCanvasElement
export interface Renderer {
    container: ContainerElement
    geomtoy: Geomtoy
    setup(): void
    draw(object: GeomObject & Visible, behind: boolean): PathLike
    stroke(stroke: string): void
    strokeWidth(strokeWidth: number): void
    strokeDash(strokeDash: number[]): void
    strokeDashOffset(strokeDashOffset: number): void
    fill(fill: string): void
    isPointInFill(path: PathLike, x: number, y: number): boolean
    isPointInStroke(path: PathLike, strokeWidth: number, x: number, y: number): boolean
    drawBatch(objects: (GeomObject & Visible)[], behind: boolean): PathLike[]
    clear(): void
}

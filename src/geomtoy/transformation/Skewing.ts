import Matrix from "./Matrix"
import Point from "../Point"
import { Coordinate } from "../types"

class Skewing extends Matrix {
    angleX: number
    angleY: number

    constructor(angleX: number, angleY: number, originX: number, originY: number)
    constructor(angleX: number, angleY: number, originCoordinate: Coordinate)
    constructor(angleX: number, angleY: number, origin: Point)
    constructor(angleX: number, angleY: number)
    constructor()
    constructor(fx?: any, fy?: any, ox?: any, oy?: any) {
        super()
    }
}

export default Skewing

import Point from "../Point"
import Line from "../Line"
import Matrix from "./Matrix"
import Translation from "./Translation"
import Rotation from "./Rotation"
import Scaling from "./Scaling"
import Skewing from "./Skewing"
import LineReflection from "./LineReflection"
import PointReflection from "./PointReflection"

class Transformation {
    #transformation: Matrix = Matrix.identity

    get(): Matrix {
        return this.#transformation
    }
    set(transformation: Matrix) {
        this.#transformation = transformation
    }

    translate(deltaX: number, deltaY: number) {
        let t = new Translation(deltaX, deltaY)
        this.#transformation.postMultiplySelf(t)
        return this
    }

    rotate(angle: number, origin: Point) {
        let t = new Rotation(angle, origin)
        this.#transformation.postMultiplySelf(t)
        return this
    }

    scale(factorX: number, factorY: number, origin: Point) {
        let t = new Scaling(factorX, factorY, origin)
        this.#transformation.postMultiplySelf(t)
        return this
    }

    skew(angleX: number, angleY: number, origin: Point) {
        let t = new Skewing(angleX, angleY, origin)
        this.#transformation.postMultiplySelf(t)
        return this
    }

    lineReflect(line: Line) {
        let t = new LineReflection(line)
        this.#transformation.postMultiplySelf(t)
        return this
    }

    pointReflect(point: Point) {
        let t = new PointReflection(point)
        this.#transformation.postMultiplySelf(t)
        return this
    }

    transform(a: number, b: number, c: number, d: number, e: number, f: number) {
        let t = new Matrix(a, b, c, d, e, f)
        this.#transformation.postMultiplySelf(t)
        return this
    }

}

export default Transformation
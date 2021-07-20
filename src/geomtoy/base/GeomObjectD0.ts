import Matrix from "../transformation/Matrix"
import Translation from "../transformation/Translation"
import Rotation from "../transformation/Rotation"
import Scaling from "../transformation/Scaling"
import Skewing from "../transformation/Skewing"
import { Coordinate } from "../types"
import GeomObject from "./GeomObject"
import Vector from "../Vector"
import Line from "../Line"
import Point from "../Point"
import LineReflection from "../transformation/LineReflection"
import PointReflection from "../transformation/PointReflection"

abstract class GeomObjectD0 extends GeomObject {
    abstract x: number
    abstract y: number
    abstract transformation: Matrix

    normalize(): GeomObjectD0 {
        return this.clone().normalizeO()
    }
    normalizeO(): GeomObjectD0 {
        let norm = Math.hypot(this.x, this.y),
            m = new Matrix()
        m.a = 1 / norm
        m.d = 1 / norm
        this.transformation.postMultiplyO(m)
        return this
    }
    translate(offsetX: number, offsetY: number): GeomObjectD0 {
        return this.clone().translateO(offsetX, offsetY)
    }
    translateO(offsetX: number, offsetY: number): GeomObjectD0 {
        let t = new Translation(offsetX, offsetY)
        this.transformation.postMultiplyO(t)
        return this
    }
    translateFromVector(vector: Vector): GeomObjectD0 {
        return this.clone().translateFromVectorO(vector)
    }
    translateFromVectorO(vector: Vector): GeomObjectD0 {
        let t = new Translation(vector.x, vector.y)
        this.transformation.postMultiplyO(t)
        return this
    }

    rotate(angle: number, origin: Point): GeomObjectD0 {
        return this.clone().rotateO(angle)
    }
    rotateO(angle: number, origin: Point): GeomObjectD0 {
        let t = new Rotation(angle, origin)
        this.transformation.postMultiplyO(t)
        return this
    }
    //todo
    // rotateFromVector(vector:Vector):GeomObjectD0{
    //     return
    // }
    // rotateFromVectorO(vector:Vector):GeomObjectD0{
    //     return
    // }

    scale(factorX: number, factorY: number, origin: Point): GeomObjectD0 {
        return this.clone().scaleO(factorX, factorY, origin)
    }

    scaleO(factorX: number, factorY: number, origin: Point): GeomObjectD0 {
        let t = new Scaling(factorX, factorY, origin)
        this.transformation.postMultiplyO(t)
        return this
    }

    skew(angleX: number, angleY: number, origin: Point): GeomObjectD0 {
        return this.clone().skewO(angleX, angleY, origin)
    }

    skewO(angleX: number, angleY: number, origin: Point): GeomObjectD0 {
        let t = new Skewing(angleX, angleY, origin)
        this.transformation.postMultiplyO(t)
        return this
    }

    lineReflect(line: Line): GeomObjectD0 {
        return this.clone().lineReflectO(line)
    }
    lineReflectO(line: Line): GeomObjectD0 {
        let t = new LineReflection(line)
        this.transformation.postMultiplyO(t)
        return this
    }

    pointReflect(point: Point): GeomObjectD0 {
        return this.clone().pointReflectO(point)
    }
    pointReflectO(point: Point): GeomObjectD0 {
        let t = new PointReflection(point)
        this.transformation.postMultiplyO(t)
        return this
    }

    transform(matrix: Matrix): GeomObjectD0 {
        this.transformation.postMultiply(matrix)
        return this
    }
    transformO(matrix: Matrix): GeomObjectD0 {
        this.transformation.postMultiplyO(matrix)
        return this
    }

    getCoordinate(): Coordinate {
        return [this.x, this.y]
    }
}

export default GeomObjectD0

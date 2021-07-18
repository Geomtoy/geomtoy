import Matrix from "../transformation/Matrix"
import Translation from "../transformation/Translation"
import Rotation from "../transformation/Rotation"
import { Coordinate } from "../types"
import GeomObject from "./GeomObject"

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
        this.transformation.postMultiply(m)
        return this
    }
    translate(dx: number, dy: number): GeomObjectD0 {
        return this.clone().translateO(dx, dy)
    }
    translateO(dx: number, dy: number): GeomObjectD0 {
        let t = new Translation(dx, dy)
        this.transformation.postMultiply(t)
        return this
    }
    rotate(angle: number): GeomObjectD0 {
        return this.clone().rotateO(angle)
    }
    rotateO(angle: number): GeomObjectD0 {
        let t = new Rotation(angle)
        this.transformation.postMultiply(t)
        return this
    }

    scale() {}

    scaleO() {
        


    }

    getCoordinate(): Coordinate {
        return [this.x, this.y]
    }
}

export default GeomObjectD0

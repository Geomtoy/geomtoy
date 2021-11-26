import Shape from "../../base/Shape"
import Graphics from "../../graphics"
import type Transformation from "../../transformation"

class Square extends Shape {
    isValid(): boolean {
        throw new Error("Method not implemented.")
    }
    clone(): Shape {
        throw new Error("Method not implemented.")
    }
    copyFrom(object: Shape | null): this {
        throw new Error("Method not implemented.")
    }
    apply(transformation: Transformation): Shape {
        throw new Error("Method not implemented.")
    }
    getGraphics() {
        const g = new Graphics()
        if (!this.isValid()) return g
        throw new Error("Method not implemented.")
    }
    move(deltaX: number, deltaY: number): Shape {
        throw new Error("Method not implemented.")
    }
    moveSelf(deltaX: number, deltaY: number): this {
        throw new Error("Method not implemented.")
    }
    moveAlongAngle(angle: number, distance: number): Shape {
        throw new Error("Method not implemented.")
    }
    moveAlongAngleSelf(angle: number, distance: number): this {
        throw new Error("Method not implemented.")
    }
}

export default Square

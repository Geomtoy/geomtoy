import math from "./math"
import { Coordinate, Vector2 } from "./_type"

const vec2 = {
    // vector setup initial coordinate of u and terminal coordinate of v
    from([ux, uy]: [number, number], [vx, vy]: [number, number]): [number, number] {
        return vec2.subtract([vx, vy], [ux, uy])
    },
    from2(angle: number, magnitude: number): Vector2 {
        let x = magnitude * math.cos(angle),
            y = magnitude * math.sin(angle)
        return [x, y]
    },
    angle([x, y]: Vector2): number {
        return math.atan2(y, x)
    },
    //rotation angle from u to v
    angleTo([ux, uy]: Vector2, [vx, vy]: Vector2): number {
        // return vec2.angle([vx, vy]) - vec2.angle([ux, uy])
        let sign = vec2.cross([ux, uy], [vx, vy]) >= 0 ? 1 : -1
        return sign * math.acos(vec2.dot([ux, uy], [vx, vy]) / (vec2.magnitude([ux, uy]) * vec2.magnitude([vx, vy])))
    },
    magnitude([x, y]: Vector2): number {
        return math.hypot(x, y)
    },
    squaredMagnitude([x, y]: Vector2): number {
        return x ** 2 + y ** 2
    },
    add([ux, uy]: Vector2, [vx, vy]: Vector2): Vector2 {
        return [ux + vx, uy + vy]
    },
    subtract([ux, uy]: Vector2, [vx, vy]: Vector2): Vector2 {
        return [ux - vx, uy - vy]
    },
    scalarMultiply([x, y]: Vector2, scalar: number): Vector2 {
        return [x * scalar, y * scalar]
    },
    multiply([ux, uy]: Vector2, [vx, vy]: Vector2): Vector2 {
        return [ux * vx, uy * vy]
    },
    dot([ux, uy]: Vector2, [vx, vy]: Vector2): number {
        return ux * vx + uy * vy
    },
    project([ux, uy]: Vector2, [vx, vy]: Vector2): Vector2 {
        // return vec2.scalarMultiply(vec2.normalize([vx, vy]), vec2.dot([ux, uy], [vx, vy]) / vec2.magnitude([vx, vy]))
        return vec2.scalarMultiply([vx, vy], vec2.dot([ux, uy], [vx, vy]) / vec2.dot([vx, vy], [vx, vy]))
    },
    cross([ux, uy]: Vector2, [vx, vy]: Vector2): number {
        return ux * vy - uy * vx
    },
    absolute([x, y]: Vector2): Vector2 {
        return [math.abs(x), math.abs(y)]
    },
    negative([x, y]: Vector2): Vector2 {
        return [-x, -y]
    },
    reciprocal([x, y]: Vector2): Vector2 {
        return [1 / x, 1 / y]
    },
    swap([x, y]: Vector2): Vector2 {
        return [y, x]
    },
    rotate([x, y]: Vector2, a: number): Vector2 {
        return [x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)]
    },
    normalize([x, y]: Vector2): Vector2 {
        let magnitude = vec2.magnitude([x, y])
        return [x / magnitude, y / magnitude]
    }
}

export default vec2

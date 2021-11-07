import math from "./math"

const vec2 = {
    from([ux, uy]: [number, number], [vx, vy]: [number, number]): [number, number] {
        return vec2.subtract([vx, vy], [ux, uy])
    },
    from2(angle: number, magnitude: number): [number, number] {
        const x = magnitude * math.cos(angle)
        const y = magnitude * math.sin(angle)
        return [x, y]
    },
    angle([x, y]: [number, number]): number {
        return math.atan2(y, x)
    },
    angleTo([ux, uy]: [number, number], [vx, vy]: [number, number]): number {
        // return vec2.angle([vx, vy]) - vec2.angle([ux, uy])
        const sign = vec2.cross([ux, uy], [vx, vy]) >= 0 ? 1 : -1
        return sign * math.acos(vec2.dot([ux, uy], [vx, vy]) / (vec2.magnitude([ux, uy]) * vec2.magnitude([vx, vy])))
    },
    magnitude([x, y]: [number, number]): number {
        return math.hypot(x, y)
    },
    squaredMagnitude([x, y]: [number, number]): number {
        return x ** 2 + y ** 2
    },
    add([ux, uy]: [number, number], [vx, vy]: [number, number]): [number, number] {
        return [ux + vx, uy + vy]
    },
    subtract([ux, uy]: [number, number], [vx, vy]: [number, number]): [number, number] {
        return [ux - vx, uy - vy]
    },
    scalarMultiply([x, y]: [number, number], scalar: number): [number, number] {
        return [x * scalar, y * scalar]
    },
    multiply([ux, uy]: [number, number], [vx, vy]: [number, number]): [number, number] {
        return [ux * vx, uy * vy]
    },
    dot([ux, uy]: [number, number], [vx, vy]: [number, number]): number {
        return ux * vx + uy * vy
    },
    project([ux, uy]: [number, number], [vx, vy]: [number, number]): [number, number] {
        // return vec2.scalarMultiply(vec2.normalize([vx, vy]), vec2.dot([ux, uy], [vx, vy]) / vec2.magnitude([vx, vy]))
        return vec2.scalarMultiply([vx, vy], vec2.dot([ux, uy], [vx, vy]) / vec2.dot([vx, vy], [vx, vy]))
    },
    cross([ux, uy]: [number, number], [vx, vy]: [number, number]): number {
        return ux * vy - uy * vx
    },
    absolute([x, y]: [number, number]): [number, number] {
        return [math.abs(x), math.abs(y)]
    },
    negative([x, y]: [number, number]): [number, number] {
        return [-x, -y]
    },
    invert([x, y]: [number, number]): [number, number] {
        return [1 / x, 1 / y]
    },
    swap([x, y]: [number, number]): [number, number] {
        return [y, x]
    },
    rotate([x, y]: [number, number], a: number): [number, number] {
        return [x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)]
    },
    normalize([x, y]: [number, number]): [number, number] {
        let magnitude = vec2.magnitude([x, y])
        return [x / magnitude, y / magnitude]
    }
}

export default vec2

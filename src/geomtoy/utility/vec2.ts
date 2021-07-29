import math from "./math"

const vec2 = {
    from([ux, uy]: [number, number], [vx, vy]: [number, number]): [number, number] {
        return vec2.subtract([vx, vy], [ux, uy])
    },
    angle([x, y]: [number, number]): number {
        return math.atan2(y, x)
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
        return [x * math.cos(a) + y * math.sin(a), -x * math.sin(a) + y * math.cos(a)]
    },
    normalize([x, y]: [number, number]): [number, number] {
        let norm = math.hypot(x, y)
        return [x / norm, y / norm]
    }
}

export default vec2

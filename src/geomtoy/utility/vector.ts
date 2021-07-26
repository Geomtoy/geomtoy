import { Coordinate } from "../types"

let vectorUtility = {
    add([ux, uy]: Coordinate, [vx, vy]: Coordinate): Coordinate {
        return [ux + vx, uy + vy]
    },
    subtract([ux, uy]: Coordinate, [vx, vy]: Coordinate): Coordinate {
        return [ux - vx, uy - vy]
    },
    scalarMultiply([x, y]: Coordinate, scalar: number): Coordinate {
        return [x * scalar, y * scalar]
    },
    dotProduct([ux, uy]: Coordinate, [vx, vy]: Coordinate): number {
        return ux * vx + uy * vy
    },
    crossProduct([ux, uy]: Coordinate, [vx, vy]: Coordinate): number {
        return ux * vy - uy * vx
    },
    reverse([x, y]: Coordinate): Coordinate {
        return [-x, -y]
    },
    swap([x, y]: Coordinate): Coordinate {
        return [y, x]
    },
    rotate([x, y]: Coordinate, a: number): Coordinate {
        let nx = x * Math.cos(a) + y * Math.sin(a),
            ny = -x * Math.sin(a) + y * Math.cos(a)
        return [nx, ny]
    },
    normalize([x, y]: Coordinate): Coordinate {
        let norm = Math.hypot(x, y)
        return [x / norm, y / norm]
    }
}

export default vectorUtility

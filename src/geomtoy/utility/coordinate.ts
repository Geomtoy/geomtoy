import util from "."
import math from "./math"
import { Coordinate } from "./_type"

const coord = {
    assign(c: Coordinate, ref: Coordinate) {
        let [x, y] = ref
        c[0] = x
        c[1] = y
    },
    x(c: Coordinate, x?: number) {
        if (x !== undefined) c[0] = x
        return c[0]
    },
    y(c: Coordinate, y?: number) {
        if (y !== undefined) c[1] = y
        return c[1]
    },
    copy(c: Coordinate): Coordinate {
        return [...c]
    },
    isSameAs(c1: Coordinate, c2: Coordinate, epsilon: number): boolean {
        return math.equalTo(c1[0], c2[0], epsilon) && math.equalTo(c1[1], c2[1], epsilon)
    },
    // x first comparison
    compare(c1: Coordinate, c2: Coordinate, epsilon: number): number {
        let d0 = math.compare(c1[0], c2[0], epsilon),
            d1= math.compare(c1[0], c2[0], epsilon)
        return d0===0? d1 : d0
    },
    sort(cs: Coordinate[]) {
        return util.sort(cs, (c1, c2) => (c1[0] == c2[0] ? c1[1] - c2[1] : c1[0] - c2[0]))
    },
    //
    isValid(c: Coordinate) {
        return util.isRealNumber(c[0]) && util.isRealNumber(c[1])
    },
    toString(c: Coordinate) {
        return `[${coord.x(c)}, ${coord.y(c)}]`
    }
}
export default coord

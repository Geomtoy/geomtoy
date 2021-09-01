import util from "."
import math from "./math"

const coord = {
    assign(c: [number, number], ref: [number, number]) {
        let [x, y] = ref
        c[0] = x
        c[1] = y
    },
    x(c: [number, number], x?: number) {
        if (x !== undefined) c[0] = x
        return c[0]
    },
    y(c: [number, number], y?: number) {
        if (y !== undefined) c[1] = y
        return c[1]
    },
    copy(c: [number, number]): [number, number] {
        return [...c]
    },
    isSameAs(c1: [number, number], c2: [number, number], epsilon: number): boolean {
        return math.equalTo(c1[0], c2[0], epsilon) && math.equalTo(c1[1], c2[1], epsilon)
    },
    // x first comparison
    compare(c1: [number, number], c2: [number, number], epsilon: number): number {
        let d0 = math.compare(c1[0], c2[0], epsilon),
            d1 = math.compare(c1[0], c2[0], epsilon)
        return d0 === 0 ? d1 : d0
    },
    sort(cs: [number, number][]) {
        return util.sort(cs, (c1, c2) => (c1[0] == c2[0] ? c1[1] - c2[1] : c1[0] - c2[0]))
    },
    //
    isValid(c: [number, number]) {
        return util.isRealNumber(c[0]) && util.isRealNumber(c[1])
    },
    toString(c: [number, number]) {
        return `[${coord.x(c)}, ${coord.y(c)}]`
    }
}
export default coord

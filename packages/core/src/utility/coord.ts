import util from "."
import math from "./math"

const coord = {
    // assign(c: [number, number], ref: [number, number]) {
    //     let [x, y] = ref
    //     c[0] = x
    //     c[1] = y
    // },
    x(c: [number, number], x?: number) {
        if (x !== undefined) c[0] = x
        return c[0]
    },
    y(c: [number, number], y?: number) {
        if (y !== undefined) c[1] = y
        return c[1]
    },
    // clone(c: [number, number]): [number, number] {
    //     return [...c]
    // },
    move(c: [number, number], dx: number, dy: number): [number, number] {
        return [c[0] + dx, c[1] + dy]
    },
    moveAlongAngle(c: [number, number], angle: number, d: number): [number, number] {
        return [c[0] + d * math.cos(angle), c[1] + d * math.sin(angle)]
    },
    isSameAs(c1: [number, number], c2: [number, number], epsilon: number): boolean {
        // todo rename math.equalTo = apxEqualTo
        return math.equalTo(c1[0], c2[0], epsilon) && math.equalTo(c1[1], c2[1], epsilon)
    },
    // x first comparison
    compare(c1: [number, number], c2: [number, number], epsilon: number): number {
        let d0 = math.compare(c1[0], c2[0], epsilon),
            d1 = math.compare(c1[0], c2[0], epsilon)
        return d0 === 0 ? d1 : d0
    },
    //
    isValid(c: [number, number]) {
        return util.isRealNumber(c[0]) && util.isRealNumber(c[1])
    },
    //
    // x first sort, asc order
    sortArray(cs: [number, number][], epsilon: number) {
        return coord.sortArraySelf([...cs],epsilon)
    },
    sortArraySelf(cs: [number, number][], epsilon: number) {
        return cs.sort((c1, c2) => {
            return math.strictSign(c1[0] - c2[0], epsilon) === 0 ? math.strictSign(c1[1] - c2[1], epsilon) : math.strictSign(c1[0] - c2[0], epsilon)
        })
    },
}
export default coord
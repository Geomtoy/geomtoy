import util from "."
import math from "./math"

const size = {
    assign(s: [number, number], ref: [number, number]) {
        let [w, h] = ref
        s[0] = w
        s[1] = h
    },
    width(s: [number, number], w?: number) {
        if (w !== undefined) s[0] = w
        return s[0]
    },
    height(s: [number, number], h?: number) {
        if (h !== undefined) s[1] = h
        return s[1]
    },
    clone(s: [number, number]): [number, number] {
        return [...s]
    },
    isSameAs(s1: [number, number], s2: [number, number], epsilon: number): boolean {
        return math.equalTo(size.width(s1), size.width(s2), epsilon) && math.equalTo(size.height(s1), size.height(s2), epsilon)
    },
    isValid(s: [number, number], epsilon: number) {
        return util.isRealNumber(s[0]) && math.greaterThan(s[0], 0, epsilon) && util.isRealNumber(s[1]) && math.greaterThan(s[1], 0, epsilon)
    },
    toString(s: [number, number]) {
        return `[${size.width(s)}, ${size.width(s)}]`
    }
}

export default size

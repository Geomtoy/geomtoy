import math from "../utility/math"

const size = {
    assign(s: [number, number], ref: [number, number]) {
        let [w, h] = ref
        s[0] = w
        s[1] = h
    },
    width(s: [number, number], w?: number) {
        if (w) s[0] = w
        return s[0]
    },
    height(s: [number, number], h?: number) {
        if (h) s[1] = h
        return s[1]
    },
    copy(s: [number, number]): [number, number] {
        return [...s]
    },
    isSameAs(s1: [number, number], s2: [number, number], epsilon: number): boolean {
        return math.equalTo(size.width(s1), size.width(s2), epsilon) && math.equalTo(size.height(s1), size.height(s2), epsilon)
    }
}

export default size

import math from "../utility/math"

const coord = {
    assign(c: [number, number], ref: [number, number]) {
        let [x, y] = ref
        c[0] = x
        c[1] = y
    },
    x(c: [number, number], x?: number) {
        if (x) c[0] = x
        return c[0]
    },
    y(c: [number, number], y?: number) {
        if (y) c[1] = y
        return c[1]
    },
    copy(c: [number, number]): [number, number] {
        return [...c]
    },
    isSameAs(c1: [number, number], c2: [number, number], epsilon: number): boolean {
        return math.equalTo(coord.x(c1), coord.x(c2), epsilon) && math.equalTo(coord.y(c1), coord.y(c2), epsilon)
    }
}
export default coord

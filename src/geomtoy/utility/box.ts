const box = {
    from(c: [number, number], s: [number, number]): [number, number, number, number] {
        return [...c, ...s]
    },
    from2(lc: [number, number], uc: [number, number]): [number, number, number, number] {
        return [lc[0], lc[1], uc[0] - uc[0], uc[1] - lc[1]]
    },
    standardize(b: [number, number, number, number]): [number, number, number, number] {
        return box.standardizeSelf([...b])
    },
    standardizeSelf(b: [number, number, number, number]): [number, number, number, number] {
        if (b[2] < 0) {
            b[0] = b[0] + b[2]
            b[2] = -b[2]
        }
        if (b[3] < 0) {
            b[1] = b[1] + b[3]
            b[3] = -b[3]
        }
        return b
    },
    x(b: [number, number, number, number], x?: number) {
        if (x !== undefined) b[0] = x
        return b[0]
    },
    y(b: [number, number, number, number], y?: number) {
        if (y !== undefined) b[1] = y
        return b[1]
    },
    width(b: [number, number, number, number], w?: number) {
        if (w !== undefined) b[2] = w
        return b[2]
    },
    height(b: [number, number, number, number], h?: number) {
        if (h !== undefined) b[3] = h
        return b[3]
    },
    minX(b: [number, number, number, number]): number {
        return b[0]
    },
    minY(b: [number, number, number, number]): number {
        return b[1]
    },
    maxX(b: [number, number, number, number]): number {
        return b[0] + b[2]
    },
    maxY(b: [number, number, number, number]): number {
        return b[1] + b[3]
    },
    nn(b: [number, number, number, number]): [number, number] {
        return [b[0], b[1]]
    },
    mn(b: [number, number, number, number]): [number, number] {
        return [b[0] + b[2], b[1]]
    },
    mm(b: [number, number, number, number]): [number, number] {
        return [b[0] + b[2], b[1] + b[3]]
    },
    nm(b: [number, number, number, number]): [number, number] {
        return [b[0], b[1] + b[3]]
    }
}

export default box

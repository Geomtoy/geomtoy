export function next(i: number, l: number, closed: boolean) {
    if (i === l - 1) return closed ? 0 : -1;
    return i + 1;
}

export function prev(i: number, l: number, closed: boolean) {
    if (i === 0) return closed ? l - 1 : -1;
    return i - 1;
}

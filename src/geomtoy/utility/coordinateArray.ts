import coord from "./coordinate"
import math from "../utility/math"

const coordArray = {
    get(cs: [number, number][], index: number): [number, number] | null {
        if (math.clamp(index, 0, cs.length) !== index) return null
        return coord.clone(cs[index])
    },
    set(cs: [number, number][], index: number, ref: [number, number]): boolean {
        if (math.clamp(index, 0, cs.length) !== index) return false
        coord.assign(cs[index], ref)
        return true
    },
    append(cs: [number, number][], ref: [number, number]): void {
        cs.push(ref)
    },
    prepend(cs: [number, number][], ref: [number, number]): void {
        cs.unshift(ref)
    },
    insert(cs: [number, number][], index: number, ref: [number, number]): boolean {
        if (math.clamp(index, 0, cs.length) !== index) return false
        cs.splice(index, 0, ref)
        return true
    },
    remove(cs: [number, number][], index: number, minLength: number): boolean {
        if (math.clamp(index, 0, cs.length) !== index) return false
        if (cs.length === minLength) return false
        cs.splice(index, 1)
        return true
    },
    clone(cs: [number, number][]){
        const ncs:[number, number][] = []
        cs.forEach(c=> ncs.push(coord.clone(c)))
        return ncs
    },
    // x first sort, asc order
    sort(cs: [number, number][], epsilon: number) {
        return coordArray.sortSelf(coordArray.clone(cs),epsilon)
    },
    sortSelf(cs: [number, number][], epsilon: number) {
        return cs.sort((c1, c2) => {
            return math.strictSign(c1[0] - c2[0], epsilon) === 0 ? math.strictSign(c1[1] - c2[1], epsilon) : math.strictSign(c1[0] - c2[0], epsilon)
        })
    },
}
export default coordArray

import coord from "./coordinate"
import math from "../utility/math"
import { Coordinate } from "./_type"

const coordArray = {
    get(cs: Coordinate[], index: number): Coordinate | null {
        if (math.clamp(index, 0, cs.length) !== index) return null
        return coord.copy(cs[index])
    },
    set(cs: Coordinate[], index: number, ref: Coordinate): boolean {
        if (math.clamp(index, 0, cs.length) !== index) return false
        coord.assign(cs[index], ref)
        return true
    },
    append(cs: Coordinate[], ref: Coordinate): void {
        cs.push(ref)
    },
    prepend(cs: Coordinate[], ref: Coordinate): void {
        cs.unshift(ref)
    },
    insert(cs: Coordinate[], index: number, ref: Coordinate): boolean {
        if (math.clamp(index, 0, cs.length) !== index) return false
        cs.splice(index, 0, ref)
        return true
    },
    remove(cs: Coordinate[], index: number, minLength: number): boolean {
        if (math.clamp(index, 0, cs.length) !== index) return false
        if (cs.length === minLength) return false
        cs.splice(index, 1)
        return true
    }
}
export default coordArray

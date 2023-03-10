import Type from "./Type";
import Maths from "./Maths";

import type { StaticClass } from "./types";

interface Size extends StaticClass {}
class Size {
    constructor() {
        throw new Error("[G]`Size` can not used as a constructor.");
    }
    /**
     * Whether `v` is a valid size.
     * @param v
     */
    static is(v: any): v is [number, number] {
        return Type.isArray(v) && v.length === 2 && v.every(elem => Type.isRealNumber(elem)) && v[0] >= 0 && v[1] >= 0;
    }
    static isZero(v: [number, number]): v is [number, number] {
        return Type.isArray(v) && v.length === 2 && v.every(elem => Type.isRealNumber(elem)) && (v[0] === 0 || v[1] === 0);
    }
    static isNonZero(v: [number, number]): v is [number, number] {
        return Type.isArray(v) && v.length === 2 && v.every(elem => Type.isRealNumber(elem)) && v[0] > 0 && v[1] > 0;
    }
    static nullSize() {
        return [NaN, NaN] as [number, number];
    }
    /**
     * Whether size `s1` is equal to size `s2`. If `epsilon` is not `undefined`, make an approximate comparison.
     * @param s1
     * @param s2
     * @param epsilon
     */
    static isEqualTo(s1: [number, number], s2: [number, number], epsilon?: number) {
        if (epsilon === undefined) return s1[0] === s2[0] && s1[1] === s2[1];
        return Maths.equalTo(s1[0], s2[0], epsilon) && Maths.equalTo(s1[1], s2[1], epsilon);
    }
    /**
     * The `width` parameter of size `s`.
     * @param s
     * @param w
     */
    static width(s: [number, number], w?: number) {
        if (w !== undefined) s[0] = w;
        return s[0];
    }
    /**
     * The `height` parameter of size `s`.
     * @param s
     * @param h
     */
    static height(s: [number, number], h?: number) {
        if (h !== undefined) s[1] = h;
        return s[1];
    }
}
export default Size;

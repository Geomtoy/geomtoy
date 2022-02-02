import Type from "./Type";
import Math from "./Math";

import type { StaticClass } from "./types";

interface Size extends StaticClass {}
class Size {
    constructor() {
        throw new Error("[G]`Size` can not used as a constructor.");
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
    /**
     * Whether size `s` is valid.
     * @param s
     */
    static isValid(s: [number, number]) {
        return s.every(elem => Type.isRealNumber(elem) && elem > 0);
    }
    /**
     * Whether size `s1` is equal to size `s2`. If `epsilon` is not `undefined`, make an approximate comparison.
     * @param s1
     * @param s2
     * @param epsilon
     */
    static isEqualTo(s1: [number, number], s2: [number, number], epsilon?: number) {
        if (epsilon === undefined) return s1[0] === s2[0] && s1[1] === s2[1];
        return Math.equalTo(s1[0], s2[0], epsilon) && Math.equalTo(s1[1], s2[1], epsilon);
    }
}
export default Size;

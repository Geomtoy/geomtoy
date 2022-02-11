import Type from "./Type";
import Maths from "./Maths";

import type { StaticClass } from "./types";

interface Coordinates extends StaticClass {}
class Coordinates {
    constructor() {
        throw new Error("[G]`Coordinates` can not used as a constructor.");
    }
    /**
     * The `x` coordinate of coordinates `c`.
     * @param c
     * @param x
     */
    static x(c: [number, number], x?: number) {
        if (x !== undefined) c[0] = x;
        return c[0];
    }
    /**
     * The `y` coordinate of coordinates `c`.
     * @param c
     * @param y
     */
    static y(c: [number, number], y?: number) {
        if (y !== undefined) c[1] = y;
        return c[1];
    }
    /**
     * Whether coordinates `c` is valid.
     * @param c
     */
    static isValid(c: [number, number]) {
        return c.every(elem => Type.isRealNumber(elem));
    }
    /**
     * Whether coordinates `c1` is equal to coordinates `c2`. If `epsilon` is not `undefined`, make an approximate comparison.
     * @param c1
     * @param c2
     * @param epsilon
     */
    static isEqualTo(c1: [number, number], c2: [number, number], epsilon?: number) {
        if (epsilon === undefined) return c1[0] === c2[0] && c1[1] === c2[1];
        return Maths.equalTo(c1[0], c2[0], epsilon) && Maths.equalTo(c1[1], c2[1], epsilon);
    }
}
export default Coordinates;

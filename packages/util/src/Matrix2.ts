import type { StaticClass } from "../types";

interface Matrix2 extends StaticClass {}
class Matrix2 {
    constructor() {
        throw new Error("[G]`Matrix2` can not used as a constructor.");
    }
    /**
     * Returns the dot product of matrix2 `m` and vector2 `v`
     * @param m
     * @param v
     */
    static dotVector2(m: [number, number, number, number], v: [number, number]) {
        const [m00, m01, m10, m11] = m;
        const [x, y] = v;

        //m00 m01  x  x  = m00*x+m01*y
        //m10 m11     y    m10*x+m11*y
        return [m00 * x + m01 * y, m10 * x + m11 * y] as [number, number];
    }
}
export default Matrix2;

import type { StaticClass } from "./types";

interface Matrix2 extends StaticClass {}
class Matrix2 {
    constructor() {
        throw new Error("[G]`Matrix2` can not used as a constructor.");
    }
    /**
     * Returns the determinant of matrix2 `m`.
     * @param m
     */
    static determinant(m: [number, number, number, number]) {
        const [m00, m01, m10, m11] = m;
        return m00 * m11 - m01 * m10;
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
    /**
     * Returns a new matrix2 of matrix2 `m` multiplying a scalar `s`.
     * @param m
     * @param s
     */
    static scalarMultiply(m: [number, number, number, number], s: number) {
        const [m00, m01, m10, m11] = m;
        // prettier-ignore
        return [
            m00 * s,
            m01 * s,
            m10 * s,
            m11 * s,
        ] as [number, number, number, number];
    }
    /**
     * Returns the adjoint of matrix2 `m`.
     * @param m
     */
    static adjoint(m: [number, number, number, number]) {
        const [m00, m01, m10, m11] = m;
        // m11 -m01
        //-m10  m00
        return [m11, -m01, -m10, m00] as [number, number, number, number];
    }
    /**
     * Returns the inverse of matrix2 `m`.
     * @param m
     */
    static invert(m: [number, number, number, number]) {
        const det = Matrix2.determinant(m);
        return det === 0 ? undefined : Matrix2.scalarMultiply(Matrix2.adjoint(m), 1 / det);
    }
}
export default Matrix2;

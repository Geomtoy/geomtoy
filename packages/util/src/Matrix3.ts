import type { StaticClass } from "./types";
import Matrix2 from "./Matrix2";

interface Matrix3 extends StaticClass {}
class Matrix3 {
    // m00 m01 m02
    // m10 m11 m12
    // m20 m21 m22
    constructor() {
        throw new Error("[G]`Matrix3` can not used as a constructor.");
    }
    /**
     * Returns the determinant of matrix3 `m`.
     * @param m
     */
    static determinant(m: [number, number, number, number, number, number, number, number, number]) {
        const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = m;
        return m00 * Matrix2.determinant([m11, m12, m21, m22]) - m01 * Matrix2.determinant([m10, m12, m20, m22]) + m02 * Matrix2.determinant([m10, m11, m20, m21]);
    }
    /**
     * Returns the dot product of matrix3 `a` and matrix3 `b`.
     * @param a
     * @param b
     */
    static dotMatrix3(a: [number, number, number, number, number, number, number, number, number], b: [number, number, number, number, number, number, number, number, number]) {
        const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = a;
        const [b00, b01, b02, b10, b11, b12, b20, b21, b22] = b;

        // a00 a01 a02     b00 b01 b02     a00*b00+a01*b10+a02*b20 a00*b01+a01*b11+a02*b21 a00*b02+a01*b12+a02*b22
        // a10 a11 a12  x  b10 b11 b12  =  a10*b00+a11*b10+a12*b20 a10*b01+a11*b11+a12*b21 a10*b02+a11*b12+a12*b22
        // a20 a21 a22     b20 b21 b22     a20*b00+a21*b10+a22*b20 a20*b01+a21*b11+a22*b21 a20*b02+a21*b12+a22*b22

        return [
            a00 * b00 + a01 * b10 + a02 * b20,
            a00 * b01 + a01 * b11 + a02 * b21,
            a00 * b02 + a01 * b12 + a02 * b22,
            a10 * b00 + a11 * b10 + a12 * b20,
            a10 * b01 + a11 * b11 + a12 * b21,
            a10 * b02 + a11 * b12 + a12 * b22,
            a20 * b00 + a21 * b10 + a22 * b20,
            a20 * b01 + a21 * b11 + a22 * b21,
            a20 * b02 + a21 * b12 + a22 * b22
        ] as [number, number, number, number, number, number, number, number, number];
    }
    /**
     * Returns the dot product of matrix3 `m` and vector3 `v`.
     * @param m
     * @param v
     */
    static dotVector3(m: [number, number, number, number, number, number, number, number, number], v: [number, number, number]) {
        const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = m;
        const [v0, v1, v2] = v;
        // m00 m01 m02     v0     m00*v0+m01*v1+m02*v2
        // m10 m11 m12  *  v1  =  m10*v0+m11*v1+m12*v2
        // m20 m21 m22     v2     m20*v0+m21*v1+m22*v2
        return [m00 * v0 + m01 * v1 + m02 * v2, m10 * v0 + m11 * v1 + m12 * v2, m20 * v0 + m21 * v1 + m22 * v2] as [number, number, number];
    }
    /**
     * Returns a new matrix3 of matrix3 `m` multiplying a scalar `s`.
     * @param m
     * @param s
     */
    static scalarMultiply(m: [number, number, number, number, number, number, number, number, number], s: number) {
        const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = m;
        // prettier-ignore
        return [
            m00 * s, 
            m01 * s, 
            m02 * s, 
            m10 * s, 
            m11 * s, 
            m12 * s, 
            m20 * s, 
            m21 * s, 
            m22 * s
        ] as [number, number, number, number, number, number, number, number, number];
    }
    /**
     * Returns the adjoint of matrix3 `m`.
     * @param m
     */
    static adjoint(m: [number, number, number, number, number, number, number, number, number]) {
        const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = m;
        // m11*m22-m12*m21 m02*m21-m01*m22 m01*m12-m02*m11
        // m12*m20-m10*m22 m00*m22-m02*m20 m10*m02-m00*m12
        // m10*m21-m11*m20 m01*m20-m00*m21 m00*m11-m10*m01
        return [
            m11 * m22 - m12 * m21,
            m02 * m21 - m01 * m22,
            m01 * m12 - m02 * m11,
            m12 * m20 - m10 * m22,
            m00 * m22 - m02 * m20,
            m10 * m02 - m00 * m12,
            m10 * m21 - m11 * m20,
            m01 * m20 - m00 * m21,
            m00 * m11 - m10 * m01
        ] as [number, number, number, number, number, number, number, number, number];
    }
    /**
     * Returns the inverse of matrix3 `m`.
     * @param m
     */
    static invert(m: [number, number, number, number, number, number, number, number, number]) {
        const det = Matrix3.determinant(m);
        return det === 0 ? undefined : Matrix3.scalarMultiply(Matrix3.adjoint(m), 1 / det);
    }
}
export default Matrix3;

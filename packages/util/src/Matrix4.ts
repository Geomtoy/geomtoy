import type { StaticClass } from "./types";
import Matrix3 from "./Matrix3";

interface Matrix4 extends StaticClass {}
class Matrix4 {
    // m00 m01 m02 m03
    // m10 m11 m12 m13
    // m20 m21 m22 m23
    // m30 m31 m32 m33
    constructor() {
        throw new Error("[G]`Matrix4` can not used as a constructor.");
    }
    /**
     * Returns the determinant of matrix4 `m`.
     * @param m
     */
    static determinant(m: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]) {
        const [m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33] = m;

        return (
            m00 * Matrix3.determinant([m11, m12, m13, m21, m22, m23, m31, m32, m33]) -
            m01 * Matrix3.determinant([m10, m12, m13, m20, m22, m23, m30, m32, m33]) +
            m02 * Matrix3.determinant([m10, m11, m13, m20, m21, m23, m30, m31, m33]) -
            m03 * Matrix3.determinant([m10, m11, m12, m20, m21, m22, m30, m31, m32])
        );
    }
    /**
     * Returns the dot product of matrix4 `m` and vector4 `v`.
     * @param m
     * @param v
     */
    static dotVector4(m: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number], v: [number, number, number, number]) {
        const [m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33] = m;
        const [v0, v1, v2, v3] = v;

        // m00 m01 m02 m03     v0     m00*v0+m01*v1+m02*v2+m03*v3
        // m10 m11 m12 m13  *  v1  =  m10*v0+m11*v1+m12*v2+m13*v3
        // m20 m21 m22 m23     v2     m20*v0+m21*v1+m22*v2+m23*v3
        // m30 m31 m32 m33     v3     m30*v0+m31*v1+m32*v2+m33*v3

        // prettier-ignore
        return [
            m00 * v0 + m01 * v1 + m02 * v2 + m03 * v3, 
            m10 * v0 + m11 * v1 + m12 * v2 + m13 * v3, 
            m20 * v0 + m21 * v1 + m22 * v2 + m23 * v3, 
            m30 * v0 + m31 * v1 + m32 * v2 + m33 * v3
        ] as [
            number,
            number,
            number,
            number
        ];
    }
    /**
     * Returns a new matrix4 of matrix4 `m` multiplying a scalar `s`.
     * @param m
     * @param s
     */
    static scalarMultiply(m: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number], s: number) {
        const [m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33] = m;
        // prettier-ignore
        return [
            m00 * s,
            m01 * s,
            m02 * s,
            m03 * s,
            m10 * s,
            m11 * s,
            m12 * s,
            m13 * s,
            m20 * s,
            m21 * s,
            m22 * s,
            m23 * s,
            m30 * s,
            m31 * s,
            m32 * s,
            m33 * s,
        ] as [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    }
}
export default Matrix4;

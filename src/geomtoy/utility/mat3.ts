const mat3 = {
    determinant([a00, a01, a02, a10, a11, a12, a20, a21, a22]: [number, number, number, number, number, number, number, number, number]) {
        return a00 * a11 * a22 + a01 * a12 * a20 + a02 * a10 * a21 - a00 * a12 * a21 - a01 * a10 * a22 - a02 * a11 * a20
    },
    dotMat3(
        [a00, a01, a02, a10, a11, a12, a20, a21, a22]: [number, number, number, number, number, number, number, number, number],
        [b00, b01, b02, b10, b11, b12, b20, b21, b22]: [number, number, number, number, number, number, number, number, number]
    ): [number, number, number, number, number, number, number, number, number] {
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
        ]
    },
    dotVec3(
        [m00, m01, m02, m10, m11, m12, m20, m21, m22]: [number, number, number, number, number, number, number, number, number],
        [x, y, z]: [number, number, number]
    ): [number, number, number] {
        // m00 m01 m02     x     m00*x+m01*y+m02*z
        // m10 m11 m12  x  y  =  m10*x+m11*y+m12*z
        // m20 m21 m22     z     m20*x+m21*y+m22*z
        return [m00 * x + m01 * y + m02 * z, m10 * x + m11 * y + m12 * z, m20 * x + m21 * y + m22 * z]
    },
    scalarMultiply(
        [m00, m01, m02, m10, m11, m12, m20, m21, m22]: [number, number, number, number, number, number, number, number, number],
        scalar: number
    ): [number, number, number, number, number, number, number, number, number] {
        return [m00 * scalar, m01 * scalar, m02 * scalar, m10 * scalar, m11 * scalar, m12 * scalar, m20 * scalar, m21 * scalar, m22 * scalar]
    },

    adjoint([m00, m01, m02, m10, m11, m12, m20, m21, m22]: [number, number, number, number, number, number, number, number, number]): [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
    ] {
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
        ]
    },
    invert([m00, m01, m02, m10, m11, m12, m20, m21, m22]: [number, number, number, number, number, number, number, number, number]):
        | [number, number, number, number, number, number, number, number, number]
        | undefined {
        let m: [number, number, number, number, number, number, number, number, number] = [m00, m01, m02, m10, m11, m12, m20, m21, m22],
            det = mat3.determinant(m)
        if (det === 0) return undefined
        return mat3.scalarMultiply(mat3.adjoint(m), 1 / det)
    }
}

export default mat3

const mat2 = {
    dotVec2([m00, m01, m10, m11]: [number, number, number, number], [x, y]: [number, number]): [number, number] {
        return [m00 * x + m01 * y, m10 * x + m11 * y]
    }
}

export default mat2

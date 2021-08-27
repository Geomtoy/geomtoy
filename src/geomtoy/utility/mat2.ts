import { Matrix2, Vector2 } from "./_type"

const mat2 = {
    dotVec2([m00, m01, m10, m11]: Matrix2, [x, y]: [number, number]): Vector2 {
        //m00 m01  x  x  = m00*x+m01*y     
        //m10 m11     y    m10*x+m11*y 
        return [m00 * x + m01 * y, m10 * x + m11 * y]
    }
}

export default mat2

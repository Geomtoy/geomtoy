import { Angle } from "./_type"

const angle = {
    /**
     * Simplify angle `a` into the interval `[0, 2*Math.PI)`.
     * @param a
     */
    simplify(a: Angle): Angle {
        let t = a % (2 * Math.PI)
        return t < 0 ? t + 2 * Math.PI : t
    },
    /**
     * Simplify angle `a` into the interval `(-Math.PI, Math.PI]`
     * @param a
     */
    simplify2(a: Angle): Angle {
        let t = angle.simplify(a)
        return t > Math.PI ? t - 2 * Math.PI : t
    },
    /**
     * Convert the unit of an angle from degree to radian
     * @param degree
     */
    degreeToRadian(degree: Angle): Angle {
        return (degree * Math.PI) / 180
    },
    /**
     * Convert the unit of an angle from radian to degree
     * @param radian
     */
    radianToDegree(radian: Angle): Angle {
        return (radian * 180) / Math.PI
    }
}

export default angle

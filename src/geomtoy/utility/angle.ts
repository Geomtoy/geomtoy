const angle = {
    /**
     * Simplify angle `a` into the interval `[0, 2*Math.PI)`
     * @param {number} a
     * @returns {number}
     */
    simplify(a: number): number {
        let t = a % (2 * Math.PI)
        return t < 0 ? t + 2 * Math.PI : t
    },
    /**
     * Simplify angle `a` into the interval `(-Math.PI, Math.PI]`
     * @param {number} a
     * @returns {number}
     */
    simplify2(a: number): number {
        let t = angle.simplify(a)
        return t > Math.PI ? t - 2 * Math.PI : t
    },
    /**
     * Convert the unit of an angle from degree to radian
     * @param {number} degree
     * @returns {number}
     */
    degreeToRadian(degree: number): number {
        return (degree * Math.PI) / 180
    },
    /**
     * Convert the unit of an angle from radian to degree
     * @param {number} radian
     * @returns {number}
     */
    radianToDegree(radian: number): number {
        return (radian * 180) / Math.PI
    }
}

export default angle

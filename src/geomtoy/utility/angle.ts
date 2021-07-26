const angleUtility = {
    /**
     * Simplify an `angle` to [0, 2*Math.PI)
     * @param {number} angle
     * @returns {number}
     */
    simplify(angle: number): number {
        let t = angle % (2 * Math.PI)
        return t < 0 ? t + 2 * Math.PI : t
    },
    /**
     * Simplify an `angle` to (-Math.PI, Math.PI]
     * @param {number} angle
     * @returns {number}
     */
    simplify2(angle: number): number {
        let t = angleUtility.simplify(angle)
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

export default angleUtility

const angleUtility = {
    /**
     * 将角简化到[0, 2*Math.PI)
     * @param {number} angle
     * @returns {number}
     */
    simplify(angle: number): number {
        let t = angle % (2 * Math.PI)
        return t < 0 ? t + 2 * Math.PI : t
    },

    /**
     * 将角简化到(-Math.PI, Math.PI]
     * @param {number} angle
     * @returns {number}
     */
    simplify2(angle: number): number {
        let t = angleUtility.simplify(angle)
        return t > Math.PI ? t - 2 * Math.PI : t
    },

    /**
     * 将顺时针正角下的角与逆时针正角下的角进行转换
     * @param {number} angle
     * @returns {number}
     */
    reverse(angle: number): number {
        return angleUtility.simplify(-angle)
    },

    /**
     * 角度转弧度
     * @param {number} degree
     * @returns {number}
     */
    degreeToRadian(degree: number): number {
        return (degree * Math.PI) / 180
    },

    /**
     * 弧度转角度
     * @param {number} radian
     * @returns {number}
     */
    radianToDegree(radian: number): number {
        return (radian * 180) / Math.PI
    }
}

export default angleUtility

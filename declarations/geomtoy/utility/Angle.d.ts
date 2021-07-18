declare const angleUtility: {
    /**
     * 将角简化到[0, 2*Math.PI)
     * @param {number} angle
     * @returns {number}
     */
    simplify(angle: number): number;
    /**
     * 将角简化到(-Math.PI, Math.PI]
     * @param {number} angle
     * @returns {number}
     */
    simplify2(angle: number): number;
    /**
     * 将顺时针正角下的角与逆时针正角下的角进行转换
     * @param {number} angle
     * @returns {number}
     */
    reverse(angle: number): number;
    /**
     * 角度转弧度
     * @param {number} degree
     * @returns {number}
     */
    degreeToRadian(degree: number): number;
    /**
     * 弧度转角度
     * @param {number} radian
     * @returns {number}
     */
    radianToDegree(radian: number): number;
};
export default angleUtility;

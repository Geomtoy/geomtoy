declare const angleUtility: {
    /**
     * Simplify an `angle` to [0, 2*Math.PI)
     * @param {number} angle
     * @returns {number}
     */
    simplify(angle: number): number;
    /**
     * Simplify an `angle` to (-Math.PI, Math.PI]
     * @param {number} angle
     * @returns {number}
     */
    simplify2(angle: number): number;
    /**
     * Convert the unit of an angle from degree to radian
     * @param {number} degree
     * @returns {number}
     */
    degreeToRadian(degree: number): number;
    /**
     * Convert the unit of an angle from radian to degree
     * @param {number} radian
     * @returns {number}
     */
    radianToDegree(radian: number): number;
};
export default angleUtility;

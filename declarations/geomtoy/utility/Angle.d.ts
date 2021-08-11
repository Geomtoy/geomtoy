declare const angle: {
    /**
     * Simplify angle `a` into the interval `[0, 2*Math.PI)`
     * @param {number} a
     * @returns {number}
     */
    simplify(a: number): number;
    /**
     * Simplify angle `a` into the interval `(-Math.PI, Math.PI]`
     * @param {number} a
     * @returns {number}
     */
    simplify2(a: number): number;
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
export default angle;

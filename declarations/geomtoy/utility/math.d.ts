declare const math: {
    abs: (x: number) => number;
    hypot: (...values: number[]) => number;
    pow: (x: number, y: number) => number;
    max: (...values: number[]) => number;
    min: (...values: number[]) => number;
    sqrt: (x: number) => number;
    cbrt: (x: number) => number;
    sign: (x: number) => number;
    random: () => number;
    round: (x: number) => number;
    ceil: (x: number) => number;
    floor: (x: number) => number;
    acos: (x: number) => number;
    asin: (x: number) => number;
    atan: (x: number) => number;
    atan2: (y: number, x: number) => number;
    cos: (n: number) => number;
    sin: (n: number) => number;
    tan: (n: number) => number;
    /**
     * Clamps number `n` between the lower bound `l` and the upper bound `u`
     * @param {number} n
     * @param {number} l
     * @param {number} u
     */
    clamp: (n: number, l: number, u: number) => number;
    /**
     * Floating point number comparison reference
     * @see https://www.learncpp.com/cpp-tutorial/relational-operators-and-floating-point-comparisons/comment-page-2/
     * @see https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/
     * @see http://stackoverflow.com/questions/17333/most-effective-way-for-float-and-double-comparison
     *
     * Conclusion:
     * - Set parameter `epsilon`
     * - First use `absEpsilon = epsilon`, check whether the difference between the two numbers is very close to 0("[-epsilon,epsilon]"), mainly deal with the difference of the decimal part
     * - Then calculate `relEpsilon` according to the magnitude: `relEpsilon = magnitude * epsilon`, mainly dealing with the difference of the integer part
     */
    /**
     * Is number `a` approximately equal to number `b`
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    equalTo(a: number, b: number, epsilon?: number): boolean;
    /**
     * Is number `a` definitely greater than number `b`
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    greaterThan(a: number, b: number, epsilon?: number): boolean;
    /**
     * Is number `a` definitely less than number `b`
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    lessThan(a: number, b: number, epsilon?: number): boolean;
    /**
     * Strictly determine the sign of a number
     * @summary
     * - If `n` is in "(-Infinity,-epsilon)", then `-1`
     * - If `n` is in "[-epsilon,epsilon]", then `0`
     * - If `n` is in "(epsilon,+Infinity)", then `1`
     * @param {number} n
     * @param {number} epsilon
     * @returns {number}
     */
    strictSign(n: number, epsilon?: number): number;
    /**
     * Calculate the solution/roots of the quadratic equation in one variable "ax^2+bx+c=0"
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @returns {Array<number>}
     */
    quadraticRoots(a: number, b: number, c: number): Array<number>;
};
export default math;

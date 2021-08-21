const math = {
    PI:Math.PI, // 884279719003555/281474976710656
    Infinity:Number.POSITIVE_INFINITY, //Infinity, `Math.pow(2, 1024)`
    Tan90:Math.tan(Math.PI/2), // 16331239353195370

    abs: Math.abs,
    hypot: Math.hypot,
    pow: Math.pow,
    max: Math.max,
    min: Math.min,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    sign: Math.sign,
    random: Math.random,
    round: Math.round,
    ceil: Math.ceil,
    floor: Math.floor,
    acos: Math.acos,
    asin: Math.asin,
    atan: Math.atan,
    atan2: Math.atan2,
    cos: Math.cos,
    sec: (n: number) =>  1 / Math.cos(n),
    sin: Math.sin,
    csc: (n: number) =>  1 / math.sin(n),
    tan:  Math.tan,

    /**
     * Lerp between `u` and `v` by `t`
     * @see {@link https://en.wikipedia.org/wiki/Linear_interpolation}
     * @param {number} u
     * @param {number} v
     * @param {number} t
     * @returns {number}
     */
    lerp: (u: number, v: number, t: number): number => {
        return (1 - t) * u + t * v
    },
    /**
     * Clamps number `n` between the lower bound `l` and the upper bound `u`
     * @param {number} n
     * @param {number} l
     * @param {number} u
     * @returns {number}
     */
    clamp: (n: number, l: number, u: number): number => {
        if ((n - l) * (n - u) <= 0) return n
        if (n < l) return l < u ? l : u
        return l > u ? l : u
    },

    /**
     * Floating point number comparison reference
     * @see https://www.learncpp.com/cpp-tutorial/relational-operators-and-floating-point-comparisons/comment-page-2/
     * @see https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/
     * @see http://stackoverflow.com/questions/17333/most-effective-way-for-float-and-double-comparison
     *
     * Conclusion:
     * - Set parameter `epsilon`
     * - First use `absEpsilon = epsilon`, check whether the difference between the two numbers is very close to 0(`[-epsilon, epsilon]`), mainly deal with the difference of the decimal part
     * - Then calculate `relEpsilon` according to the magnitude: `relEpsilon = magnitude * epsilon`, mainly dealing with the difference of the integer part
     */

    /**
     * Is number `a` approximately equal to number `b`
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    equalTo(a: number, b: number, epsilon: number = Number.EPSILON): boolean {
        if (math.abs(a - b) <= epsilon) return true
        return math.abs(a - b) <= (math.abs(a) < math.abs(b) ? math.abs(b) : math.abs(a)) * epsilon
    },
    /**
     * Is number `a` definitely greater than number `b`
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    greaterThan(a: number, b: number, epsilon: number = Number.EPSILON): boolean {
        if (math.abs(a - b) <= epsilon) return false
        return a - b > (math.abs(a) < math.abs(b) ? math.abs(b) : math.abs(a)) * epsilon
    },

    /**
     * Is number `a` definitely less than number `b`
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    lessThan(a: number, b: number, epsilon: number = Number.EPSILON): boolean {
        if (math.abs(b - a) <= epsilon) return false
        return b - a > (math.abs(a) < math.abs(b) ? math.abs(b) : math.abs(a)) * epsilon
    },
    /**
     * Strictly determine the sign of a number
     * @summary
     * - If `n` is in `(-Infinity, -epsilon)`, then -1
     * - If `n` is in `[-epsilon, epsilon]`, then 0
     * - If `n` is in `(epsilon, +Infinity)`, then 1
     * @param {number} n
     * @param {number} epsilon
     * @returns {number}
     */
    strictSign(n: number, epsilon: number = Number.EPSILON): number {
        return Number(n > epsilon) - Number(n < -epsilon)
    },
    /**
     * Calculate the solution/roots of the quadratic equation in one variable "ax^2+bx+c=0"
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @returns {Array<number>}
     */
    quadraticRoots(a: number, b: number, c: number): Array<number> {
        let rs = [],
            dis = b ** 2 - 4 * a * c
        if (dis > 0) {
            rs.push((-b + math.sqrt(dis)) / (2 * a))
            rs.push((-b - math.sqrt(dis)) / (2 * a))
        } else if (dis == 0) {
            rs.push(-b / (2 * a))
        }
        return rs
    }
}

export default math

const math = {
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
    atan2: (y: number, x: number): number => {
        // Note: Math.atan2 return the ANTICLOCKWISE angle, in the range of [-Math.PI, Math.PI]
        // @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2}
        return -Math.atan2(y, x)
    },
    cos: (n: number) => {
        n = n % (2 * Math.PI)
        if (n < 0) n = -n // cos(a) = cos(-a)
        switch (n / (Math.PI / 2)) {
            // -0 === +0
            case 0:
                return 1
            case 1:
                return 0
            case 2:
                return -1
            case 3:
                return 0
        }
        return Math.cos(n)
    },
    sin: (n: number) => {
        n = n % (2 * Math.PI)
        if (n < 0) n = -n // sin(-a) = -sin(a)
        switch (n / (Math.PI / 2)) {
            // -0 === +0
            case 0:
                return 0
            case 1:
                return 1
            case 2:
                return 0
            case 3:
                return -1
        }
        return Math.sin(n)
    },
    tan: (n: number) => {
        n = n % (2 * Math.PI)
        if (n < 0) n = -n // tan(-a) = -tan(a)
        switch (n / (Math.PI / 2)) {
            // -0 === +0
            case 0:
                return 0
            case 1:
                return Infinity
            case 2:
                return 0
            case 3:
                return -Infinity
        }
        return Math.tan(n)
    },
    /**
     * Clamps number `n` between the lower bound `l` and the upper bound `u`
     * @param {number} n
     * @param {number} l
     * @param {number} u
     */
    clamp: (n: number, l: number, u: number) => {
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
     * - If `n` is in "(-Infinity,-epsilon)", then `-1`
     * - If `n` is in "[-epsilon,epsilon]", then `0`
     * - If `n` is in "(epsilon,+Infinity)", then `1`
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

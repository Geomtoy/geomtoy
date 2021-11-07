const math = {
    // 3.141592653589793 = 884279719003555/281474976710656
    PI: Math.PI,
    // 2 ** 1024 ≈ 1.797693134862315E+308 = Number.MAX_VALUE
    Infinity: Infinity,
    // 16331239353195370
    Tan90: Math.tan(Math.PI / 2),
    // -16331239353195370
    TanN90: Math.tan(-Math.PI / 2),
    // 6.123233995736766e-17
    Cot90: 1 / Math.tan(Math.PI / 2),
    // -6.123233995736766e-17
    CotN90: 1 / Math.tan(-Math.PI / 2),
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
    atan2: (y: number, x: number) => {
        // @see https://tc39.es/ecma262/#sec-math.atan2
        // When `y` and `x` are respectively equal to `±0`, the value of `Math.atan2` is specified rather than calculated,
        // but whether the result is 0 or `Math.PI`, these results are meaningless for the angle of zero vector.
        // The zero vector has no direction, so there is no angle.
        // So when `y` and `x` are respectively equal to `±0`, `Math.atan2` need return `NaN`(even there is an underflow).
        if (y === 0 && x === 0) return NaN
        return Math.atan2(y, x)
    },
    acos: Math.acos,
    asin: Math.asin,
    atan: Math.atan,
    acot: (x: number) => {
        Math.atan(1 / x)
    },
    // Because `Infinity` cannot participate in arithmetic calculations well, and we need to implement
    // the secant, cosecant, cotangent functions works on 0, `Math.PI / 2` etc.,
    // so we must keep or make sure the sine and tangent functions
    // to return approximate values when the return value is 0.
    cos: Math.cos,
    sec: (x: number) => {
        return 1 / math.cos(x)
    },
    sin: (x: number) => {
        if (x === 0) return math.cos(Math.PI / 2)
        return Math.sin(x)
    },
    csc: (x: number) => {
        return 1 / math.sin(x)
    },
    tan: (x: number): number => {
        if (x === 0) return math.cot(Math.PI / 2)
        return Math.tan(x)
    },
    cot: (x: number) => {
        return 1 / math.tan(x)
    },
    logAny: (b: number, n: number) => {
        return Math.log(n) / Math.log(b)
    },
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

    inInterval(n: number, l: number, u: number, lOpen = false, uOpen = false) {
        return (lOpen ? n > l : n >= l) && (uOpen ? n < u : n <= u)
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
     */
    equalTo(a: number, b: number, epsilon: number): boolean {
        if (math.abs(a - b) <= epsilon) return true
        return math.abs(a - b) <= (math.abs(a) < math.abs(b) ? math.abs(b) : math.abs(a)) * epsilon
    },
    /**
     * Is number `a` definitely greater than number `b`
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     */
    greaterThan(a: number, b: number, epsilon: number): boolean {
        if (math.abs(a - b) <= epsilon) return false
        return a - b > (math.abs(a) < math.abs(b) ? math.abs(b) : math.abs(a)) * epsilon
    },
    /**
     * Is number `a` definitely less than number `b`
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     */
    lessThan(a: number, b: number, epsilon: number): boolean {
        if (math.abs(b - a) <= epsilon) return false
        return b - a > (math.abs(a) < math.abs(b) ? math.abs(b) : math.abs(a)) * epsilon
    },
    compare(a: number, b: number, epsilon: number): number {
        let d = a - b,
            r = math.abs(a) < math.abs(b) ? math.abs(b) : math.abs(a)
        return math.abs(d) <= epsilon ? 0 : d > r * epsilon ? 1 : -d > r * epsilon ? -1 : 0
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
     */
    quadraticRoots(a: number, b: number, c: number): number[] {
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
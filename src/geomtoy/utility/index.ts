import G from ".."
import _ from "lodash"
import angle from "./angle"
import type from "./type"

export default {
    angle:{
        ...angle
    },
    type:{
        ...type
    },

    /**
     * 利用求根公式计算一元二次方程(ax^2 + bx + c = 0)的解
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @returns {Array<number>}
     */
    solveQuadraticEquation(a: number, b: number, c: number): Array<number> {
        let roots = []
        let discriminant = b ** 2 - 4 * a * c
        if (discriminant > 0) {
            roots.push((-b + Math.sqrt(discriminant)) / (2 * a))
            roots.push((-b - Math.sqrt(discriminant)) / (2 * a))
        } else if (discriminant == 0) {
            roots.push(-b / (2 * a))
        } else {
            //判别式<0，无根
        }
        return roots
    },

    /**
     * 浮点数大小判断参考
     * @see https://www.learncpp.com/cpp-tutorial/relational-operators-and-floating-point-comparisons/comment-page-2/
     * @see https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/
     * @see http://stackoverflow.com/questions/17333/most-effective-way-for-float-and-double-comparison
     *
     * 结论：
     *
     * [近似相等的比较]
     * 设置参数epsilon,
     * 先使用absEpsilon=epsilon，检查两个数的差距是否很靠近0（-1<x<1），主要处理小数部分的差异
     * 然后再按照数量级计算：relEpsilon=数量级*epsilon,主要处理整数部分的差异
     * 如：
     * 设epsilon=0.000001
     * 情况一：
     * a=12.0000011         b=12.0000012
     * Math.abs(a-b)=0.0000001 < 0.000001       ====>认为它们近似相等
     *
     * 情况二：
     * a=123456780.0        b=123456790.0
     * Math.abs(a-b)=10 > 0.000001
     * relEpsilon=123456790.0*0.000001=123.45679
     * Math.abs(a-b)=10 < 123.45679             ====>认为它们近似相等，此时随着数量级放宽了近似相等的标准
     *
     * 情况三：
     * a=12344.1            b=12345.2
     * Math.abs(a-b)=1.1 > 0.000001
     * relEpsilon=12345.2*0.000001=0.0123452
     * Math.abs(a-b)=1.1 > 0.0123452            ====>认为它们不近似相等，此时随着数量级放宽了近似相等的标准，但差异值仍然大于了
     *
     * 情况四：
     * a=0.1234561          b=0.1234562
     * Math.abs(a-b)=0.0000001 < 0.000001       ====>认为它们近似相等
     *
     * 情况五：
     * a=0.12341            b=0.12342
     * Math.abs(a-b)=0.00001 > 0.000001
     * relEpsilon=0.00012*0.000001=0.0000000012
     * Math.abs(a-b)=0.00001 > 0.0000000012     ====>认为它们不近似相等，此时随着数量级收紧了近似相等的标准，所以差异值显得更大了
     *
     * [大于和小于的比较]
     * 同理
     *
     */

    /**
     * 两个数字是否近似相等
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    apxEqualsTo(a: number, b: number, epsilon: number = G.options.epsilon): boolean {
        if (Math.abs(a - b) <= epsilon) return true
        return Math.abs(a - b) <= (Math.abs(a) < Math.abs(b) ? Math.abs(b) : Math.abs(a)) * epsilon
    },
    /**
     * 数字a是否肯定大于数字b
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    defGreaterThan(a: number, b: number, epsilon: number = G.options.epsilon): boolean {
        if (Math.abs(a - b) <= epsilon) return false
        return a - b > (Math.abs(a) < Math.abs(b) ? Math.abs(b) : Math.abs(a)) * epsilon
    },

    /**
     * 数字a是否肯定小于数字b
     * @param {number} a
     * @param {number} b
     * @param {number} epsilon
     * @returns {boolean}
     */
    defLessThan(a: number, b: number, epsilon: number = G.options.epsilon): boolean {
        if (Math.abs(b - a) <= epsilon) return false
        return b - a > (Math.abs(a) < Math.abs(b) ? Math.abs(b) : Math.abs(a)) * epsilon
    },

    /**
     * 严格判断一个数字的符号
     * 如果数字在(-Infinite,-epsilon)，则0 - 1 = -1
     * 如果数字在[-epsilon,epsilon]，则0 - 0 = 0
     * 如果数字在(epsilon,+Infinity)，则1 - 0 = 1
     * @param {number} x
     * @param {number} epsilon
     * @returns {number}
     */
    strictSign(x: number, epsilon: number = G.options.epsilon): number {
        return Number(x > epsilon) - Number(x < -epsilon)
    }
}

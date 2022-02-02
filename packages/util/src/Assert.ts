import Type from "./Type";

import type { StaticClass } from "../types";

interface Assert extends StaticClass {}
class Assert {
    constructor() {
        throw new Error("[G]`Assert` can not used as a constructor.");
    }
    /**
     * Throw error with message `msg` when condition `condition` is not satisfied.
     * @param condition
     * @param msg
     */
    static condition(condition: any, msg: string): asserts condition {
        if (!condition) {
            throw new TypeError(`${msg}`);
        }
    }
    /**
     * Throw error when value `v` is not a real number, message will use `p` as parameter name.
     * @param v
     * @param p
     */
    static isRealNumber(v: any, p: string): asserts v is number {
        if (!Type.isRealNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a real number(number excluding ±\`Infinity\` and \`NaN\`).`);
        }
    }
    /**
     * Throw error when value `v` is not an extended real number, message will use `p` as parameter name.
     * @param v
     * @param p
     */
    static isExtendedRealNumber(v: any, p: string): asserts v is number {
        if (!Type.isExtendedRealNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a number not \`NaN\`(but including ±\`Infinity\`).`);
        }
    }
    /**
     * Throw error when value `v` is not an integer, message will use `p` as parameter name.
     * @param v
     * @param p
     */
    static isInteger(v: any, p: string): asserts v is number {
        if (!Type.isInteger(v)) {
            throw new TypeError(`[G]The \`${p}\` should be an integer.`);
        }
    }
    /**
     * Throw error when value `v` is not a positive number, message will use `p` as parameter name.
     * @param v
     * @param p
     */
    static isPositiveNumber(v: any, p: string): asserts v is number {
        if (!Type.isPositiveNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a positive number.`);
        }
    }
    /**
     * Throw error when value `v` is not a negative number, message will use `p` as parameter name.
     * @param v
     * @param p
     */
    static isNegativeNumber(v: any, p: string): asserts v is number {
        if (!Type.isNegativeNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a negative number.`);
        }
    }
    /**
     * Throw error when value `v` is not a nonzero number, message will use `p` as parameter name.
     * @param v
     * @param p
     */
    static isNonZeroNumber(v: any, p: string): asserts v is number {
        if (!Type.isNonZeroNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a nonzero number.`);
        }
    }
    /**
     * Throw error when value `v` failed in comparison `t` with number `n`, message will use `p` as parameter name.
     * @param v
     * @param p
     * @param t
     * @param n
     */
    static comparison(v: any, p: string, t: "gt" | "lt" | "eq" | "ge" | "le" | "ne", n: number) {
        if (t === "gt" && !(v > n)) {
            throw new TypeError(`[G]The \`${p}\` should be greater than ${n}.`);
        }
        if (t === "lt" && !(v < n)) {
            throw new TypeError(`[G]The \`${p}\` should be less than ${n}.`);
        }
        if (t === "eq" && !(v === n)) {
            throw new TypeError(`[G]The \`${p}\` should be equal to ${n}.`);
        }
        if (t === "ge" && !(v >= n)) {
            throw new TypeError(`[G]The \`${p}\` should be greater than or equal to ${n}.`);
        }
        if (t === "le" && !(v <= n)) {
            throw new TypeError(`[G]The \`${p}\` should be less than or equal to ${n}.`);
        }
        if (t === "ne" && !(v !== n)) {
            throw new TypeError(`[G]The \`${p}\` should not be equal to ${n}.`);
        }
    }
    /**
     * Throw error when value `v` is not a number array represent coordinates, message will use `p` as parameter name.
     * @param v
     * @param p
     */
    static isCoordinates(v: any, p: string): asserts v is [number, number] {
        if (!Type.isCoordinates(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a number array represent coordinates.`);
        }
    }
    /**
     * Throw error when value `v` is not a number array represent size, message will use `p` as parameter name.
     * @param v
     * @param p
     */
    static isSize(v: any, p: string): asserts v is [number, number] {
        if (!Type.isSize(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a number array represent size.`);
        }
    }
    /**
     * Throw error when value `v` is not a number array represent box, message will use `p` as parameter name.
     * @param v
     * @param p
     */
    static isBox(v: any, p: string): asserts v is [number, number] {
        if (!Type.isBox(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a number array represent box.`);
        }
    }
}
export default Assert;

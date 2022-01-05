import util from ".";

interface Assertion {
    condition(condition: any, msg?: string): asserts condition;
    isNumberNotNaN(value: any, p: string): asserts value is number;
    isRealNumber(value: any, p: string): asserts value is number;
    isInteger(value: any, p: string): asserts value is number;
    isPositiveNumber(value: any, p: string): asserts value is number;
    isNegativeNumber(value: any, p: string): asserts value is number;
    isNonZeroNumber(value: any, p: string): asserts value is number;
    isCoordinates(value: any, p: string): asserts value is [number, number];
    isSize(value: any, p: string): asserts value is [number, number];
    comparison(value: any, p: string, t: "gt" | "lt" | "eq" | "ge" | "le" | "ne", n: number): void;
}

const assert: Assertion = {
    condition(condition: any, msg?: string): asserts condition {
        if (!condition) {
            throw new TypeError(`${msg}`);
        }
    },
    isNumberNotNaN(value: any, p: string): asserts value is number {
        if (!util.isNumberNotNaN(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a number not \`NaN\`(but including \`Infinity\`).`);
        }
    },
    isRealNumber(value: any, p: string): asserts value is number {
        if (!util.isRealNumber(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a real number(number excluding \`Infinity\` and \`NaN\`).`);
        }
    },
    isInteger(value: any, p: string): asserts value is number {
        if (!util.isInteger(value)) {
            throw new TypeError(`[G]The \`${p}\` should be an integer.`);
        }
    },
    isPositiveNumber(value: any, p: string): asserts value is number {
        if (!util.isPositiveNumber(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a positive number.`);
        }
    },
    isNegativeNumber(value: any, p: string): asserts value is number {
        if (!util.isNegativeNumber(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a negative number.`);
        }
    },
    isNonZeroNumber(value: any, p: string): asserts value is number {
        if (!util.isNonZeroNumber(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a nonzero number.`);
        }
    },
    isCoordinates(value: any, p: string): asserts value is [number, number] {
        if (!util.isCoordinates(value)) {
            throw new TypeError(`[G]The \`${p}\` should be coordinates.`);
        }
    },
    isSize(value: any, p: string): asserts value is [number, number] {
        if (!util.isSize(value)) {
            throw new TypeError(`[G]The \`${p}\` should be a size.`);
        }
    },
    comparison(value: any, p: string, t: "gt" | "lt" | "eq" | "ge" | "le" | "ne", n: number) {
        if (t === "gt" && !(value > n)) {
            throw new TypeError(`[G]The \`${p}\` should be greater than ${n}.`);
        }
        if (t === "lt" && !(value < n)) {
            throw new TypeError(`[G]The \`${p}\` should be less than ${n}.`);
        }
        if (t === "eq" && !(value === n)) {
            throw new TypeError(`[G]The \`${p}\` should be equal to ${n}.`);
        }
        if (t === "ge" && !(value >= n)) {
            throw new TypeError(`[G]The \`${p}\` should be greater than or equal to ${n}.`);
        }
        if (t === "le" && !(value <= n)) {
            throw new TypeError(`[G]The \`${p}\` should be less than or equal to ${n}.`);
        }
        if (t === "ne" && !(value !== n)) {
            throw new TypeError(`[G]The \`${p}\` should not be equal to ${n}.`);
        }
    }
};
export default assert;

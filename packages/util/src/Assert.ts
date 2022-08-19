import Angle from "./Angle";
import Box from "./Box";
import Coordinates from "./Coordinates";
import Length from "./Length";
import Size from "./Size";
import Type from "./Type";

import type { StaticClass } from "./types";
import Vector2 from "./Vector2";

interface Assert extends StaticClass {}
class Assert {
    constructor() {
        throw new Error("[G]`Assert` can not used as a constructor.");
    }

    static condition(condition: any, msg: string): asserts condition {
        if (!condition) {
            throw new TypeError(`${msg}`);
        }
    }
    // #region Number
    static isInteger(v: any, p: string): asserts v is number {
        if (!Type.isInteger(v)) {
            throw new TypeError(`[G]The \`${p}\` should be an integer.`);
        }
    }
    static isRealNumber(v: any, p: string): asserts v is number {
        if (!Type.isRealNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a real number(numbers excluding ±\`Infinity\` and \`NaN\`).`);
        }
    }
    static isExtendedRealNumber(v: any, p: string): asserts v is number {
        if (!Type.isExtendedRealNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a extended real number(numbers excluding \`NaN\` but including ±\`Infinity\`).`);
        }
    }
    static isPositiveNumber(v: any, p: string): asserts v is number {
        if (!Type.isPositiveNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a positive real number.`);
        }
    }
    static isNegativeNumber(v: any, p: string): asserts v is number {
        if (!Type.isNegativeNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a negative real number.`);
        }
    }
    static isNonNegativeNumber(v: any, p: string): asserts v is number {
        if (!Type.isNonNegativeNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a non-negative real number.`);
        }
    }
    static isNonPositiveNumber(v: any, p: string): asserts v is number {
        if (!Type.isNonPositiveNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a non-positive real number.`);
        }
    }
    static isNonZeroNumber(v: any, p: string): asserts v is number {
        if (!Type.isNonZeroNumber(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a non-zero real number.`);
        }
    }
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
    // #endregion

    // #region Concept
    static isAngle(v: any, p: string): asserts v is number {
        if (!Angle.is(v)) {
            throw new TypeError(`[G]The \`${p}\` should be an angle representing as a real number but got \`${v}\`.`);
        }
    }
    static isLength(v: any, p: string): asserts v is number {
        if (!Length.is(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a length representing as a non-negative real number but got \`${v}\`.`);
        }
    }
    static isNonZeroLength(v: any, p: string): asserts v is number {
        if (!Length.isNonZero(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a non-zero length representing as a positive real number but got \`${v}\`.`);
        }
    }
    static isCoordinates(v: any, p: string): asserts v is [number, number] {
        if (!Coordinates.is(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a coordinates like \`[real number, real number]\` but got ${v}$.`);
        }
    }
    static isSize(v: any, p: string): asserts v is [number, number] {
        if (!Size.is(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a size like \`[non-negative real number, non-negative real number]\` but got \`${v}\`.`);
        }
    }
    static isNonZeroSize(v: any, p: string): asserts v is [number, number] {
        if (!Size.isNonZero(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a non-zero size like \`[positive real number, positive real number]\` but got \`${v}\`.`);
        }
    }
    static isBox(v: any, p: string): asserts v is [number, number, number, number] {
        if (!Box.is(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a box like  \`[real number, real number, non-negative real number, non-negative real number]\` but got \`${v}\`.`);
        }
    }
    static isNonZeroBox(v: any, p: string): asserts v is [number, number, number, number] {
        if (!Box.isNoneZero(v)) {
            throw new TypeError(`[G]The \`${p}\` should be a non-zero box like  \`[real number, real number, positive real number, positive real number]\` but got \`${v}\`.`);
        }
    }
    // #endregion
}
export default Assert;

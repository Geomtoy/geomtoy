import type { StaticClass } from "./types";

interface Type extends StaticClass {}
class Type {
    constructor() {
        throw new Error("[G]`Type` can not used as a constructor.");
    }
    // #region Native
    static isString(v: any): v is string {
        return typeof v === "string";
    }
    static isBoolean(v: any): v is boolean {
        return typeof v === "boolean";
    }
    static isNumber(v: any): v is number {
        return typeof v === "number";
    }
    static isArray(v: any): v is any[] {
        return Array.isArray(v);
    }
    static isPlainObject(v: any): v is { [key: string]: any } { 
        if (Object.prototype.toString.call(v) !== "[object Object]") return false;
        const proto = Object.getPrototypeOf(v);
        return proto === Object.prototype || proto === null;
    }
    static isFunction(v: any): v is (...args: any[]) => any {
        return typeof v === "function";
    }
    // #endregion

    // #region Number
    static isInteger(v: any) {
        return Number.isInteger(v);
    }
    static isNaN(v: any) {
        return Number.isNaN(v);
    }
    static isInfinity(v: any) {
        return v === Infinity || v === -Infinity;
    }
    static isRealNumber(v: any) {
        return Number.isFinite(v);
    }
    static isExtendedRealNumber(v: any) {
        return Type.isNumber(v) && !Type.isNaN(v);
    }
    static isPositiveNumber(v: any) {
        return Type.isRealNumber(v) && v > 0;
    }
    static isNegativeNumber(v: any) {
        return Type.isRealNumber(v) && v < 0;
    }
    static isNonNegativeNumber(v: any) {
        return Type.isRealNumber(v) && !(v < 0);
    }
    static isNonPositiveNumber(v: any) {
        return Type.isRealNumber(v) && !(v > 0);
    }
    static isNonZeroNumber(v: any) {
        return Type.isRealNumber(v) && v !== 0;
    }
    // #endregion
}

export default Type;

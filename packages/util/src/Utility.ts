import Math from "./Math";
import Type from "./Type";

import type { StaticClass } from "./types";

interface Utility extends StaticClass {}
class Utility {
    constructor() {
        throw new Error("[G]`Utility` can not used as a constructor.");
    }
    static isEqualTo(value: any, otherValue: any) {
        if (value === otherValue) return true;

        if (Type.isString(value) || Type.isBoolean(value) || Type.isNumber(value)) {
            if (value !== otherValue) return false;
        }
        if (Type.isPlainObject(value) || Type.isArray(value)) {
            if (!Utility.compareDeep(value, otherValue)) return false;
        }
        return true;
    }
    static compareDeep(object1: { [key: string]: any }, object2: { [key: string]: any }) {
        function compareDeepInner(object1: any, object2: any): boolean {
            if (Type.isPlainObject(object1) !== Type.isPlainObject(object2)) return false;
            if (Type.isArray(object1) !== Type.isArray(object2)) return false;

            if (Type.isPlainObject(object1) || Type.isArray(object1)) {
                if (Object.keys(object1).length !== Object.keys(object2).length) return false;
                return Object.keys(object1).every(key => compareDeepInner(object1[key], object2[key]));
            } else {
                return object1 === object2;
            }
        }
        return compareDeepInner(object1, object2);
    }
    static assignDeep(target: { [key: string]: any }, source: any) {
        function assignDeepInner(target: { [key: string]: any }, source: any) {
            Object.keys(target).forEach((key: keyof typeof target) => {
                if (Type.isPlainObject(target[key])) {
                    if (Type.isPlainObject(source[key])) {
                        assignDeepInner(target[key], source[key]);
                    }
                } else if (Type.isArray(target[key])) {
                    if (Type.isArray(source[key])) {
                        assignDeepInner(target[key], source[key]);
                    }
                } else {
                    if (source[key] !== undefined) target[key] = source[key];
                }
            });
        }
        assignDeepInner(target, source);
    }
    static cloneDeep<T extends { [key: string]: any }>(target: T) {
        function cloneDeepInner<U extends { [key: string]: any }>(target: U) {
            let ret: U = null as unknown as U;
            if (Type.isPlainObject(target)) {
                ret = {} as U;
            } else if (Type.isArray(target)) {
                ret = [] as object as U;
            }
            Object.keys(target).forEach((key: keyof U) => {
                if (Type.isPlainObject(target[key])) {
                    ret[key] = cloneDeepInner(target[key]);
                } else if (Type.isArray(target[key])) {
                    ret[key] = cloneDeepInner(target[key]);
                } else {
                    ret[key] = target[key];
                }
            });
            return ret;
        }
        return cloneDeepInner(target);
    }
    static range(start: number, stop: number, step = 1) {
        [start, stop] = start > stop ? [stop, start] : [start, stop];
        return Array.from({ length: Math.ceil((stop - start) / step) }, (_, i) => start + i * step);
    }
    static head<T>(arr: ArrayLike<T>): T | undefined {
        let l = arr.length;
        if (!l) return undefined;
        return arr[0];
    }
    static tail<T>(arr: ArrayLike<T>): T[] {
        let l = arr.length;
        if (!l) return [];
        return Array.prototype.slice.call(arr, 1, l);
    }
    static initial<T>(arr: ArrayLike<T>): T[] {
        let l = arr.length;
        if (!l) return [];
        return Array.prototype.slice.call(arr, 0, l - 1);
    }
    static last<T>(arr: ArrayLike<T>): T | undefined {
        let l = arr.length;
        if (!l) return undefined;
        return arr[l - 1];
    }
    static nth<T>(arr: ArrayLike<T>, n: number): T | undefined {
        let l = arr.length;
        if (!l) return undefined;
        n += n < 0 ? l : 0;
        return n < 0 || n >= l ? undefined : arr[n];
    }

    static sort<T>(arr: T[], order?: "asc" | "desc"): T[];
    static sort<T>(arr: T[], iters: ((elem: any) => any)[], orders?: ("asc" | "desc")[]): T[];
    static sort<T>(arr: T[], a1?: any, a2?: any) {
        let iters: ((elem: any) => any)[];
        let orders: ("asc" | "desc")[];

        if (!Type.isArray(a1)) {
            iters = [(elem: any) => elem];
            orders = [a1];
        } else {
            iters = a1;
            orders = a2 || [];
        }
        const iterLength = iters.length;
        return arr.sort((a, b) => {
            for (let i = 0; i < iterLength; i++) {
                const order = orders[i] || "asc";
                const ia = iters[i](a);
                const ib = iters[i](b);
                if (ia === ib) continue;
                if (ia < ib) return order === "asc" ? -1 : 1;
                if (ia > ib) return order === "desc" ? -1 : 1;
            }
            return 0;
        });
    }
    static lowerFirstChar(s: string) {
        return s.charAt(0).toLowerCase() + s.slice(1);
    }
    static upperFirstChar(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
    static now() {
        return Date.now();
    }
    static uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
export default Utility;

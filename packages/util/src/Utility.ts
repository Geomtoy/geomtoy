import Maths from "./Maths";
import Type from "./Type";

import type { StaticClass } from "./types";

interface Utility extends StaticClass {}
class Utility {
    constructor() {
        throw new Error("[G]`Utility` can not used as a constructor.");
    }
    static isEqualTo(value: any, otherValue: any) {
        if (Object.is(value, otherValue)) return true;
        if (Type.isPlainObject(value) || Type.isArray(value)) return Utility.compareDeep(value, otherValue);
        return false;
    }
    static compareDeep(object1: { [key: string]: any }, object2: { [key: string]: any }) {
        function compareDeepInner(object1: any, object2: any): boolean {
            if (Type.isPlainObject(object1) !== Type.isPlainObject(object2)) return false;
            if (Type.isArray(object1) !== Type.isArray(object2)) return false;

            if (Type.isPlainObject(object1) || Type.isArray(object1)) {
                if (Object.keys(object1).length !== Object.keys(object2).length) return false;
                return Object.keys(object1).every(key => compareDeepInner(object1[key], object2[key]));
            } else {
                return Object.is(object1, object2);
            }
        }
        return compareDeepInner(object1, object2);
    }
    static assignDeep(target: { [key: string]: any }, source: any) {
        function assignDeepInner(target: { [key: string]: any }, source: any) {
            Object.keys(target)
                .concat(Object.keys(source))
                .forEach(key => {
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
    // #region Array
    static range(start: number, stop: number, step = 1) {
        [start, stop] = start > stop ? [stop, start] : [start, stop];
        return Array.from({ length: Maths.ceil((stop - start) / step) }, (_, i) => start + i * step);
    }
    static head<T>(arr: ArrayLike<T>): T | undefined {
        const l = arr.length;
        if (!l) return undefined;
        return arr[0];
    }
    static tail<T>(arr: ArrayLike<T>): T[] {
        const l = arr.length;
        if (!l) return [];
        return Array.prototype.slice.call(arr, 1, l);
    }
    static initial<T>(arr: ArrayLike<T>): T[] {
        const l = arr.length;
        if (!l) return [];
        return Array.prototype.slice.call(arr, 0, l - 1);
    }
    static last<T>(arr: ArrayLike<T>): T | undefined {
        const l = arr.length;
        if (!l) return undefined;
        return arr[l - 1];
    }
    static nth<T>(arr: ArrayLike<T>, n: number): T | undefined {
        const l = arr.length;
        if (!l) return undefined;
        n += n < 0 ? l : 0;
        return n < 0 || n >= l ? undefined : arr[n];
    }

    /**
     * Sort the array `arr` with a `comparator` in ASC order. This method returns the same array passed in.
     * @note This method mutates `arr`.
     * @param arr
     * @param comparator
     */
    static sortWith<T>(arr: T[], comparator: (a: T, b: T) => number) {
        return arr.sort(comparator);
    }
    /**
     * Sort the array `arr` by mapped values with `mappers` in ASC order. This method returns the same array passed in.
     * @note This method mutates `arr`.
     * @param arr
     * @param mappers
     */
    static sortBy<T>(arr: T[], mappers: ((elem: T) => any)[]) {
        const mapperLength = mappers.length;

        return arr.sort((a, b) => {
            for (let i = 0; i < mapperLength; i++) {
                const ma = mappers[i](a);
                const mb = mappers[i](b);
                if (ma === mb) continue;
                if (ma < mb) return -1;
                if (ma > mb) return 1;
            }
            return 0;
        });
    }
    /**
     * Returns a new array with unique values. Deduplication by comparing the values with `comparator`.
     * @param arr
     * @param comparator
     * @returns
     */
    static uniqWith<T>(arr: T[], comparator: (a: T, b: T) => boolean) {
        const uniques: T[] = [];
        arr.forEach(elem => {
            if (uniques.findIndex(u => comparator(elem, u)) === -1) {
                uniques.push(elem);
            }
        });
        return uniques;
    }
    /**
     * Returns a new array with unique values. Deduplication by comparing the values returned by `mapper`.
     * @param arr
     * @param mapper
     */
    static uniqBy<T>(arr: T[], mapper: (elem: T) => any) {
        const uniques: T[] = [];
        const mappedUniques: any[] = [];
        arr.forEach(elem => {
            const mapped = mapper(elem);
            if (!mappedUniques.includes(mapped)) {
                uniques.push(elem);
                mappedUniques.push(mapped);
            }
        });
        return uniques;
    }

    // #endregion
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
            const r = (Maths.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
export default Utility;

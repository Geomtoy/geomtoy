import math from "./math"

interface ArrayLike<T> {
    length: number
    [n: number]: T
    [Symbol.iterator](): IterableIterator<any>
}

const util = {
    // #region ArrayLike operations
    // native
    forEach: (arr: ArrayLike<any>, cb: (value: any, index: number, array: ArrayLike<any>) => void, thisArg?: any): void => {
        Array.prototype.forEach.call(arr, cb, thisArg)
    },
    every: (arr: ArrayLike<any>, cb: (value: any, index: number, array: ArrayLike<any>) => any, thisArg?: any): boolean => {
        return Array.prototype.every.call(arr, cb, thisArg)
    },
    some: (arr: ArrayLike<any>, cb: (value: any, index: number, array: ArrayLike<any>) => any, thisArg?: any): boolean => {
        return Array.prototype.some.call(arr, cb, thisArg)
    },
    includes: (arr: ArrayLike<any>, s: any, i?: number): boolean => {
        return Array.prototype.includes.call(arr, s, i)
    },
    map: <M>(arr: ArrayLike<any>, cb: (value: any, index: number, array: ArrayLike<any>) => M, thisArg?: any): M[] => {
        return Array.prototype.map.call(arr, cb, thisArg)
    },
    filter: <T>(arr: ArrayLike<T>, cb: (value: T, index: number, array: ArrayLike<T>) => any, thisArg?: any): T[] => {
        return Array.prototype.filter.call(arr, cb, thisArg)
    },
    reduce: <R>(arr: ArrayLike<any>, cb: (accumulator: R, value: any, index: number, array: ArrayLike<any>) => R, initialValue?: R): R => {
        return Array.prototype.reduce.call(arr, cb, initialValue)
    },
    find: <T>(arr: ArrayLike<T>, cb: (value: T, index: number, array: ArrayLike<T>) => any, thisArg?: any): T | undefined => {
        return Array.prototype.find.call(arr, cb, thisArg)
    },
    findIndex: (arr: ArrayLike<any>, cb: (value: any, index: number, array: ArrayLike<any>) => any, thisArg?: any): number => {
        return Array.prototype.findIndex.call(arr, cb, thisArg)
    },
    indexOf: (arr: ArrayLike<any>, s: any, i?: number): number => {
        return Array.prototype.indexOf.call(arr, s, i)
    },
    sort: <T>(arr: ArrayLike<T>, cb: (a: T, b: T) => number): T[] => {
        return Array.prototype.sort.call([...arr], cb)
    },

    // range generator
    range: (start: number, stop: number, step = 1): number[] => {
        //prettier-ignore
        [start, stop] = start > stop ? [stop, start] : [start, stop]
        return Array.from({ length: math.ceil((stop - start) / step) }, (_, i) => start + i * step)
    },
    // pickers
    head: <T>(arr: ArrayLike<T>): T | undefined => {
        let l = arr.length
        if (!l) return undefined
        return arr[0]
    },
    tail: <T>(arr: ArrayLike<T>): T[] => {
        let l = arr.length
        if (!l) return []
        return Array.prototype.slice.call(arr, 1, l)
    },
    initial: <T>(arr: ArrayLike<T>): T[] => {
        let l = arr.length
        if (!l) return []
        return Array.prototype.slice.call(arr, 0, l - 1)
    },
    last: <T>(arr: ArrayLike<T>): T | undefined => {
        let l = arr.length
        if (!l) return undefined
        return arr[l - 1]
    },
    nth: <T>(arr: ArrayLike<T>, n: number): T | undefined => {
        let l = arr.length
        if (!l) return undefined
        n += n < 0 ? l : 0
        return n < 0 || n >= l ? undefined : arr[n]
    },
    // #endregion
    // #region Type
    // native
    isString: (v: any) => {
        return Object.prototype.toString.call(v) === "[object String]"
    },
    isBoolean: (v: any) => {
        return Object.prototype.toString.call(v) === "[object Boolean]"
    },
    isNumber: (v: any) => {
        return Object.prototype.toString.call(v) === "[object Number]"
    },
    isInteger: Number.isInteger,
    isNaN: Number.isNaN,
    isFinite: Number.isFinite,
    isArray: Array.isArray,
    isPlainObject: (v: any) => {
        if (Object.prototype.toString.call(v) !== "[object Object]") return false
        let proto = Object.getPrototypeOf(v)
        return proto === Object.getPrototypeOf({}) || proto === null
    },
    isFunction: (v: any) => {
        let t = Object.prototype.toString.call(v)
        return t == "[object Function]" || t == "[object AsyncFunction]" || t == "[object GeneratorFunction]"
    },
    // concrete
    isRealNumber: (v: any) => {
        return util.isNumber(v) && !util.isNaN(v) && util.isFinite(v)
    },
    isCoordinate: (v: any) => {
        return util.isArray(v) && v.length === 2 && util.every(v, util.isRealNumber)
    },
    isSize: (v: any) => {
        return util.isArray(v) && v.length === 2 && util.every(v, v => util.isRealNumber(v) && v > 0)
    },
    // #endregion
    // #region  Other
    uuid: (/* uuid v4 */) => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }
    // #endregion
}

export default util

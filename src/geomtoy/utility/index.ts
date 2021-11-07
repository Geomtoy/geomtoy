import math from "./math"

const util = {
    compareDeep: function (object1: { [key: string]: any }, object2: { [key: string]: any }) {
        function compareDeepInner(object1: any, object2: any): boolean {
            if (util.isPlainObject(object1) !== util.isPlainObject(object2)) return false
            if (util.isArray(object1) !== util.isArray(object2)) return false

            if (util.isPlainObject(object1) || util.isArray(object1)) {
                if (Object.keys(object1).length !== Object.keys(object2).length) return false
                return Object.keys(object1).every(key => compareDeepInner(object1[key], object2[key]))
            } else {
                return object1 === object2
            }
        }
        return compareDeepInner(object1, object2)
    },
    assignDeep: function (target: { [key: string]: any }, source: any) {
        function assignDeepInner(target: { [key: string]: any }, source: any) {
            Object.keys(target).forEach((key: keyof typeof target) => {
                if (util.isPlainObject(target[key])) {
                    if (util.isPlainObject(source[key])) {
                        assignDeepInner(target[key], source[key])
                    }
                } else if (util.isArray(target[key])) {
                    if (util.isArray(source[key])) {
                        assignDeepInner(target[key], source[key])
                    }
                } else {
                    // same type check
                    if (Object.prototype.toString.call(target[key]) === Object.prototype.toString.call(source[key])) {
                        target[key] = source[key]
                    }
                }
            })
        }
        assignDeepInner(target, source)
    },
    cloneDeep: function <T extends { [key: string]: any }>(target: T) {
        function cloneDeepInner<U extends { [key: string]: any }>(target: U) {
            let ret: U = null as unknown as U
            if (util.isPlainObject(target)) {
                ret = {} as U
            } else if (util.isArray(target)) {
                ret = [] as object as U
            }
            Object.keys(target).forEach((key: keyof U) => {
                if (util.isPlainObject(target[key])) {
                    ret[key] = cloneDeepInner(target[key])
                } else if (util.isArray(target[key])) {
                    ret[key] = cloneDeepInner(target[key])
                } else {
                    ret[key] = target[key]
                }
            })
            return ret
        }
        return cloneDeepInner(target)
    },
    range: (start: number, stop: number, step = 1): number[] => {
        //prettier-ignore
        [start, stop] = start > stop ? [stop, start] : [start, stop]
        return Array.from({ length: math.ceil((stop - start) / step) }, (_, i) => start + i * step)
    },
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
    // native
    isString: (v: any): v is string => {
        return Object.prototype.toString.call(v) === "[object String]"
    },
    isBoolean: (v: any): v is boolean => {
        return Object.prototype.toString.call(v) === "[object Boolean]"
    },
    isNumber: (v: any): v is number => {
        return Object.prototype.toString.call(v) === "[object Number]"
    },
    isInteger: Number.isInteger,
    isNaN: Number.isNaN,
    isFinite: Number.isFinite,
    isArray: Array.isArray,
    isPlainObject: (v: any): v is { [key: string]: any } => {
        if (Object.prototype.toString.call(v) !== "[object Object]") return false
        const proto = Object.getPrototypeOf(v)
        return proto === Object.getPrototypeOf({}) || proto === null
    },
    isFunction: (v: any): v is (...args: any[]) => any => {
        const t = Object.prototype.toString.call(v)
        return t == "[object Function]" || t == "[object AsyncFunction]" || t == "[object GeneratorFunction]"
    },
    // concrete
    isNumberNotNaN: (v: any): v is number => {
        return util.isNumber(v) && !util.isNaN(v)
    },
    isRealNumber: (v: any): v is number => {
        return util.isNumber(v) && !util.isNaN(v) && util.isFinite(v)
    },
    isPositiveNumber: (v: any): v is number => {
        return util.isRealNumber(v) && v > 0
    },
    isNegativeNumber: (v: any): v is number => {
        return util.isRealNumber(v) && v < 0
    },
    isNonZeroNumber: (v: any): v is number => {
        return util.isRealNumber(v) && v !== 0
    },
    isCoordinate: (v: any): v is [number, number] => {
        return util.isArray(v) && v.length === 2 && v.every(util.isRealNumber)
    },
    isSize: (v: any): v is number => {
        return util.isArray(v) && v.length === 2 && v.every(util.isPositiveNumber)
    },
    uuid: () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (math.random() * 16) | 0
            const v = c == "x" ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }
}

export default util

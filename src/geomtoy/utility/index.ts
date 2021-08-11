import _ from "lodash"
import math from "./math"

const util = {
    // Iterator
    every: _.every,
    map: _.map,
    filter: _.filter,
    nth: _.nth,
    forEach: _.forEach,
    reduce: _.reduce,
    transform: _.transform,
    // Array
    head: _.head,
    tail: _.tail,
    initial: _.initial,
    last: _.last,
    includes:_.includes,
    range: _.range,
    uniqWith: _.uniqWith,
    // Type
    isInteger: _.isInteger,
    isNumber: _.isNumber,
    isBoolean: _.isBoolean,
    isNaN: _.isNaN,
    isFinite: _.isFinite,
    isArray: Array.isArray,
    isFunction: _.isFunction,
    isRealNumber: (value: any): value is number => {
        return util.isNumber(value) && !util.isNaN(value) && util.isFinite(value)
    },
    isCoordinate: (value: any): value is [number, number] => {
        return util.isArray(value) && value.length === 2 && util.every(value, util.isRealNumber)
    },
    isSize: (value: any): value is [number, number] => {
        return util.isArray(value) && value.length === 2 && util.every(value, v => util.isRealNumber(v) && v > 0)
    },
    // Object
    defaults: _.defaults,
    defaultsDeep: _.defaultsDeep,
    clone: _.clone,
    cloneDeep: _.cloneDeep,
    assign: _.assign,
    assignDeep: _.merge,
    // Other
    uuid: () => {
        //uuid v4
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }
}

export default util

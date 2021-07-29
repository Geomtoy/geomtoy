import type from "../utility/type"
import math from "../utility/math"
import Point from "../Point"
import Line from "../Line"
import Ellipse from "../Ellipse"

export function sealed(constructor: new (...args: any[]) => any) {
    // Seal the `constructor` to prevent modify(including add) static members
    // Seal the `constructor.prototype` to prevent modify(including add) methods to `instance.__proto__`
    // And we can seal the `instance` by calling `Object.seal` in the `constructor` before return
    Object.seal(constructor)
    Object.seal(constructor.prototype)
}

export function is(t: "realNumber" | "integer" | "positiveNumber" | "nonZeroNumber" | "negativeNumber" | "size" | "boolean" | "point" | "line" | "ellipse") {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let set = descriptor.set!

        descriptor.set = function (value: any) {
            if (t === "realNumber" && type.isRealNumber(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a real number(number excluding \`Infinity\` and \`NaN\`).`)
            }
            if (t === "integer" && type.isInteger(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be an integer.`)
            }
            if (t === "positiveNumber" && type.isRealNumber(value) && math.strictSign(value, target.options.epsilon) === 1) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a positive number.`)
            }
            if (t === "negativeNumber" && type.isRealNumber(value) && math.strictSign(value, target.options.epsilon) === -1) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a negative number.`)
            }
            if (t === "nonZeroNumber" && type.isRealNumber(value) && math.strictSign(value, target.options.epsilon) !== 0) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a nonzero number.`)
            }
            if (t === "size" && type.isSize(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a size.`)
            }
            if (t === "boolean" && type.isRealNumber(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a boolean.`)
            }
            if (t === "point" && value instanceof Point) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a point.`)
            }
            if (t === "line" && value instanceof Line) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a line.`)
            }
            if (t === "ellipse" && value instanceof Ellipse) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a ellipse.`)
            }

            set.call(this, value)
        }
    }
}

export function compared(t: "gt" | "lt" | "eq" | "ge" | "le" | "ne", n: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let set = descriptor.set!
        descriptor.set = function (value: any) {
            if (t === "gt" && !math.greaterThan(value, n, target.options.epsilon)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be greater than ${n}.`)
            }
            if (t === "lt" && !math.lessThan(value, n, target.options.epsilon)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be less than ${n}.`)
            }
            if (t === "eq" && !math.equalTo(value, n, target.options.epsilon)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be equal to ${n}.`)
            }
            if (t === "ge" && math.lessThan(value, n, target.options.epsilon)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be greater than or equal to ${n}.`)
            }
            if (t === "le" && math.greaterThan(value, n, target.options.epsilon)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be less than or equal to ${n}.`)
            }
            if (t === "ne" && math.equalTo(value, n, target.options.epsilon)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should not be equal to ${n}.`)
            }
            set.call(this, value)
        }
    }
}

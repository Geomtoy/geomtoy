import util from "../utility"
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

export function is(type: "realNumber" | "positiveNumber" | "negativeNumber" | "size" | "boolean" | "point" | "line" | "ellipse") {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let set = descriptor.set!

        descriptor.set = function (value: any) {
            if (type === "realNumber" && util.type.isRealNumber(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a real number(number excluding 'Infinity' and 'NaN').`)
            }
            if (type === "positiveNumber" && util.type.isRealNumber(value) && value > 0) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a positive number.`)
            }
            if (type === "negativeNumber" && util.type.isRealNumber(value) && value < 0) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a negative number.`)
            }
            if (type === "size" && util.type.isSize(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a size.`)
            }
            if (type === "boolean" && util.type.isRealNumber(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a boolean.`)
            }
            if (type === "point" && value instanceof Point) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a point.`)
            }
            if (type === "line" && value instanceof Line) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a line.`)
            }
            if (type === "ellipse" && value instanceof Ellipse) {
                throw new Error(`[G]The \`${propertyKey}\` of a ${target.name.toLowerCase()} should be a ellipse.`)
            }

            set.call(this, value)
        }
    }
}

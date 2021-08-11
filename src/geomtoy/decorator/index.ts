import util from "../utility"
import Point from "../Point"
import Line from "../Line"
import Ellipse from "../Ellipse"
import GeomObject from "../base/GeomObject"
import Geomtoy from ".."

function withIndefiniteArticle(name: String) {
    let vowels = ["A", "E", "I", "O", "U"]
    if (util.includes(vowels, util.head(name)!.toUpperCase())) return `an ${name}`
    return `a name`
}

export function sealed(constructor: new (...args: any[]) => any) {
    // Seal the `constructor` to prevent modify(including add) static members.
    // Seal the `constructor.prototype` to prevent modify(including add) methods to `instance.__proto__`.
    // And we can seal the `instance` by calling `Object.seal` in the `constructor` before it returns.
    Object.seal(constructor)
    Object.seal(constructor.prototype)
}

export function validateOwner(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value!
    // Static method
    if (target.prototype) {
        let name = target.name
        descriptor.value = function () {
            let staticOwner: Geomtoy = util.head(arguments)
            util.forEach(util.tail(arguments), a => {
                if (a instanceof GeomObject && a.owner !== staticOwner) {
                    throw new Error(`[G]The static method \`${propertyKey}\` of \`${name}\` only accepts arguments of \`GeomObject\` type with the same owner.`)
                }
            })
            return method.apply(this, arguments)
        }
    }
    // Instance method
    else {
        let name = target.constructor.name
        descriptor.value = function () {
            util.forEach(arguments, a => {
                if (a instanceof GeomObject && a.owner !== target.owner) {
                    throw new Error(`[G]The method \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` only accepts arguments of \`GeomObject\` type with the same owner.`)
                }
            })
            return method.apply(this, arguments)
        }
    }
}
export function sameOwner(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let set = descriptor.set!,
        name = target.constructor.name
    descriptor.set = function (value: any) {
        if (util.isArray(value)) {
            if (!util.every(value, v => v.owner === target.owner)) {
                throw new Error(`[G]Every \`GeomObject\` in ${propertyKey} of \`${withIndefiniteArticle(name)}\` and the \`${name}\` itself should belong to the same owner.`)
            }
        } else {
            if (value.owner !== target.owner) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` and the \`${name}\` itself should belong to the same owner.`)
            }
        }
        set.call(this, value)
    }
}

export function is(
    t:
        | "realNumber"
        | "integer"
        | "positiveNumber"
        | "nonZeroNumber"
        | "negativeNumber"
        | "coordinate"
        | "coordinateArray"
        | "size"
        | "boolean"
        | "point"
        | "pointArray"
        | "line"
        | "ellipse"
) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let set = descriptor.set!,
            name = target.constructor.name
        descriptor.set = function (value: any) {
            if (t === "realNumber" && !util.isRealNumber(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be a real number(number excluding \`Infinity\` and \`NaN\`).`)
            }
            if (t === "integer" && !util.isInteger(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be an integer.`)
            }
            if (t === "positiveNumber" && !util.isRealNumber(value) && !(value > 0)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be a positive number.`)
            }
            if (t === "negativeNumber" && !util.isRealNumber(value) && !(value < 0)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be a negative number.`)
            }
            if (t === "nonZeroNumber" && !util.isRealNumber(value) && !(value === 0)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be a nonzero number.`)
            }
            if (t === "coordinate" && !util.isCoordinate(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be a coordinate.`)
            }
            if (t === "coordinateArray" && !util.isArray(value) && !util.every(value, c => util.isCoordinate(c))) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be an array of coordinate.`)
            }
            if (t === "size" && !util.isSize(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be a size.`)
            }
            if (t === "boolean" && !util.isBoolean(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be a boolean.`)
            }
            if (t === "point" && !(value instanceof Point)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be a \`Point\`.`)
            }
            if (t === "pointArray" && !util.isArray(value) && !util.every(value, p => p instanceof Point)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be an array of \`Point\`.`)
            }
            if (t === "line" && !(value instanceof Line)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be a \`Line\`.`)
            }
            if (t === "ellipse" && !(value instanceof Ellipse)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be an \`Ellipse\`.`)
            }

            set.call(this, value)
        }
    }
}

export function compared(t: "gt" | "lt" | "eq" | "ge" | "le" | "ne", n: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let set = descriptor.set!,
            name = target.constructor.name
        descriptor.set = function (value: any) {
            if (t === "gt" && !(value > n)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be greater than ${n}.`)
            }
            if (t === "lt" && !(value < n)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be less than ${n}.`)
            }
            if (t === "eq" && !(value === n)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be equal to ${n}.`)
            }
            if (t === "ge" && !(value >= n)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be greater than or equal to ${n}.`)
            }
            if (t === "le" && !(value <= n)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should be less than or equal to ${n}.`)
            }
            if (t === "ne" && !(value !== n)) {
                throw new Error(`[G]The \`${propertyKey}\` of \`${withIndefiniteArticle(name)}\` should not be equal to ${n}.`)
            }
            set.call(this, value)
        }
    }
}

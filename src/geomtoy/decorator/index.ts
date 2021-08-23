import util from "../utility"
import Point from "../Point"
import Line from "../Line"
import Ellipse from "../Ellipse"
import GeomObject from "../base/GeomObject"
import Geomtoy from ".."

function article(name: string, adj?: string) {
    let vowels = ["A", "E", "I", "O", "U"],
        // prettier-ignore
        a = adj !== undefined
        ? util.includes(vowels, util.head(adj)!.toUpperCase()) ? `an ${adj}` : `a ${adj}`
        : util.includes(vowels, util.head(name)!.toUpperCase()) ? "an" : "a"

    return `${a} \`${name}\``
}
function validText(constructor: any) {
    return (
        "\nPlease check whether the essential properties of it have been well assigned, " +
        "and meet the forming conditions. " +
        `${constructor?.formingCondition ? `\nThe forming conditions of ${article(constructor.name)} are: ${constructor.formingCondition!}` : ""}` +
        "\nWhen a `GeomObject` is invalid, only the essential properties and the following methods can be available: " +
        "`isValid`, `toString`, `toArray`, `toObject`."
    )
}
// prettier-ignore
const sameOwnerText = 
    "\nOnly `GeomObject`s owned by the same `Geomtoy` can interop with each other. " +
    "\nIf you want to use a `GeomObject` from other `Geomtoy`s, adopt it first."

export function sealed(constructor: new (...args: any[]) => any) {
    // Seal the `constructor` to prevent modify(including add) static members.
    // Seal the `constructor.prototype` to prevent modify(including add) members to the `instance.__proto__`.
    // And we can seal the `instance` by calling `Object.seal` in the `constructor` before it returns.

    Object.seal(constructor)
    Object.seal(constructor.prototype)
}

export function validAndWithSameOwner(constructor: new (...args: any[]) => any) {
    // static methods on the `constructor`
    util.forEach(Object.getOwnPropertyNames(constructor), memberName => {
        let name = constructor.name,
            descriptor = Object.getOwnPropertyDescriptor(constructor, memberName)!

        if (util.isFunction(descriptor.value)) {
            let method = descriptor.value
            descriptor.value = function () {
                let staticOwner: Geomtoy = util.head(arguments) // The `owner` is always the first arg passed in.
                util.forEach(util.tail(arguments), arg => {
                    if (arg instanceof GeomObject) {
                        if (!arg.isValid()) {
                            throw new Error(
                                `[G]Calling <static>\`${memberName}\` of \`${name}\` with ${article(arg.constructor.name, "invalid")}:\
                                \n${arg}.\
                                \n${validText(arg.constructor)}`
                            )
                        }
                        if (arg.owner !== staticOwner) {
                            throw new Error(
                                `[G]Calling <static>\`${memberName}\` of \`${name}\` with ${article(arg.constructor.name)} from different owner:\
                                \n${arg}.\
                                \n${sameOwnerText}`
                            )
                        }
                    }
                })
                return method.apply(this, arguments)
            }
            Object.defineProperty(constructor, memberName, descriptor)
        }
    })
    /*
    We have no direct properties on the `instance` itself.
    */
    // `instance` properties/accessors/methods on the `constructor.prototype`(`instance.__proto__`)
    util.forEach(Object.getOwnPropertyNames(constructor.prototype), memberName => {
        let name = constructor.name,
            descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, memberName)!

        // properties or methods
        if (descriptor.value !== undefined && memberName !== "constructor" /* excluding `constructor` */) {
            if (util.isFunction(descriptor.value) && !util.includes(["isValid", "toString", "toArray", "toObject"], memberName) /* excluding callable method when invalid*/) {
                let method = descriptor.value
                descriptor.value = function () {
                    if (!this.isValid()) {
                        throw new Error(
                            `[G]Calling \`${memberName}\` of ${article(name, "invalid")}:\
                            \n${this}.\
                            \n${validText(constructor)}`
                        )
                    }
                    util.forEach(arguments, arg => {
                        if (arg instanceof GeomObject) {
                            if (!arg.isValid()) {
                                throw new Error(
                                    `[G]Calling \`${memberName}\` of ${article(name)}:\
                                    \n${this}\
                                    \nwith ${article(arg.constructor.name, "invalid")}:\
                                    \n${arg}.\
                                    \n${validText(arg.constructor)}`
                                )
                            }
                            if (arg.owner !== this.owner) {
                                throw new Error(
                                    `[G]Calling \`${memberName}\` of ${article(name)}:\
                                    \n${this}\
                                    \nwith ${article(arg.name)} from a different owner:\
                                    \n${arg}.\
                                    \n${sameOwnerText}`
                                )
                            }
                        }
                    })
                    return method.apply(this, arguments)
                }
                Object.defineProperty(constructor.prototype, memberName, descriptor)
            }
            // else {
            //     do nothing, we have no direct properties on the `instance.__proto__` either
            // }
        }
        // accessors only have `getter`
        if (descriptor.get !== undefined && descriptor.set === undefined) {
            let getter = descriptor.get
            descriptor.get = function () {
                if (!this.isValid()) {
                    throw new Error(
                        `[G]Accessing <get>\`${memberName}\` of ${article(name, "invalid")}:\
                            \n${this}.\
                            \n${validText(constructor)}`
                    )
                }
                return getter.call(this)
            }
            Object.defineProperty(constructor.prototype, memberName, descriptor)
        }
        // accessors has `getter` and `setter`
        if (descriptor.get !== undefined && descriptor.set !== undefined) {
            let setter = descriptor.set
            descriptor.set = function (value: any) {
                if (util.isArray(value)) {
                    util.forEach(value, v => {
                        if (v instanceof GeomObject) {
                            if (!v.isValid()) {
                                throw new Error(
                                    `[G]Accessing <set>\`${memberName}\` of ${article(name)}:\
                                    \n${this}\
                                    \nwith ${article(v.name, "invalid")}:\
                                    \n${v} in the array.\
                                    \n${validText(v.constructor)}`
                                )
                            }
                            if (v.owner !== this.owner) {
                                throw new Error(
                                    `[G]Accessing <set>\`${memberName}\` of ${article(name)}:\
                                    \n${this}\
                                    \nwith ${article(v.name)} from a different owner:\
                                    \n${v} in the array.\
                                    \n${sameOwnerText}`
                                )
                            }
                        }
                    })
                }
                if (value instanceof GeomObject) {
                    if (!value.isValid()) {
                        throw new Error(
                            `[G]Accessing <set>\`${memberName}\` of ${article(this.name)}:\
                            \n${this}\
                            \nwith an invalid \`${value.name}\`:\
                            \n${value}.\
                            \n${validText(value.constructor)}`
                        )
                    }
                    if (value.owner !== this.owner) {
                        throw new Error(
                            `[G]Accessing <set>\`${memberName}\` of ${article(this.name)}:\
                            \n${this}\
                            \nwith ${article(value.name)} from a different owner:\
                            \n${value}.\
                            \n${sameOwnerText}`
                        )
                    }
                }
                setter.call(this, value)
            }
            Object.defineProperty(constructor.prototype, memberName, descriptor)
        }
    })
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
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be a real number(number excluding \`Infinity\` and \`NaN\`).`)
            }
            if (t === "integer" && !util.isInteger(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be an integer.`)
            }
            if (t === "positiveNumber" && !util.isRealNumber(value) && !(value > 0)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be a positive number.`)
            }
            if (t === "negativeNumber" && !util.isRealNumber(value) && !(value < 0)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be a negative number.`)
            }
            if (t === "nonZeroNumber" && !util.isRealNumber(value) && !(value === 0)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be a nonzero number.`)
            }
            if (t === "coordinate" && !util.isCoordinate(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be a coordinate.`)
            }
            if (t === "coordinateArray" && !util.isArray(value) && !util.every(value, c => util.isCoordinate(c))) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be an array of coordinate.`)
            }
            if (t === "size" && !util.isSize(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be a size.`)
            }
            if (t === "boolean" && !util.isBoolean(value)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be a boolean.`)
            }
            if (t === "point" && !(value instanceof Point)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be a \`Point\`.`)
            }
            if (t === "pointArray" && !util.isArray(value) && !util.every(value, p => p instanceof Point)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be an array of \`Point\`.`)
            }
            if (t === "line" && !(value instanceof Line)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be a \`Line\`.`)
            }
            if (t === "ellipse" && !(value instanceof Ellipse)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be an \`Ellipse\`.`)
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
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be greater than ${n}.`)
            }
            if (t === "lt" && !(value < n)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be less than ${n}.`)
            }
            if (t === "eq" && !(value === n)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be equal to ${n}.`)
            }
            if (t === "ge" && !(value >= n)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be greater than or equal to ${n}.`)
            }
            if (t === "le" && !(value <= n)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should be less than or equal to ${n}.`)
            }
            if (t === "ne" && !(value !== n)) {
                throw new Error(`[G]The \`${propertyKey}\` of ${article(name)} should not be equal to ${n}.`)
            }
            set.call(this, value)
        }
    }
}

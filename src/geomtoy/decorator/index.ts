import util from "../utility"
import BaseObject from "../base/BaseObject"
import Geomtoy from ".."
import { OwnerCarrier } from "../types"

function article(name: string, adj?: string) {
    let vowels = ["A", "E", "I", "O", "U"],
        // prettier-ignore
        a = adj !== undefined
        ? vowels.includes( util.head(adj)!.toUpperCase()) ? `an ${adj}` : `a ${adj}`
        : vowels.includes( util.head(name)!.toUpperCase()) ? "an" : "a"

    return `${a} \`${name}\``
}
function validText(constructor: any) {
    return (
        "\nPlease check whether the essential properties of it have been well assigned, " +
        "and meet the forming conditions. " +
        `${constructor?.formingCondition ? `\nThe forming conditions of ${article(constructor.name)} are: ${constructor.formingCondition!}` : ""}` +
        "\nWhen a `BaseObject` is invalid, only the essential properties and the following methods can be available: " +
        `\`${alwaysAvailableInstanceMethods.join("`, `")}\`.`
    )
}
// prettier-ignore
const sameOwnerText = 
    "\nOnly `BaseObject`s owned by the same `Geomtoy` can interop with each other. " +
    "\nIf you want to use a `BaseObject` from other `Geomtoy`s, adopt it first."

export function sealed(constructor: new (...args: any[]) => any) {
    // Seal the `constructor` to prevent modify(including add) static members.
    // Seal the `constructor.prototype` to prevent modify(including add) members to the `instance.__proto__`.
    // And we can seal the `instance` by calling `Object.seal` in the `constructor` before it returns.

    Object.seal(constructor)
    Object.seal(constructor.prototype)
}

const alwaysAvailableInstanceMethods = ["isValid", "toString", "toArray", "toObject", "copyFrom", "getGraphics"]

export function validAndWithSameOwner(constructor: new (...args: any[]) => any) {
    // static methods on the `constructor`
    Object.getOwnPropertyNames(constructor).forEach(memberName => {
        let name = constructor.name,
            descriptor = Object.getOwnPropertyDescriptor(constructor, memberName)!

        if (util.isFunction(descriptor.value)) {
            let method = descriptor.value
            descriptor.value = function (this: OwnerCarrier) {
                let staticOwner: Geomtoy = this.owner
                util.tail(arguments).forEach(arg => {
                    if (arg instanceof BaseObject) {
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
    Object.getOwnPropertyNames(constructor.prototype).forEach(memberName => {
        let name = constructor.name,
            descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, memberName)!

        // properties or methods
        if (descriptor.value !== undefined && memberName !== "constructor" /* excluding `constructor` */) {
            if (util.isFunction(descriptor.value) && !alwaysAvailableInstanceMethods.includes(memberName) /* excluding the always-available methods when invalid*/) {
                let method = descriptor.value
                descriptor.value = function () {
                    if (!this.isValid()) {
                        throw new Error(
                            `[G]Calling \`${memberName}\` of ${article(name, "invalid")}:\
                            \n${this}.\
                            \n${validText(constructor)}`
                        )
                    }
                    Array.from(arguments).forEach(arg => {
                        if (arg instanceof BaseObject) {
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
                    value.forEach(v => {
                        if (v instanceof BaseObject) {
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
                if (value instanceof BaseObject) {
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

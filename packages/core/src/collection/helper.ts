/**
 * This file is mainly for handling duplicate `Proxy` logic
 */

import { Utility } from "@geomtoy/util";
import EventTarget from "../base/EventTarget";
import EventSourceObject from "../event/EventSourceObject";

export function initArrayProxy<T>(this: EventTarget, items: T[]) {
    return new Proxy(items, {
        defineProperty: (target, prop, descriptor) => {
            if (Reflect.ownKeys(target).includes(prop)) {
                if (descriptor.get !== undefined || descriptor.set !== undefined) {
                    console.warn(`[G]You could not define the property \`${prop.toString()}\` of \`items\` as an accessor.`);
                    return true;
                }
                // setting `length` alone to less number will not trigger `deleteProperty`
                if (prop === "length") {
                    let i = items.length - 1;
                    const newI = Number(descriptor.value) - 1;
                    while (i > newI) {
                        this.trigger_(new EventSourceObject(this, (this.constructor as typeof EventTarget).events.itemRemoved, i));
                        i--;
                    }
                    return Reflect.defineProperty(target, prop, descriptor);
                }

                if (!Utility.isEqualTo(target[Number(prop)], descriptor.value)) this.trigger_(new EventSourceObject(this, (this.constructor as typeof EventTarget).events.itemChanged, Number(prop)));
                return Reflect.defineProperty(target, prop, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: descriptor.value
                });
            }
            this.trigger_(new EventSourceObject(this, (this.constructor as typeof EventTarget).events.itemAdded, Number(prop)));
            return Reflect.defineProperty(target, prop, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: descriptor.value
            });
        },
        deleteProperty: (target, prop) => {
            if (Reflect.ownKeys(target).includes(prop)) {
                this.trigger_(new EventSourceObject(this, (this.constructor as typeof EventTarget).events.itemRemoved, Number(prop)));
                return Reflect.deleteProperty(target, prop);
            }
            return true; // `prop` do not existed, `Reflect.deleteProperty` always return `true`
        },
        preventExtensions: target => {
            console.warn(`[G]You could not prevent extensions of \`items\`.`);
            return true;
        },
        setPrototypeOf: (target, prototype) => {
            console.warn(`[G]You could not set the prototype of \`items\`.`);
            return true;
        }
    });
}
export function initSealedArrayProxy<T extends any[]>(this: EventTarget, items: [...T]) {
    // basically Object.seal logical alike, but we do not force the `configurable` of properties to `true`, so we do not get `TypeError`.
    return new Proxy(items, {
        defineProperty: (target, prop, descriptor) => {
            if (Reflect.ownKeys(target).includes(prop)) {
                if (descriptor.get !== undefined || descriptor.set !== undefined) {
                    console.warn(`[G]You could not define the property \`${prop.toString()}\` of \`items\` as an accessor.`);
                    return true;
                }
                if (prop === "length") {
                    console.warn(`[G]You could not change the \`length\` of \`items\`.`);
                    return true;
                }
                if (!Utility.isEqualTo(target[Number(prop)], descriptor.value))
                    this.trigger_(new EventSourceObject(this, (this.constructor as typeof EventTarget).events.itemChanged, target[Number(prop)], Number(prop)));
                return Reflect.defineProperty(target, prop, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: descriptor.value
                });
            }
            console.warn(`[G]You could not add any new property to \`items\`.`);
            return true;
        },
        deleteProperty: (target, prop) => {
            if (Reflect.ownKeys(target).includes(prop)) {
                console.warn(`[G]You could not delete any property from \`items\`.`);
                return true;
            }
            return true; // `prop` do not existed, `Reflect.deleteProperty` always return `true`
        },
        setPrototypeOf: (target, prototype) => {
            console.warn(`[G]You could not set the prototype of \`items\`.`);
            return true;
        }
    });
}

export function initObjectProxy<T>(this: EventTarget, items: { [key: string]: T }) {
    return new Proxy(items, {
        defineProperty: (target, prop, descriptor) => {
            if (Reflect.ownKeys(target).includes(prop)) {
                if (descriptor.get !== undefined || descriptor.set !== undefined) {
                    console.warn(`[G]You could not define the property \`${prop.toString()}\` of \`items\` as an accessor.`);
                    return true;
                }
                if (!Utility.isEqualTo(target[String(prop)], descriptor.value)) this.trigger_(new EventSourceObject(this, (this.constructor as typeof EventTarget).events.itemChanged, String(prop)));
                return Reflect.defineProperty(target, prop, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: descriptor.value
                });
            }
            this.trigger_(new EventSourceObject(this, (this.constructor as typeof EventTarget).events.itemAdded, String(prop)));
            return Reflect.defineProperty(target, prop, {
                configurable: true,
                enumerable: true,
                writable: true,
                value: descriptor.value
            });
        },
        deleteProperty: (target, prop) => {
            if (Reflect.ownKeys(target).includes(prop)) {
                this.trigger_(new EventSourceObject(this, (this.constructor as typeof EventTarget).events.itemRemoved, String(prop)));
                return Reflect.deleteProperty(target, prop);
            }
            return true; // `prop` do not existed, `Reflect.deleteProperty` always return `true`
        },
        preventExtensions: target => {
            console.warn(`[G]You could not prevent extensions of \`items\`.`);
            return true;
        },
        setPrototypeOf: (target, prototype) => {
            console.warn(`[G]You could not set the prototype of \`items\`.`);
            return true;
        }
    });
}
export function initSealedObjectProxy<T extends { [key: string]: any }>(this: EventTarget, items: T) {
    // basically Object.seal logical alike, but we do not force the `configurable` of properties to `true`, so we do not get `TypeError`.
    return new Proxy(items, {
        defineProperty: (target, prop, descriptor) => {
            if (Reflect.ownKeys(target).includes(prop)) {
                if (descriptor.get !== undefined || descriptor.set !== undefined) {
                    console.warn(`[G]You could not define the property \`${prop.toString()}\` of \`items\` as an accessor.`);
                    return true;
                }
                if (!Utility.isEqualTo(target[String(prop)], descriptor.value))
                    this.trigger_(new EventSourceObject(this, (this.constructor as typeof EventTarget).events.itemChanged, target[String(prop)], String(prop)));
                return Reflect.defineProperty(target, prop, {
                    configurable: true,
                    enumerable: true,
                    writable: true,
                    value: descriptor.value
                });
            }
            console.warn(`[G]You could not add any new property to \`items\`.`);
            return true;
        },
        deleteProperty: (target, prop) => {
            if (Reflect.ownKeys(target).includes(prop)) {
                console.warn(`[G]You could not delete any property from \`items\`.`);
                return true;
            }
            return true; // `prop` do not existed, `Reflect.deleteProperty` always return `true`
        },
        setPrototypeOf: (target, prototype) => {
            console.warn(`[G]You could not set the prototype of \`items\`.`);
            return true;
        }
    });
}

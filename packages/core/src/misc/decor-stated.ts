import { cloneResult } from "./clone-result";

const STATE_SYMBOL = Symbol("decor-stated");
const STATE_KEY_SYMBOL = Symbol("decor-stated.stateKey");
export const DISABLE_STATE_SYMBOL = Symbol("decor-stated.disable");
export const STATE_IDENTIFIER_SYMBOL = Symbol("decor-stated.stateIdentifier");

/**
 * Used to cache the return value of a stateful method(The method can not have input parameters,
 * for different input parameters mean different results, we do not cache input parameters unless boolean type).
 * And the class it belongs to should be stateful(have continuous states).
 */
export function stated(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
    const method = descriptor.value!;
    descriptor.value = function (this: typeof target) {
        if (this[DISABLE_STATE_SYMBOL] === true) return method.call(this);

        if (this[STATE_SYMBOL] === undefined) this[STATE_SYMBOL] = { [STATE_KEY_SYMBOL]: undefined };
        if (this[STATE_IDENTIFIER_SYMBOL] !== this[STATE_SYMBOL][STATE_KEY_SYMBOL]) {
            // clean all cached result and set new state
            Object.keys(this[STATE_SYMBOL]).forEach(key => delete this[STATE_SYMBOL][key]);
            this[STATE_SYMBOL][STATE_KEY_SYMBOL] = this[STATE_IDENTIFIER_SYMBOL];
        }

        if (propertyKey in this[STATE_SYMBOL]) {
            if (this[STATE_SYMBOL][propertyKey] === this) return this;
            return cloneResult(this[STATE_SYMBOL][propertyKey]);
        }
        return (this[STATE_SYMBOL][propertyKey] = method.call(this));
    };
}

export function statedWithBoolean(...defaultValues: (boolean | undefined)[]) {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
        const method = descriptor.value!;
        descriptor.value = function (this: typeof target) {
            if (this[DISABLE_STATE_SYMBOL] === true) return method.call(this, ...arguments);

            if (this[STATE_SYMBOL] === undefined) this[STATE_SYMBOL] = { [STATE_KEY_SYMBOL]: undefined };
            if (this[STATE_IDENTIFIER_SYMBOL] !== this[STATE_SYMBOL][STATE_KEY_SYMBOL]) {
                // clean all cached result and set new state
                Object.keys(this[STATE_SYMBOL]).forEach(key => delete this[STATE_SYMBOL][key]);
                this[STATE_SYMBOL][STATE_KEY_SYMBOL] = this[STATE_IDENTIFIER_SYMBOL];
            }

            if (this[STATE_SYMBOL][propertyKey] === undefined) this[STATE_SYMBOL][propertyKey] = {};

            const valueKey = [...new Array(defaultValues.length).keys()]
                .reduce((acc, index) => {
                    acc.push(arguments[index] ?? defaultValues[index]);
                    return acc;
                }, [] as boolean[])
                .join("-");

            if (valueKey in this[STATE_SYMBOL][propertyKey]) {
                if (this[STATE_SYMBOL][propertyKey][valueKey] === this) return this;
                return cloneResult(this[STATE_SYMBOL][propertyKey][valueKey]);
            }
            return (this[STATE_SYMBOL][propertyKey][valueKey] = method.call(this, ...arguments));
        };
    };
}

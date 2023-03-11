export const CACHE_SYMBOL = Symbol("cache");
const STATE_SYMBOL = Symbol("state");
export const STATE_IDENTIFIER_SYMBOL = Symbol("stateId");
/**
 * Used to cache the return value of a stateless method(The method can not have input parameters,
 * for different input parameters mean different results, we do not cache input parameters).
 * And the class it belongs to should be stateless(or disposable).
 */
export function cached(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
    const method = descriptor.value!;
    descriptor.value = function (this: typeof target) {
        if (this[CACHE_SYMBOL] === undefined) this[CACHE_SYMBOL] = {};
        if (propertyKey in this[CACHE_SYMBOL]) {
            return this[CACHE_SYMBOL][propertyKey];
        }
        return (this[CACHE_SYMBOL][propertyKey] = method.call(this));
    };
}

export function cachedWithBoolean(...defaultValues: (boolean | undefined)[]) {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
        const method = descriptor.value!;
        descriptor.value = function (this: typeof target) {
            if (this[CACHE_SYMBOL] === undefined) this[CACHE_SYMBOL] = {};
            if (this[CACHE_SYMBOL][propertyKey] === undefined) this[CACHE_SYMBOL][propertyKey] = {};

            const valueKey = [...new Array(defaultValues.length).keys()]
                .reduce((acc, index) => {
                    acc.push(arguments[index] ?? defaultValues[index]);
                    return acc;
                }, [] as boolean[])
                .join("-");

            if (valueKey in this[CACHE_SYMBOL][propertyKey]) {
                return this[CACHE_SYMBOL][propertyKey][valueKey];
            }
            return (this[CACHE_SYMBOL][propertyKey][valueKey] = method.call(this, ...arguments));
        };
    };
}

/**
 * Used to cache the return value of a stateful method(The method can not have input parameters,
 * for different input parameters mean different results, we do not cache input parameters).
 * And the class it belongs to should be stateful(have continuous states).
 */
export function stated(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
    const method = descriptor.value!;
    descriptor.value = function (this: typeof target) {
        if (this[CACHE_SYMBOL] === undefined) {
            this[CACHE_SYMBOL] = {
                [STATE_SYMBOL]: undefined
            };
        }
        if (this[STATE_IDENTIFIER_SYMBOL] !== this[CACHE_SYMBOL][STATE_SYMBOL]) {
            // clean all cached result and set new state
            Object.keys(this[CACHE_SYMBOL]).forEach(key => delete this[CACHE_SYMBOL][key]);
            this[CACHE_SYMBOL][STATE_SYMBOL] = this[STATE_IDENTIFIER_SYMBOL];
        }

        if (propertyKey in this[CACHE_SYMBOL]) {
            return this[CACHE_SYMBOL][propertyKey];
        }
        return (this[CACHE_SYMBOL][propertyKey] = method.call(this));
    };
}

export function statedWithBoolean(...defaultValues: (boolean | undefined)[]) {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
        const method = descriptor.value!;
        descriptor.value = function (this: typeof target) {
            if (this[CACHE_SYMBOL] === undefined) {
                this[CACHE_SYMBOL] = {
                    [STATE_SYMBOL]: undefined
                };
            }
            if (this[STATE_IDENTIFIER_SYMBOL] !== this[CACHE_SYMBOL][STATE_SYMBOL]) {
                // clean all cached result and set new state
                Object.keys(this[CACHE_SYMBOL]).forEach(key => delete this[CACHE_SYMBOL][key]);
                this[CACHE_SYMBOL][STATE_SYMBOL] = this[STATE_IDENTIFIER_SYMBOL];
            }

            if (this[CACHE_SYMBOL][propertyKey] === undefined) this[CACHE_SYMBOL][propertyKey] = {};

            const valueKey = [...new Array(defaultValues.length).keys()]
                .reduce((acc, index) => {
                    acc.push(arguments[index] ?? defaultValues[index]);
                    return acc;
                }, [] as boolean[])
                .join("-");

            if (valueKey in this[CACHE_SYMBOL][propertyKey]) {
                return this[CACHE_SYMBOL][propertyKey][valueKey];
            }
            return (this[CACHE_SYMBOL][propertyKey][valueKey] = method.call(this, ...arguments));
        };
    };
}

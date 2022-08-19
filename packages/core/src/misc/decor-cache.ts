const CACHE_KEY = "_cache_";
const STATE_KEY = "_state_";

export const STATE_IDENTIFIER = "_stateId_";
/**
 * Used to cache the return value of a stateless method(The method can not have input parameters,
 * for different input parameters mean different results, we do not cache input parameters).
 * And the class it belongs to should be stateless(or disposable).
 */
export function cached(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
    const method = descriptor.value!;
    descriptor.value = function (this: typeof target) {
        if (this[CACHE_KEY] === undefined) this[CACHE_KEY] = {};
        if (propertyKey in this[CACHE_KEY]) {
            return this[CACHE_KEY][propertyKey];
        }
        return (this[CACHE_KEY][propertyKey] = method.call(this));
    };
}

export function cachedWithBoolean(...defaultValues: (boolean | undefined)[]) {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
        const method = descriptor.value!;
        descriptor.value = function (this: typeof target) {
            if (this[CACHE_KEY] === undefined) this[CACHE_KEY] = {};
            if (this[CACHE_KEY][propertyKey] === undefined) this[CACHE_KEY][propertyKey] = {};

            const valueKey = [...new Array(defaultValues.length).keys()]
                .reduce((acc, index) => {
                    acc.push(arguments[index] ?? defaultValues[index]);
                    return acc;
                }, [] as boolean[])
                .join("-");

            if (valueKey in this[CACHE_KEY][propertyKey]) {
                return this[CACHE_KEY][propertyKey][valueKey];
            }
            return (this[CACHE_KEY][propertyKey][valueKey] = method.call(this, arguments));
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
        if (this[CACHE_KEY] === undefined) {
            this[CACHE_KEY] = {
                [STATE_KEY]: undefined
            };
        }
        if (this[STATE_IDENTIFIER] !== this[CACHE_KEY][STATE_KEY]) {
            // clean all cached result and set new state
            Object.keys(this[CACHE_KEY]).forEach(key => delete this[CACHE_KEY][key]);
            this[CACHE_KEY][STATE_KEY] = this[STATE_IDENTIFIER];
        }

        if (propertyKey in this[CACHE_KEY]) {
            return this[CACHE_KEY][propertyKey];
        }
        return (this[CACHE_KEY][propertyKey] = method.call(this));
    };
}

export function statedWithBoolean(...defaultValues: (boolean | undefined)[]) {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
        const method = descriptor.value!;
        descriptor.value = function (this: typeof target) {
            if (this[CACHE_KEY] === undefined) {
                this[CACHE_KEY] = {
                    [STATE_KEY]: undefined
                };
            }
            if (this[STATE_IDENTIFIER] !== this[CACHE_KEY][STATE_KEY]) {
                // clean all cached result and set new state
                Object.keys(this[CACHE_KEY]).forEach(key => delete this[CACHE_KEY][key]);
                this[CACHE_KEY][STATE_KEY] = this[STATE_IDENTIFIER];
            }

            if (this[CACHE_KEY][propertyKey] === undefined) this[CACHE_KEY][propertyKey] = {};

            const valueKey = [...new Array(defaultValues.length).keys()]
                .reduce((acc, index) => {
                    acc.push(arguments[index] ?? defaultValues[index]);
                    return acc;
                }, [] as boolean[])
                .join("-");

            if (valueKey in this[CACHE_KEY][propertyKey]) {
                return this[CACHE_KEY][propertyKey][valueKey];
            }
            return (this[CACHE_KEY][propertyKey][valueKey] = method.call(this, arguments));
        };
    };
}

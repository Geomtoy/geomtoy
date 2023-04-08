export const CACHE_SYMBOL = Symbol("decor-cached");
export const DISABLE_CACHE_SYMBOL = Symbol("decor-cached.disable");

/**
 * Used to cache the return value of a stateless method(The method can not have input parameters,
 * for different input parameters mean different results, we do not cache input parameters).
 * And the class it belongs to should be stateless(or disposable).
 */
export function cached(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
    const method = descriptor.value!;
    descriptor.value = function (this: typeof target) {
        if (this[DISABLE_CACHE_SYMBOL] === true) return method.call(this);

        if (this[CACHE_SYMBOL] === undefined) this[CACHE_SYMBOL] = {};
        if (propertyKey in this[CACHE_SYMBOL]) return this[CACHE_SYMBOL][propertyKey];
        return (this[CACHE_SYMBOL][propertyKey] = method.call(this));
    };
}

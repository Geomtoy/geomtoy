export function sealed(constructor: new (...args: any[]) => any) {
    // Seal the `constructor` to prevent modify(including add) static members.
    // Seal the `constructor.prototype` to prevent modify(including add) members to the `instance.__proto__`.
    // And we can seal the `instance` by calling `Object.seal` in the `constructor` before it returns.
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

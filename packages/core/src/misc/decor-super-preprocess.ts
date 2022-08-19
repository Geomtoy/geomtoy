import { Type } from "@geomtoy/util";

export function superPreprocess(superMethodName: string) {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) {
        const method = descriptor.value!;

        descriptor.value = function (this: typeof target) {
            const superClass = Object.getPrototypeOf(Object.getPrototypeOf(this));
            const superMethod = superClass[superMethodName];
            if (superMethod && Type.isFunction(superMethod)) {
                const ret = superMethod.call(this, propertyKey);
                if (ret !== this) return ret;
            }
            return method.call(this);
        };
    };
}

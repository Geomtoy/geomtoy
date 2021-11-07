import util from "."

const factory = {
    addGetterSetter<T>(
        ctor: new (...args: any[]) => T,
        publicPropName: string,
        privateProp: string | { prop: string; get: (prop: any) => any; set: (prop: any, value: any) => void },
        assertions: ((value: any, name: string) => void | never)[],
        callback: (this: T, oldValue: any, newValue: any) => void
    ) {
        let getter: (this: T) => any
        if (util.isString(privateProp)) {
            getter = function (this: T) {
                return this[privateProp as keyof T]
            }
        } else {
            getter = function (this: T) {
                return privateProp.get(this[privateProp.prop as keyof T])
            }
        }

        let setter: (this: T, value: any) => void
        if (util.isString(privateProp)) {
            setter = function (value: any) {
                assertions.forEach(a => a(value, publicPropName))

                const oldValue = this[privateProp as keyof T]
                const newValue = value
                this[privateProp as keyof T] = value
                if (callback) callback.call(this, oldValue, newValue)
            }
        } else {
            setter = function (this: T, value: any) {
                assertions.forEach(a => a(value, publicPropName))

                const oldValue = privateProp.get(this[privateProp.prop as keyof T])
                const newValue = value
                privateProp.set(this[privateProp.prop as keyof T], value)
                if (callback) callback.call(this, oldValue, newValue)
            }
        }

        Object.defineProperty(ctor.prototype, publicPropName, {
            configurable: false,
            enumerable: true,
            get: getter,
            set: setter
        })
    }
}

export default factory

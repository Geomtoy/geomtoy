import { Utility } from "@geomtoy/util";

export default abstract class BaseObject {
    private _uuid = Utility.uuid();
    // user-defined data
    private _data: { [key: string]: any } = {};
    /**
     * Get the class constructor `name` of this.
     */
    get name() {
        return this.constructor.name;
    }
    /**
     * Get the `uuid` of this.
     */
    get uuid() {
        return this._uuid;
    }

    constructor() {
        let proto = Object.getPrototypeOf(this);
        const initializers: (() => void)[] = [];

        while (proto !== null) {
            if (proto.constructor._initializer !== undefined) initializers.unshift(proto.constructor._initializer);
            proto = Object.getPrototypeOf(proto);
        }
        for (const init of initializers) init.call(this);
    }

    private static _initializer?: () => void;
    static addInitializer<T extends BaseObject>(initializer: (this: T) => void) {
        this._initializer = initializer;
    }

    data(key: string, value: any): this;
    data(key: string): any;
    data(key: string, value?: any) {
        if (value === undefined) return this._data[key];
        this._data[key] = value;
        return this;
    }
    toString() {
        return `${this.name}(${this.uuid})`;
    }
}

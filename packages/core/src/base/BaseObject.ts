import { Utility } from "@geomtoy/util";

export default abstract class BaseObject {
    private _id = Utility.id(this.name);
    // user-defined data
    private _data: { [key: string]: any } = {};
    /**
     * Get the class constructor `name` of this.
     */
    get name() {
        return this.constructor.name;
    }
    /**
     * Get the `id` of this.
     */
    get id() {
        return this._id;
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

    toJSON() {
        return {
            name: this.name,
            id: this.id
        };
    }
    toString() {
        return JSON.stringify(this.toJSON(), null, 4);
    }
}

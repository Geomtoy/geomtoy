import { Utility } from "@geomtoy/util";

export default abstract class BaseObject {
    private _uuid = Utility.uuid();
    //user-defined data
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

    data(key: string, value: any): this;
    data(key: string): any;
    data(key: string, value?: any) {
        if (value === undefined) return this._data[key];
        this._data[key] = value;
        return this;
    }

    abstract toString(): string;
    abstract toArray(): any[];
    abstract toObject(): object;
}

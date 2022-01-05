import util from "../utility";

import { optionerOf } from "../helper/Optioner";

import Geomtoy from "../geomtoy";
import type { Options } from "../types";

export default abstract class BaseObject {
    private _owner = null as unknown as Geomtoy;
    private _uuid = util.uuid();
    protected options_: Options;
    //user-defined data
    private _data: { [key: string]: any } = {};

    constructor(owner: Geomtoy) {
        this.owner = owner;
        this.options_ = optionerOf(this.owner).options;
    }

    get owner() {
        return this._owner;
    }
    set owner(value: Geomtoy) {
        if (!(value instanceof Geomtoy)) throw new Error("[G]The `owner` of a `BaseObject` should be a `Geomtoy`.");
        this._owner = value;
    }
    get name() {
        return this.constructor.name;
    }
    get uuid() {
        return this._uuid;
    }

    prototypeNameChain() {
        let cs: string[] = [];
        let pt = this;
        do {
            if ((pt = Object.getPrototypeOf(pt))) cs.push(pt.constructor.name);
        } while (pt != null);
        return cs;
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

import { Utility } from "@geomtoy/util";
import BaseObject from "../base/BaseObject";
import EventTarget from "../base/EventTarget";
import EventObject from "../event/EventObject";
import type { DynamicObject } from "../types";

class DynamicEventTarget<T extends { [key: string]: any }> extends EventTarget {
    private _object: DynamicObject<T>;

    constructor(object: T) {
        super();
        this._object = { ...object };
        // "owner"
        // "name"
        // "uuid"
        // "data"
        const excludeKeysFromBaseObject = this._getPublicPropertyNames(BaseObject.prototype);
        // "muted"
        // "mute"
        // "unmute"
        // "on"
        // "off"
        // "clear"
        // "bind"
        // "unbind"
        const excludeKeysFromEventTarget = this._getPublicPropertyNames(EventTarget.prototype);
        // "events"
        // "toString"
        // "toArray"
        // "toObject"
        const excludeKeysFromThis = this._getPublicPropertyNames(Object.getPrototypeOf(this));

        const excludeKeys = [...excludeKeysFromBaseObject, ...excludeKeysFromEventTarget, ...excludeKeysFromThis];

        Object.getOwnPropertyNames(this._object).forEach(name => {
            if (name.startsWith("_") || name.endsWith("_")) {
                console.warn(`[G]The \`${name}\` key was found to start or end with \`_\` which is not allowed, so it will be ignored.`);
                delete this._object[name as keyof DynamicObject<T>];
                return;
            }
            if (excludeKeys.includes(name)) {
                console.warn(`[G]The \`${name}\` key was found to override the keys of \`EventTarget\` which is not allowed, so it will be ignore.`);
                delete this._object[name as keyof DynamicObject<T>];
                return;
            }

            Object.defineProperty(this, name, {
                get() {
                    return this._object[name];
                },
                set(value) {
                    if (!Utility.isEqualTo(this._object[name], value)) this.trigger_(EventObject.simple(this, this.events[`${name}Changed`]));
                    this._object[name] = value;
                }
            });
        });
        return Object.seal(this);
    }

    private _getPublicPropertyNames(object: object) {
        return Object.getOwnPropertyNames(object).filter(name => name !== "constructor" && !name.startsWith("_") && !name.endsWith("_"));
    }

    get events() {
        const events: { [key: string]: string } = {};
        Object.getOwnPropertyNames(this._object).forEach(name => {
            events[`${name}Changed`] = name;
        });
        return events as {
            [K in keyof DynamicObject<T> & string as `${K}Changed`]: K;
        };
    }
    toString() {
        // prettier-ignore
        return [
            `${this.name}(${this.uuid}){`,
            ...Object.getOwnPropertyNames(this._object).map(name=> `\t${name}: ${this._object[name as keyof DynamicObject<T>]}`),
            `}`
        ].join("\n");
    }
    toArray() {
        return Object.values(this._object) as DynamicObject<T>[keyof DynamicObject<T>][];
    }
    toObject() {
        return { ...this._object } as DynamicObject<T>;
    }
}

const Dynamic: new <T extends { [key: string]: any }>(object: T) => DynamicObject<T> & EventTarget = DynamicEventTarget as any;

export default Dynamic;

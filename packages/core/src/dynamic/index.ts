import { Utility } from "@geomtoy/util";
import BaseObject from "../base/BaseObject";
import EventTarget from "../base/EventTarget";
import EventSourceObject from "../event/EventSourceObject";
import type { DynamicEventTargetConstructor, DynamicObject, FilteredKeys } from "../types";

function getPublicPropertyNames(object: object) {
    return Object.getOwnPropertyNames(object).filter(name => name !== "constructor" && !name.startsWith("_") && !name.endsWith("_"));
}
// "name"
// "id"
// "data"
// "toString"
// "toArray"
// "toObject"
const excludeKeysFromBaseObject = getPublicPropertyNames(BaseObject.prototype);
// "muted"
// "mute"
// "unmute"
// "on"
// "off"
// "clear"
// "bind"
// "unbind"
const excludeKeysFromEventTarget = getPublicPropertyNames(EventTarget.prototype);
const excludeKeys = [...excludeKeysFromBaseObject, ...excludeKeysFromEventTarget];

export default class Dynamic extends BaseObject {
    static get excludeKeys() {
        return [...excludeKeysFromBaseObject, ...excludeKeysFromEventTarget];
    }

    create<T extends { [key: string]: any }>(object: T) {
        const templateObject = object;

        const filteredKeys: FilteredKeys<T>[] = [];
        Object.getOwnPropertyNames(object).forEach(name => {
            if (name.startsWith("_") || name.endsWith("_")) {
                console.warn(`[G]The \`${name}\` key was found to start or end with \`_\` which is not allowed, so it will be ignored.`);
                return;
            }
            if (excludeKeys.includes(name)) {
                console.warn(`[G]The \`${name}\` key was found to override the keys of \`EventTarget\` which is not allowed, so it will be ignore.`);
                return;
            }
            filteredKeys.push(name as FilteredKeys<T>);
        });

        const events: { [key: string]: string } = {};
        filteredKeys.forEach(key => {
            events[`${key as string}Changed`] = key as string;
        });

        const dynamicEventTarget = class DynamicEventTarget extends EventTarget {
            private _object: DynamicObject<T> = {} as DynamicObject<T>;

            constructor(object?: DynamicObject<T>) {
                super();
                Object.assign(this, { ...templateObject, ...object });
                return Object.seal(this);
            }

            static override events = events;

            override toString() {
                // prettier-ignore
                return [
                    `${this.name}(${this.id}){`,
                    ...filteredKeys.map(key => `\t${key as string}: ${this._object[key]}`), 
                    `}`
                ].join("\n");
            }
        };

        filteredKeys.forEach(key => {
            Object.defineProperty(dynamicEventTarget.prototype, key, {
                get() {
                    return this._object[key];
                },
                set(value) {
                    if (!Utility.isEqualTo(this._object[key], value)) this.trigger_(new EventSourceObject(this, dynamicEventTarget.events[`${key as string}Changed`]));
                    this._object[key] = value;
                }
            });
        });
        Object.seal(dynamicEventTarget);
        Object.seal(dynamicEventTarget.prototype);

        return dynamicEventTarget as unknown as DynamicEventTargetConstructor<T>;
    }
}

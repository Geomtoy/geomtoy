import { Type } from "@geomtoy/util";
import Shape from "../base/Shape";
import { isParentShape } from "./parent-shape";

function isPrimitive(value: any) {
    if (value === Object(value)) {
        return false;
    } else {
        return true;
    }
}
function clonePlainObject(value: { [key: string]: any }) {
    const ret = {} as { [key: string]: any };
    for (const [k, v] of Object.entries(value)) {
        if (Type.isPlainObject(v)) {
            ret[k] = clonePlainObject(v);
        } else if (Type.isArray(v)) {
            ret[k] = cloneArray(v);
        } else if (v instanceof Shape) {
            if (isParentShape(v)) ret[k] = v.deepClone();
            else ret[k] = v.clone();
        } else {
            ret[k] = v;
        }
    }
    return ret;
}
function cloneArray(value: any[]) {
    const ret = [] as any[];
    for (const [i, v] of value.entries()) {
        if (Type.isPlainObject(v)) {
            ret[i] = clonePlainObject(v);
        } else if (Type.isArray(v)) {
            ret[i] = cloneArray(v);
        } else if (v instanceof Shape) {
            if (isParentShape(v)) ret[i] = v.deepClone();
            else ret[i] = v.clone();
        } else {
            ret[i] = v;
        }
    }
    return ret;
}

export function cloneResult(value: any) {
    // DO NOT NEED CLONED!
    // primitive value
    if (isPrimitive(value)) return value;
    // function
    if (Type.isFunction(value)) return value;

    // DO NEED CLONED!
    // shape
    if (value instanceof Shape) {
        if (isParentShape(value)) return value.deepClone();
        else return value.clone();
    }
    // plain object
    if (Type.isPlainObject(value)) return clonePlainObject(value);
    // array
    if (Type.isArray(value)) return cloneArray(value);

    throw new Error("[G]Encounter something we do not expected.");
}

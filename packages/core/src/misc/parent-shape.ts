import Shape from "../base/Shape";
import { ParentShape } from "../types";

export function isParentShape(shape: Shape): shape is ParentShape {
    if ("items" in shape && "deepClone" in shape) return true;
    return false;
}

import Type from "./Type";
import type { StaticClass } from "./types";

interface Length extends StaticClass {}
class Length {
    constructor() {
        throw new Error("[G]`Length` can not used as a constructor.");
    }

    static is(v: any): v is number {
        return Type.isRealNumber(v) && v >= 0;
    }
    static isZero(l: number) {
        return l === 0;
    }
    static isNonZero(l: number) {
        return Type.isRealNumber(l) && l > 0;
    }
}
export default Length;

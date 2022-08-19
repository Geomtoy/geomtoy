import { Utility } from "@geomtoy/util";

import type Geomtoy from "../geomtoy";
import type { Options, RecursivePartial } from "../types";

export const defaultOptions: Options = {
    epsilon: 2 ** -32,
    curveEpsilon: 2 ** -16,
    graphics: {
        point: {
            size: 6,
            appearance: "circle" // global default
        },
        arrow: {
            width: 5,
            length: 10,
            foldback: 0,
            noFoldback: true
        },
        lineArrow: true,
        vectorArrow: true,
        rayArrow: true,
        polygonSegmentArrow: true,
        pathSegmentArrow: true
    }
};
const optionerMap: WeakMap<Geomtoy, Optioner> = new WeakMap();

function applyOptionsRules(target: Options) {
    if (target.epsilon > 2 ** -16) target.epsilon = 2 ** -16;
    if (target.epsilon < 2 ** -52) target.epsilon = 2 ** -52;
}

class Optioner {
    options: Options;
    constructor() {
        this.options = Utility.cloneDeep(defaultOptions);
    }
    getOptions() {
        return Utility.cloneDeep(this.options);
    }
    setOptions(options: RecursivePartial<Options>) {
        Utility.assignDeep(this.options, options);
        applyOptionsRules(this.options);
    }
}

export function optionerOf(g: Geomtoy) {
    if (!optionerMap.has(g)) optionerMap.set(g, new Optioner());
    return optionerMap.get(g)!;
}

export default Optioner;

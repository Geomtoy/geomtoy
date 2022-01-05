import util from "../utility"

import type Geomtoy from "../geomtoy"
import type { Options, RecursivePartial } from "../types"

export const defaultOptions: Options = {
    epsilon: 2 ** -32,
    graphics: {
        pointSize: 2,
        lineArrow: true,
        vectorArrow: true,
        rayArrow: true,
        arrow: {
            width: 5,
            length: 10,
            foldback: 1,
            noFoldback: false
        }
    },
    pathSampleRatio: 100
}
const optionerMap: WeakMap<Geomtoy, Optioner> = new WeakMap()

function applyOptionsRules(target: Options) {
    if (target.epsilon > 2 ** -16) target.epsilon = 2 ** -16
    if (target.epsilon < 2 ** -52) target.epsilon = 2 ** -52
}

class Optioner {
    options: Options
    constructor() {
        this.options = util.cloneDeep(defaultOptions)
    }
    getOptions() {
        return util.cloneDeep(this.options)
    }
    setOptions(options: RecursivePartial<Options>) {
        util.assignDeep(this.options, options)
        applyOptionsRules(this.options)
    }
}

export function optionerOf(g: Geomtoy) {
    if (!optionerMap.has(g)) optionerMap.set(g, new Optioner())
    return optionerMap.get(g)!
}

export default Optioner

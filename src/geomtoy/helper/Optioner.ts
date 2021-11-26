import Geomtoy from ".."
import { defaultOptions } from "../consts"
import { Options, RecursivePartial } from "../types"
import util from "../utility"

const optionerMap: WeakMap<Geomtoy, Optioner> = new WeakMap()

function applyOptionsRules(target: Options) {
    if (target.epsilon > 2 ** -16) target.epsilon = 2 ** -16
    if (target.epsilon < 2 ** -52) target.epsilon = 2 ** -52
}

class Optioner {
    public options: Options
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

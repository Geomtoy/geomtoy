import util from "./utility"

class Polyline {
    points
    constructor(...ps) {
        if (ps.length === 1) {
            this.points = util.cloneDeep(ps[0])
        } else {
            this.points = util.cloneDeep(ps)
        }
    }
}

export default Polyline

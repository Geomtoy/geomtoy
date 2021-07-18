import _ from "lodash"

class Polyline {
    points
    constructor(...ps) {
        if (ps.length === 1) {
            this.points = _.cloneDeep(ps[0])
        } else {
            this.points = _.cloneDeep(ps)
        }
    }
}

export default Polyline

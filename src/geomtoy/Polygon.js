import _ from "lodash"

class Polygon {
    points
    constructor(...ps) {
        if (ps.length === 1) {
            this.points = _.cloneDeep(ps[0])
        } else {
            this.points = _.cloneDeep(ps)
        }
    }

    isConcyclic(){
        
    }
}

export default Polygon

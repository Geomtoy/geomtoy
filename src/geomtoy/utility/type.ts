import _ from "lodash"
import { Coordinate } from "../types"

export default {
    isCoordinate(value: any): value is Coordinate {
        return _.isArray(value) && _.every(value, _.isNumber) && value.length == 2
    }
}

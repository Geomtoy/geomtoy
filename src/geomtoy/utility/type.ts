import _ from "lodash"
import { Coordinate, GraphicDirectiveType} from "../types"

const typeUtility = {
    isCoordinate(value: any): value is Coordinate {
        return _.isArray(value) && _.every(value, _.isNumber) && value.length == 2
    },
    isGraphicDirectiveType(value: any): value is GraphicDirectiveType {
        return value in GraphicDirectiveType
    }
}

export default typeUtility

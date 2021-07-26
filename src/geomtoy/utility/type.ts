import _ from "lodash"
import util from "."
import { Coordinate, Size, GraphicDirectiveType } from "../types"
import Point from "../Point"
import Line from "../Line"

const typeUtility = {
    isRealNumber(value: any): boolean {
        return _.isNumber(value) && !_.isNaN(value) && _.isFinite(value)
    },
    isBoolean(value: any): boolean {
        return _.isBoolean(value)
    },
    isCoordinate(value: any): value is Coordinate {
        return _.isArray(value) && value.length === 2 && _.every(value, typeUtility.isRealNumber)
    },
    isSize(value: any): value is Size {
        return _.isArray(value) && value.length === 2 && _.every(value, v => typeUtility.isRealNumber(v) && util.defGreaterThan(v, 0))
    },
    isGraphicDirectiveType(value: any): value is GraphicDirectiveType {
        return value in GraphicDirectiveType
    }
}

export default typeUtility

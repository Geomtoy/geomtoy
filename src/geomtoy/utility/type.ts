import util from "."
import math from "./math"
import { Coordinate, Size, GraphicDirectiveType } from "../types"

const type = {
    isNumber(value: any): boolean {
        return util.isNumber(value)
    },
    isInteger(value: any): boolean {
        return util.isInteger(value)
    },
    isRealNumber(value: any): boolean {
        return util.isNumber(value) && !util.isNaN(value) && util.isFinite(value)
    },
    isBoolean(value: any): boolean {
        return util.isBoolean(value)
    },
    isCoordinate(value: any): value is Coordinate {
        return util.isArray(value) && value.length === 2 && util.every(value, type.isRealNumber)
    },
    isSize(value: any): value is Size {
        return util.isArray(value) && value.length === 2 && util.every(value, v => type.isRealNumber(v) && math.greaterThan(v, 0))
    },
    isGraphicDirectiveType(value: any): value is GraphicDirectiveType {
        return value in GraphicDirectiveType
    }
}

export default type

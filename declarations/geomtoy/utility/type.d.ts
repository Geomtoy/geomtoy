import { Coordinate, Size, GraphicDirectiveType } from "../types";
declare const type: {
    isNumber(value: any): boolean;
    isInteger(value: any): boolean;
    isRealNumber(value: any): boolean;
    isBoolean(value: any): boolean;
    isCoordinate(value: any): value is Coordinate;
    isSize(value: any): value is Size;
    isGraphicDirectiveType(value: any): value is GraphicDirectiveType;
};
export default type;

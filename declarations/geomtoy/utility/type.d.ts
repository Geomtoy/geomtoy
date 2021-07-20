import { Coordinate, GraphicDirectiveType } from "../types";
declare const typeUtility: {
    isCoordinate(value: any): value is Coordinate;
    isGraphicDirectiveType(value: any): value is GraphicDirectiveType;
};
export default typeUtility;

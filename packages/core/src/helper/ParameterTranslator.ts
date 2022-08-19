import { Assert, Type } from "@geomtoy/util";
import Point from "../geometries/basic/Point";
import Vector from "../geometries/basic/Vector";

export default class ParameterTranslator {
    static coordinates(coordinatesLike: [number, number] | Point, parameterName: string) {
        if (Type.isArray(coordinatesLike)) {
            return Assert.isCoordinates(coordinatesLike, parameterName), coordinatesLike;
        }
        return coordinatesLike.coordinates;
    }
}

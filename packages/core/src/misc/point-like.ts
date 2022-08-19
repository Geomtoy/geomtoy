import { Assert, Type } from "@geomtoy/util";
import Point from "../geometries/basic/Point";

export function getCoordinates(input: [number, number] | Point, parameterName: string) {
    if (Type.isArray(input)) {
        return Assert.isCoordinates(input, parameterName), input;
    }
    return input.coordinates;
}

export function getPoint(input: [number, number] | Point, parameterName: string) {
    if (Type.isArray(input)) {
        return Assert.isCoordinates(input, parameterName), new Point(input);
    }
    return input;
}

import Polygon from "../geometries/general/Polygon";
import { PolygonVertex } from "../types";

export function parseSVGPolygon(points: string) {
    const polygon = {
        vertices: [] as PolygonVertex[]
    };

    if (points === "") return polygon;
    const params = points.match(/[+-]?(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?/g);
    const length = params?.length ?? 0;
    if (length === 0) return polygon;

    function getParam(index: number) {
        return Number(params![index]);
    }
    function getCoordinates(index: number) {
        const x = getParam(index);
        const y = getParam(index + 1);
        return [x, y] as [number, number];
    }

    for (let i = 0, l = length; i < l; i += 2) {
        polygon.vertices.push(Polygon.vertex(getCoordinates(i)));
    }
    return polygon;
}

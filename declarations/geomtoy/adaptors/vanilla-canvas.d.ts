import Geomtoy from "..";
import GeomObject from "../base/GeomObject";
export default class {
    context: CanvasRenderingContext2D;
    geomtoy: Geomtoy;
    constructor(context: any, geomtoy: Geomtoy);
    draw(object: GeomObject): CanvasRenderingContext2D;
    clear(): CanvasRenderingContext2D;
}

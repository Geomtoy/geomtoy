import Geomtoy from "..";
import GeomObject from "../base/GeomObject";
export default class {
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    geomtoy: Geomtoy;
    constructor(context: any, geomtoy: Geomtoy);
    setup(): void;
    draw(object: GeomObject): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    clear(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
}

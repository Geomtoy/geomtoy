import Geomtoy from "..";
import GeomObject from "../base/GeomObject";
import { Visible } from "../interfaces";
export default class {
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    geomtoy: Geomtoy;
    constructor(context: any, geomtoy: Geomtoy);
    setup(): void;
    draw(object: GeomObject & Visible): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    clear(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
}

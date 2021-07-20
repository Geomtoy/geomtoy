import { GraphicImplType } from "./types";
declare class Ellipse {
    #private;
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    constructor(cx: number, cy: number, rx: number, ry: number);
    getGraphic(type: GraphicImplType): object[];
}
export default Ellipse;

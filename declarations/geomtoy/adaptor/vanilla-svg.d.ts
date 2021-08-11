import Geomtoy from "..";
import GeomObject from "../base/GeomObject";
import { Visible } from "../interfaces";
export default class {
    svgContainer: SVGGElement | SVGSVGElement;
    geomtoy: Geomtoy;
    constructor(svgContainer: any, geomtoy: Geomtoy);
    setup(): void;
    draw(object: GeomObject & Visible): SVGGElement | SVGSVGElement;
    clear(): SVGGElement | SVGSVGElement;
}

import Geomtoy from "..";
import GeomObject from "../base/GeomObject";
export default class {
    svgContainer: SVGGElement | SVGSVGElement;
    geomtoy: Geomtoy;
    constructor(svgContainer: any, geomtoy: Geomtoy);
    setup(): void;
    draw(object: GeomObject): SVGGElement | SVGSVGElement;
    clear(): SVGGElement | SVGSVGElement;
}

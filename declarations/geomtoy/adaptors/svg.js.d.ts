import Geomtoy from "..";
import GeomObject from "../base/GeomObject";
export default class {
    svgDotJsContainer: any;
    geomtoy: Geomtoy;
    constructor(svgDotJsContainer: any, geomtoy: Geomtoy);
    draw(object: GeomObject): any;
    clear(): any;
}

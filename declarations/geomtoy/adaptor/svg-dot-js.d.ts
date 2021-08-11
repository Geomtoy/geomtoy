import Geomtoy from "..";
import GeomObject from "../base/GeomObject";
import { Visible } from "../interfaces";
export default class {
    svgDotJsContainer: any;
    geomtoy: Geomtoy;
    constructor(svgDotJsContainer: any, geomtoy: Geomtoy);
    setup(): void;
    draw(object: GeomObject & Visible): any;
    clear(): any;
}

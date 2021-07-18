import Matrix from "../transformation/Matrix";
import { Coordinate } from "../types";
import GeomObject from "./GeomObject";
declare abstract class GeomObjectD0 extends GeomObject {
    abstract x: number;
    abstract y: number;
    abstract transformation: Matrix;
    normalize(): GeomObjectD0;
    normalizeO(): GeomObjectD0;
    translate(dx: number, dy: number): GeomObjectD0;
    translateO(dx: number, dy: number): GeomObjectD0;
    rotate(angle: number): GeomObjectD0;
    rotateO(angle: number): GeomObjectD0;
    scale(): void;
    scaleO(): void;
    getCoordinate(): Coordinate;
}
export default GeomObjectD0;

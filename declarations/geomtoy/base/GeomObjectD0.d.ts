import Matrix from "../transformation/Matrix";
import GeomObject from "./GeomObject";
declare abstract class GeomObjectD0 extends GeomObject {
    abstract x: number;
    abstract y: number;
    abstract transformation: Matrix;
}
export default GeomObjectD0;

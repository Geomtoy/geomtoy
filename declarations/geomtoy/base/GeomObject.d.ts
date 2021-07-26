import Transformation from "../transformation";
import { Options, GraphicImplType, CanvasDirective, SvgDirective } from "../types";
declare abstract class GeomObject {
    options: Options;
    abstract apply(transformation: Transformation): GeomObject;
    abstract clone(): GeomObject;
    abstract toString(): string;
    abstract toObject(): object;
    abstract toArray(): [...value: any[]];
    abstract getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective>;
}
export default GeomObject;

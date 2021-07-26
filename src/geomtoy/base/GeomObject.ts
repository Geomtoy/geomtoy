import Transformation from "../transformation"
import { defaultOptions, Options, GraphicImplType, CanvasDirective, SvgDirective } from "../types"

abstract class GeomObject {
    options: Options = defaultOptions

    abstract apply(transformation: Transformation): GeomObject
    abstract clone(): GeomObject
    abstract toString(): string
    abstract toObject(): object
    abstract toArray(): [...value: any[]]

    abstract getGraphic(type: GraphicImplType): Array<SvgDirective | CanvasDirective>
}
export default GeomObject

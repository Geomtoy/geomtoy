import GeomObject from "../base/GeomObject"
import Shape from "../base/Shape"
import util from "../utility"
import assert from "../utility/assertion"
import Contain from "./Contain"
import Cross from "./Cross"

class Relationship extends GeomObject {
    private _isDefined(rs: Cross | Contain, shape: Shape, otherShape: Shape) {
        const type1 = shape.type
        const type2 = otherShape.type
        const rsStatic = rs.constructor
        const rsName = rsStatic.name
        // @ts-ignore
        const verb = rsStatic.verb
        const staticMethodName = `${type1}${verb}${type2}`
        if (!(staticMethodName in rsStatic)) {
            throw new Error(`[G]There is no relationship of \`${rsName}\` of \`${type1}\` and \`${type2}\`.`)
        } else {
            return staticMethodName as keyof typeof rs
        }
    }
    cross(shape: Shape, otherShape: Shape, quick = false) {
        assert.isShape(shape, "shape")
        assert.isShape(otherShape, "otherShape")
        const staticMethodName = this._isDefined(Cross, shape, otherShape)
        const staticMethod = Cross[staticMethodName] as Function
        return staticMethod.call(this, shape, otherShape, quick)
    }
    toString(): string {
        throw new Error("Method not implemented.")
    }
    toArray(): any[] {
        throw new Error("Method not implemented.")
    }
    toObject(): object {
        throw new Error("Method not implemented.")
    }
}

export default Relationship
// G.Reationship().cross(line1,line2,true)

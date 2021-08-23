import Geomtoy from ".."
import util from "../utility"

abstract class GeomObject {
    #owner: Geomtoy = null as any as Geomtoy
    #uuid = util.uuid()

    constructor(owner: Geomtoy) {
        this.owner = owner
    }
    get owner() {
        return this.#owner!
    }
    set owner(value: Geomtoy) {
        if (!(value instanceof Geomtoy)) throw new Error("[G]The `owner` of a `GeomObject` should be a `Geomtoy`.")
        this.#owner = value
    }
    get name() {
        return this.constructor.name
    }
    get uuid() {
        return this.#uuid
    }

    abstract isValid(): boolean
    abstract clone(): GeomObject
    abstract toString(): string
    abstract toArray(): Array<any>
    abstract toObject(): object
}
/**
 * @category Base
 */
export default GeomObject

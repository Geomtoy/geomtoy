import Geomtoy from ".."

abstract class GeomObject {
    #owner: Geomtoy = null as any as Geomtoy
    
    constructor(owner: Geomtoy) {
        this.owner = owner
    }
    get owner() {
        return this.#owner!
    }
    set owner(value: Geomtoy) {
        if (!(value instanceof Geomtoy)) throw new Error("[G]The `owner` of a `GeomObject` should be a `Geomtoy` instance.")
        this.#owner = value
    }

    abstract clone(): GeomObject
    abstract toString(): string
    abstract toArray(): Array<any>
    abstract toObject(): object
}
/**
 * @category Base
 */
export default GeomObject

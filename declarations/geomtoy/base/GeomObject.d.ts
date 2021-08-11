import Geomtoy from "..";
declare abstract class GeomObject {
    #private;
    constructor(o: Geomtoy);
    get owner(): Geomtoy;
    set owner(value: Geomtoy);
    abstract clone(): GeomObject;
    abstract toString(): string;
    abstract toArray(): Array<any>;
    abstract toObject(): object;
}
export default GeomObject;

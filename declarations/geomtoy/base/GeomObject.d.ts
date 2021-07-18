declare abstract class GeomObject {
    abstract translate(...args: any): any;
    abstract rotate(...args: any): any;
    abstract scale(...args: any): any;
    abstract skew(...args: any): any;
    abstract lineReflect(...args: any): any;
    abstract pointReflect(...args: any): any;
    abstract transform(...args: any): any;
    abstract clone(): any;
    abstract toString(): any;
    abstract toObject(): any;
    abstract toArray(): any;
}
export default GeomObject;

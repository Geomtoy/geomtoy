declare function geomObjectD0Mixin<T extends abstract new (...args: any[]) => any>(c: T): (abstract new (...args: any[]) => {
    [x: string]: any;
}) & T;
export default geomObjectD0Mixin;

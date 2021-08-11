export declare function sealed(constructor: new (...args: any[]) => any): void;
export declare function validateOwner(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>): void;
export declare function sameOwner(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export declare function is(t: "realNumber" | "integer" | "positiveNumber" | "nonZeroNumber" | "negativeNumber" | "coordinate" | "coordinateArray" | "size" | "boolean" | "point" | "pointArray" | "line" | "ellipse"): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function compared(t: "gt" | "lt" | "eq" | "ge" | "le" | "ne", n: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

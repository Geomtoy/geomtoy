export declare function sealed(constructor: new (...args: any[]) => any): void;
export declare function is(t: "realNumber" | "integer" | "positiveNumber" | "nonZeroNumber" | "negativeNumber" | "size" | "boolean" | "point" | "line" | "ellipse"): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function compared(t: "gt" | "lt" | "eq" | "ge" | "le" | "ne", n: number): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;

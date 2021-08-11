import Point from "./Point";
import Line from "./Line";
import Segment from "./Segment";
import Vector from "./Vector";
import Triangle from "./Triangle";
import Circle from "./Circle";
import Rectangle from "./Rectangle";
import Polyline from "./Polyline";
import Polygon from "./Polygon";
import RegularPolygon from "./RegularPolygon";
import Ellipse from "./Ellipse";
import Transformation from "./transformation";
import Inversion from "./inversion/Inversion";
import Matrix from "./transformation/Matrix";
import { Options } from "./types";
import vanillaCanvas from "./adaptor/vanilla-canvas";
import vanillaSvg from "./adaptor/vanilla-svg";
import svgDotJs from "./adaptor/svg-dot-js";
declare type Tail<T extends any[]> = T extends [infer A, ...infer R] ? R : never;
declare type ConstructorOverloads<T> = T extends {
    new (...args: infer A1): infer R1;
    new (...args: infer A2): infer R2;
    new (...args: infer A3): infer R3;
    new (...args: infer A4): infer R4;
    new (...args: infer A5): infer R5;
    new (...args: infer A6): infer R6;
} ? [
    new (...args: A1) => R1,
    new (...args: A2) => R2,
    new (...args: A3) => R3,
    new (...args: A4) => R4,
    new (...args: A5) => R5,
    new (...args: A6) => R6
] : T extends {
    new (...args: infer A1): infer R1;
    new (...args: infer A2): infer R2;
    new (...args: infer A3): infer R3;
    new (...args: infer A4): infer R4;
    new (...args: infer A5): infer R5;
} ? [
    new (...args: A1) => R1,
    new (...args: A2) => R2,
    new (...args: A3) => R3,
    new (...args: A4) => R4,
    new (...args: A5) => R5
] : T extends {
    new (...args: infer A1): infer R1;
    new (...args: infer A2): infer R2;
    new (...args: infer A3): infer R3;
    new (...args: infer A4): infer R4;
} ? [
    new (...args: A1) => R1,
    new (...args: A2) => R2,
    new (...args: A3) => R3,
    new (...args: A4) => R4
] : T extends {
    new (...args: infer A1): infer R1;
    new (...args: infer A2): infer R2;
    new (...args: infer A3): infer R3;
} ? [
    new (...args: A1) => R1,
    new (...args: A2) => R2,
    new (...args: A3) => R3
] : T extends {
    new (...args: infer A1): infer R1;
    new (...args: infer A2): infer R2;
} ? [
    new (...args: A1) => R1,
    new (...args: A2) => R2
] : T extends {
    new (...args: infer A1): infer R1;
} ? [
    new (...args: A1) => R1
] : never;
declare type TailedStaticMethods<T extends {
    new (...args: any): any;
}> = {
    [K in keyof T as T[K] extends (...arg: any) => any ? K : never]: T[K] extends (...arg: any) => any ? (...arg: Tail<Parameters<T[K]>>) => ReturnType<T[K]> : never;
};
declare type TailedConstructor<T extends {
    new (...args: any): any;
}> = {
    (...arg: Tail<ConstructorParameters<ConstructorOverloads<T>[number]>>): InstanceType<T>;
};
declare type TailedConstructorAndStaticMethods<T extends {
    new (...args: any): any;
}> = TailedStaticMethods<T> & TailedConstructor<T>;
declare class Geomtoy {
    #private;
    constructor(options?: Partial<Options>);
    static adapters: {
        VanillaCanvas: typeof vanillaCanvas;
        VanillaSvg: typeof vanillaSvg;
        SvgDotJs: typeof svgDotJs;
    };
    getOptions(): Options;
    setOptions(options?: Partial<Options>): void;
    get name(): string;
    get uuid(): string;
    get globalTransformation(): Matrix;
    get Point(): TailedConstructorAndStaticMethods<typeof Point>;
    get Line(): TailedConstructorAndStaticMethods<typeof Line>;
    get Segment(): TailedConstructorAndStaticMethods<typeof Segment>;
    get Vector(): TailedConstructorAndStaticMethods<typeof Vector>;
    get Triangle(): TailedConstructorAndStaticMethods<typeof Triangle>;
    get Circle(): TailedConstructorAndStaticMethods<typeof Circle>;
    get Rectangle(): TailedConstructorAndStaticMethods<typeof Rectangle>;
    get Polyline(): TailedConstructorAndStaticMethods<typeof Polyline>;
    get Polygon(): TailedConstructorAndStaticMethods<typeof Polygon>;
    get RegularPolygon(): TailedConstructorAndStaticMethods<typeof RegularPolygon>;
    get Ellipse(): TailedConstructorAndStaticMethods<typeof Ellipse>;
    get Transformation(): TailedConstructorAndStaticMethods<typeof Transformation>;
    get Inversion(): TailedConstructorAndStaticMethods<typeof Inversion>;
}
export default Geomtoy;

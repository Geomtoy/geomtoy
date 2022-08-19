export type StaticClass = {
    new (...args: any[]): never;
};

export type RootMultiplicity<T extends number | [number, number]> = {
    root: T;
    multiplicity: number;
};
/** @internal */
export interface RpolyQuadRParam {
    sr: number;
    si: number;
    lr: number;
    li: number;
}
/** @internal */
export interface RpolyQuadSdParam {
    a: number;
    b: number;
}
/** @internal */
export interface RpolyCalcParam {
    a1: number;
    a3: number;
    a7: number;
    c: number;
    d: number;
    e: number;
    f: number;
    g: number;
    h: number;
}
/** @internal */
export interface RpolyShfParam {
    nz: number;
    lzi: number;
    lzr: number;
    szi: number;
    szr: number;
}

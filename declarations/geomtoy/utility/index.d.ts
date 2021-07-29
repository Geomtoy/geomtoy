import _ from "lodash";
declare const util: {
    every: {
        <T>(collection: _.List<T> | null | undefined, predicate?: _.ListIterateeCustom<T, boolean> | undefined): boolean;
        <T_1 extends object>(collection: T_1 | null | undefined, predicate?: _.ObjectIterateeCustom<T_1, boolean> | undefined): boolean;
    };
    map: {
        <T_2, TResult>(collection: T_2[] | null | undefined, iteratee: _.ArrayIterator<T_2, TResult>): TResult[];
        <T_3, TResult_1>(collection: _.List<T_3> | null | undefined, iteratee: _.ListIterator<T_3, TResult_1>): TResult_1[];
        <T_4>(collection: _.Dictionary<T_4> | _.NumericDictionary<T_4> | null | undefined): T_4[];
        <T_5 extends object, TResult_2>(collection: T_5 | null | undefined, iteratee: _.ObjectIterator<T_5, TResult_2>): TResult_2[];
        <T_6, K extends keyof T_6>(collection: _.Dictionary<T_6> | _.NumericDictionary<T_6> | null | undefined, iteratee: K): T_6[K][];
        <T_7>(collection: _.Dictionary<T_7> | _.NumericDictionary<T_7> | null | undefined, iteratee?: string | undefined): any[];
        <T_8>(collection: _.Dictionary<T_8> | _.NumericDictionary<T_8> | null | undefined, iteratee?: object | undefined): boolean[];
    };
    nth: <T_9>(array: _.List<T_9> | null | undefined, n?: number | undefined) => T_9 | undefined;
    forEach: {
        <T_10>(collection: T_10[], iteratee?: _.ArrayIterator<T_10, any> | undefined): T_10[];
        (collection: string, iteratee?: _.StringIterator<any> | undefined): string;
        <T_11>(collection: _.List<T_11>, iteratee?: _.ListIterator<T_11, any> | undefined): _.List<T_11>;
        <T_12 extends object>(collection: T_12, iteratee?: _.ObjectIterator<T_12, any> | undefined): T_12;
        <T_13, TArray extends T_13[] | null | undefined>(collection: TArray & (T_13[] | null | undefined), iteratee?: _.ArrayIterator<T_13, any> | undefined): TArray;
        <TString extends string | null | undefined>(collection: TString, iteratee?: _.StringIterator<any> | undefined): TString;
        <T_14, TList extends _.List<T_14> | null | undefined>(collection: TList & (_.List<T_14> | null | undefined), iteratee?: _.ListIterator<T_14, any> | undefined): TList;
        <T_15 extends object>(collection: T_15 | null | undefined, iteratee?: _.ObjectIterator<T_15, any> | undefined): T_15 | null | undefined;
    };
    defaultsDeep: (object: any, ...sources: any[]) => any;
    cloneDeep: <T_16>(value: T_16) => T_16;
    range: {
        (start: number, end?: number | undefined, step?: number | undefined): number[];
        (end: number, index: string | number, guard: object): number[];
    };
    uniqWith: <T_17>(array: _.List<T_17> | null | undefined, comparator?: _.Comparator<T_17> | undefined) => T_17[];
    isInteger: (value?: any) => boolean;
    isNumber: (value?: any) => value is number;
    isBoolean: (value?: any) => value is boolean;
    isNaN: (value?: any) => boolean;
    isFinite: (value?: any) => boolean;
    isArray: {
        (value?: any): value is any[];
        <T_18>(value?: any): value is any[];
    };
};
export default util;

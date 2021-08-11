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
    filter: {
        (collection: string | null | undefined, predicate?: _.StringIterator<boolean> | undefined): string[];
        <T_9, S extends T_9>(collection: _.List<T_9> | null | undefined, predicate: _.ListIteratorTypeGuard<T_9, S>): S[];
        <T_10>(collection: _.List<T_10> | null | undefined, predicate?: _.ListIterateeCustom<T_10, boolean> | undefined): T_10[];
        <T_11 extends object, S_1 extends T_11[keyof T_11]>(collection: T_11 | null | undefined, predicate: _.ObjectIteratorTypeGuard<T_11, S_1>): S_1[];
        <T_12 extends object>(collection: T_12 | null | undefined, predicate?: _.ObjectIterateeCustom<T_12, boolean> | undefined): T_12[keyof T_12][];
    };
    nth: <T_13>(array: _.List<T_13> | null | undefined, n?: number | undefined) => T_13 | undefined;
    forEach: {
        <T_14>(collection: T_14[], iteratee?: _.ArrayIterator<T_14, any> | undefined): T_14[];
        (collection: string, iteratee?: _.StringIterator<any> | undefined): string;
        <T_15>(collection: _.List<T_15>, iteratee?: _.ListIterator<T_15, any> | undefined): _.List<T_15>;
        <T_16 extends object>(collection: T_16, iteratee?: _.ObjectIterator<T_16, any> | undefined): T_16;
        <T_17, TArray extends T_17[] | null | undefined>(collection: TArray & (T_17[] | null | undefined), iteratee?: _.ArrayIterator<T_17, any> | undefined): TArray;
        <TString extends string | null | undefined>(collection: TString, iteratee?: _.StringIterator<any> | undefined): TString;
        <T_18, TList extends _.List<T_18> | null | undefined>(collection: TList & (_.List<T_18> | null | undefined), iteratee?: _.ListIterator<T_18, any> | undefined): TList;
        <T_19 extends object>(collection: T_19 | null | undefined, iteratee?: _.ObjectIterator<T_19, any> | undefined): T_19 | null | undefined;
    };
    reduce: {
        <T_20, TResult_3>(collection: T_20[] | null | undefined, callback: _.MemoListIterator<T_20, TResult_3, T_20[]>, accumulator: TResult_3): TResult_3;
        <T_21, TResult_4>(collection: _.List<T_21> | null | undefined, callback: _.MemoListIterator<T_21, TResult_4, _.List<T_21>>, accumulator: TResult_4): TResult_4;
        <T_22 extends object, TResult_5>(collection: T_22 | null | undefined, callback: _.MemoObjectIterator<T_22[keyof T_22], TResult_5, T_22>, accumulator: TResult_5): TResult_5;
        <T_23>(collection: T_23[] | null | undefined, callback: _.MemoListIterator<T_23, T_23, T_23[]>): T_23 | undefined;
        <T_24>(collection: _.List<T_24> | null | undefined, callback: _.MemoListIterator<T_24, T_24, _.List<T_24>>): T_24 | undefined;
        <T_25 extends object>(collection: T_25 | null | undefined, callback: _.MemoObjectIterator<T_25[keyof T_25], T_25[keyof T_25], T_25>): T_25[keyof T_25] | undefined;
    };
    transform: {
        <T_26, TResult_6>(object: readonly T_26[], iteratee: _.MemoVoidArrayIterator<T_26, TResult_6>, accumulator?: TResult_6 | undefined): TResult_6;
        <T_27, TResult_7>(object: _.Dictionary<T_27>, iteratee: _.MemoVoidDictionaryIterator<T_27, string, TResult_7>, accumulator?: TResult_7 | undefined): TResult_7;
        <T_28 extends object, TResult_8>(object: T_28, iteratee: _.MemoVoidDictionaryIterator<T_28[keyof T_28], keyof T_28, TResult_8>, accumulator?: TResult_8 | undefined): TResult_8;
        (object: any[]): any[];
        (object: object): _.Dictionary<any>;
    };
    head: <T_29>(array: _.List<T_29> | null | undefined) => T_29 | undefined;
    tail: <T_30>(array: _.List<T_30> | null | undefined) => T_30[];
    initial: <T_31>(array: _.List<T_31> | null | undefined) => T_31[];
    last: <T_32>(array: _.List<T_32> | null | undefined) => T_32 | undefined;
    includes: <T_33>(collection: _.Dictionary<T_33> | _.NumericDictionary<T_33> | null | undefined, target: T_33, fromIndex?: number | undefined) => boolean;
    range: {
        (start: number, end?: number | undefined, step?: number | undefined): number[];
        (end: number, index: string | number, guard: object): number[];
    };
    uniqWith: <T_34>(array: _.List<T_34> | null | undefined, comparator?: _.Comparator<T_34> | undefined) => T_34[];
    isInteger: (value?: any) => boolean;
    isNumber: (value?: any) => value is number;
    isBoolean: (value?: any) => value is boolean;
    isNaN: (value?: any) => boolean;
    isFinite: (value?: any) => boolean;
    isArray: (arg: any) => arg is any[];
    isFunction: (value: any) => value is (...args: any[]) => any;
    isRealNumber: (value: any) => value is number;
    isCoordinate: (value: any) => value is [number, number];
    isSize: (value: any) => value is [number, number];
    defaults: {
        <TObject, TSource>(object: TObject, source: TSource): NonNullable<TSource & TObject>;
        <TObject_1, TSource1, TSource2>(object: TObject_1, source1: TSource1, source2: TSource2): NonNullable<TSource2 & TSource1 & TObject_1>;
        <TObject_2, TSource1_1, TSource2_1, TSource3>(object: TObject_2, source1: TSource1_1, source2: TSource2_1, source3: TSource3): NonNullable<TSource3 & TSource2_1 & TSource1_1 & TObject_2>;
        <TObject_3, TSource1_2, TSource2_2, TSource3_1, TSource4>(object: TObject_3, source1: TSource1_2, source2: TSource2_2, source3: TSource3_1, source4: TSource4): NonNullable<TSource4 & TSource3_1 & TSource2_2 & TSource1_2 & TObject_3>;
        <TObject_4>(object: TObject_4): NonNullable<TObject_4>;
        (object: any, ...sources: any[]): any;
    };
    defaultsDeep: (object: any, ...sources: any[]) => any;
    clone: <T_35>(value: T_35) => T_35;
    cloneDeep: <T_36>(value: T_36) => T_36;
    assign: {
        <TObject_5, TSource_1>(object: TObject_5, source: TSource_1): TObject_5 & TSource_1;
        <TObject_6, TSource1_3, TSource2_3>(object: TObject_6, source1: TSource1_3, source2: TSource2_3): TObject_6 & TSource1_3 & TSource2_3;
        <TObject_7, TSource1_4, TSource2_4, TSource3_2>(object: TObject_7, source1: TSource1_4, source2: TSource2_4, source3: TSource3_2): TObject_7 & TSource1_4 & TSource2_4 & TSource3_2;
        <TObject_8, TSource1_5, TSource2_5, TSource3_3, TSource4_1>(object: TObject_8, source1: TSource1_5, source2: TSource2_5, source3: TSource3_3, source4: TSource4_1): TObject_8 & TSource1_5 & TSource2_5 & TSource3_3 & TSource4_1;
        <TObject_9>(object: TObject_9): TObject_9;
        (object: any, ...otherArgs: any[]): any;
    };
    assignDeep: {
        <TObject_10, TSource_2>(object: TObject_10, source: TSource_2): TObject_10 & TSource_2;
        <TObject_11, TSource1_6, TSource2_6>(object: TObject_11, source1: TSource1_6, source2: TSource2_6): TObject_11 & TSource1_6 & TSource2_6;
        <TObject_12, TSource1_7, TSource2_7, TSource3_4>(object: TObject_12, source1: TSource1_7, source2: TSource2_7, source3: TSource3_4): TObject_12 & TSource1_7 & TSource2_7 & TSource3_4;
        <TObject_13, TSource1_8, TSource2_8, TSource3_5, TSource4_2>(object: TObject_13, source1: TSource1_8, source2: TSource2_8, source3: TSource3_5, source4: TSource4_2): TObject_13 & TSource1_8 & TSource2_8 & TSource3_5 & TSource4_2;
        (object: any, ...otherArgs: any[]): any;
    };
    uuid: () => string;
};
export default util;

declare const coordArray: {
    get(cs: Array<[number, number]>, index: number): [number, number] | null;
    set(cs: Array<[number, number]>, index: number, ref: [number, number]): boolean;
    append(cs: Array<[number, number]>, ref: [number, number]): void;
    prepend(cs: Array<[number, number]>, ref: [number, number]): void;
    insert(cs: Array<[number, number]>, index: number, ref: [number, number]): boolean;
    remove(cs: Array<[number, number]>, index: number, minLength: number): boolean;
};
export default coordArray;

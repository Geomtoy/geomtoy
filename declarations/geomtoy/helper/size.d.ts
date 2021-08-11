declare const size: {
    assign(s: [number, number], ref: [number, number]): void;
    width(s: [number, number], w?: number | undefined): number;
    height(s: [number, number], h?: number | undefined): number;
    copy(s: [number, number]): [number, number];
    isSameAs(s1: [number, number], s2: [number, number], epsilon: number): boolean;
};
export default size;

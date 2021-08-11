declare const coord: {
    assign(c: [number, number], ref: [number, number]): void;
    x(c: [number, number], x?: number | undefined): number;
    y(c: [number, number], y?: number | undefined): number;
    copy(c: [number, number]): [number, number];
    isSameAs(c1: [number, number], c2: [number, number], epsilon: number): boolean;
};
export default coord;

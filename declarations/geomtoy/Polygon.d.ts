export default Polygon;
declare class Polygon {
    constructor(...ps: any[]);
    points: any;
    isConcyclic(): void;
}

declare class Ellipse {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    constructor(cx: number, cy: number, rx: number, ry: number);
    generateDrawingPath(): void;
}
export default Ellipse;

import Path from "../utility/Path";
export default class artist {
    path: Path;
    ctx: CanvasRenderingContext2D;
    constructor(path: Path, ctx: CanvasRenderingContext2D);
    paint(): void;
}

import { Vector2, Maths } from "@geomtoy/util";
import Graphics from "../graphics/GeometryGraphics";
import { optioner } from "../geomtoy";
import type { ViewportDescriptor } from "../types";

class ArrowGraphics {
    constructor(public coordinates: [number, number], public angle: number) {}

    getGraphics(viewport: ViewportDescriptor) {
        const scale = viewport.density * viewport.zoom;
        const { foldback, width, length, noFoldback } = optioner.options.graphics.arrow;

        const lengthCoord = Vector2.add(this.coordinates, Vector2.from2(this.angle, -length / scale));
        const wingCoord1 = Vector2.add(lengthCoord, Vector2.from2(this.angle + Maths.PI / 2, width / scale));
        const wingCoord2 = Vector2.add(lengthCoord, Vector2.from2(this.angle - Maths.PI / 2, width / scale));
        const g = new Graphics();

        if (noFoldback) {
            g.moveTo(...this.coordinates);
            g.lineTo(...wingCoord1);
            g.moveTo(...this.coordinates);
            g.lineTo(...wingCoord2);
        } else {
            const foldbackCoord = Vector2.add(this.coordinates, Vector2.from2(this.angle, (-length * (foldback + 1)) / scale));
            g.moveTo(...this.coordinates);
            g.lineTo(...wingCoord1);
            g.lineTo(...foldbackCoord);
            g.lineTo(...wingCoord2);
            g.close();
        }
        return g;
    }
}
export default ArrowGraphics;

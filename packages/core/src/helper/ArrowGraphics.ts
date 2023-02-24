import { Vector2, Maths } from "@geomtoy/util";
import GeometryGraphic from "../graphics/GeometryGraphic";
import Graphics from "../graphics/";

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
        const gg = new GeometryGraphic();
        const g = new Graphics(gg);

        if (noFoldback) {
            gg.moveTo(...this.coordinates);
            gg.lineTo(...wingCoord1);
            gg.moveTo(...this.coordinates);
            gg.lineTo(...wingCoord2);
        } else {
            const foldbackCoord = Vector2.add(this.coordinates, Vector2.from2(this.angle, (-length * (foldback + 1)) / scale));
            gg.moveTo(...this.coordinates);
            gg.lineTo(...wingCoord1);
            gg.lineTo(...foldbackCoord);
            gg.lineTo(...wingCoord2);
            gg.close();
        }
        return g;
    }
}
export default ArrowGraphics;

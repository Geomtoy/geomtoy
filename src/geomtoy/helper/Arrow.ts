import Geomtoy from "..";
import Graphics from "../graphics";
import coord from "../utility/coord";
import { optionerOf } from "./Optioner";
import { ViewportDescriptor } from "../types";

class Arrow {
    constructor(public owner: Geomtoy, public coordinates: [number, number], public angle: number) {}

    getGraphics(viewport: ViewportDescriptor) {
        const scale = viewport.density * viewport.zoom;
        const { foldback, width, length, noFoldback } = optionerOf(this.owner).options.graphics.arrow;

        const lengthCoord = coord.moveAlongAngle(this.coordinates, this.angle, -length / scale);
        const wingCoord1 = coord.moveAlongAngle(lengthCoord, this.angle + Math.PI / 2, width / scale);
        const wingCoord2 = coord.moveAlongAngle(lengthCoord, this.angle - Math.PI / 2, width / scale);
        const g = new Graphics();

        if (noFoldback) {
            g.moveTo(...this.coordinates);
            g.lineTo(...wingCoord1);
            g.moveTo(...this.coordinates);
            g.lineTo(...wingCoord2);
        } else {
            const foldbackCoord = coord.moveAlongAngle(this.coordinates, this.angle, (-length * (foldback + 1)) / scale);
            g.moveTo(...this.coordinates);
            g.lineTo(...wingCoord1);
            g.lineTo(...foldbackCoord);
            g.lineTo(...wingCoord2);
            g.close();
        }
        return g;
    }
}
export default Arrow;

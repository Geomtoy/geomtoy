import { Vector2, Maths } from "@geomtoy/util";
import Graphics from "../graphics/GeometryGraphics";
import { optioner } from "../geomtoy";
import type { PointAppearance, ViewportDescriptor } from "../types";

class PointGraphics {
    constructor(public coordinates: [number, number], public type: PointAppearance) {}

    getGraphics(viewport: ViewportDescriptor) {
        const scale = viewport.density * viewport.zoom;
        const pointSize = optioner.options.graphics.point.size / scale;
        const g = new Graphics();

        switch (this.type) {
            case "circle": {
                g.centerArcTo(...this.coordinates, pointSize, pointSize, 0, 0, 2 * Maths.PI);
                g.close();
                break;
            }
            case "cross": {
                const adjustSize = Maths.sqrt(Maths.PI * pointSize ** 2) / 2;
                g.moveTo(...Vector2.add(this.coordinates, [-adjustSize, -adjustSize]));
                g.lineTo(...Vector2.add(this.coordinates, [adjustSize, adjustSize]));
                g.moveTo(...Vector2.add(this.coordinates, [-adjustSize, adjustSize]));
                g.lineTo(...Vector2.add(this.coordinates, [adjustSize, -adjustSize]));
                break;
            }
            case "plus": {
                g.moveTo(...Vector2.add(this.coordinates, [0, -pointSize]));
                g.lineTo(...Vector2.add(this.coordinates, [0, pointSize]));
                g.moveTo(...Vector2.add(this.coordinates, [-pointSize, 0]));
                g.lineTo(...Vector2.add(this.coordinates, [pointSize, 0]));
                break;
            }
            case "square": {
                const adjustSize = Maths.sqrt(Maths.PI * pointSize ** 2) / 2;
                g.moveTo(...Vector2.add(this.coordinates, [-adjustSize, -adjustSize]));
                g.lineTo(...Vector2.add(this.coordinates, [-adjustSize, adjustSize]));
                g.lineTo(...Vector2.add(this.coordinates, [adjustSize, adjustSize]));
                g.lineTo(...Vector2.add(this.coordinates, [adjustSize, -adjustSize]));
                g.close();
                break;
            }
            case "diamond": {
                g.moveTo(...Vector2.add(this.coordinates, [0, -pointSize]));
                g.lineTo(...Vector2.add(this.coordinates, [-pointSize, 0]));
                g.lineTo(...Vector2.add(this.coordinates, [0, pointSize]));
                g.lineTo(...Vector2.add(this.coordinates, [pointSize, 0]));
                g.close();
                break;
            }
            default: {
                throw new Error("[G]Invalid point appearance.");
            }
        }
        return g;
    }
}
export default PointGraphics;

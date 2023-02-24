import { Vector2, Maths } from "@geomtoy/util";
import GeometryGraphic from "../graphics/GeometryGraphic";
import { optioner } from "../geomtoy";
import type { PointAppearance, ViewportDescriptor } from "../types";
import Graphics from "../graphics";

class PointGraphics {
    constructor(public coordinates: [number, number], public type: PointAppearance) {}

    getGraphics(viewport: ViewportDescriptor) {
        const scale = viewport.density * viewport.zoom;
        const pointSize = optioner.options.graphics.point.size / scale;
        const gg = new GeometryGraphic();
        const g = new Graphics(gg);

        switch (this.type) {
            case "circle": {
                gg.centerArcTo(...this.coordinates, pointSize, pointSize, 0, 0, 2 * Maths.PI);
                gg.close();
                break;
            }
            case "cross": {
                const adjustSize = Maths.sqrt(Maths.PI * pointSize ** 2) / 2;
                gg.moveTo(...Vector2.add(this.coordinates, [-adjustSize, -adjustSize]));
                gg.lineTo(...Vector2.add(this.coordinates, [adjustSize, adjustSize]));
                gg.moveTo(...Vector2.add(this.coordinates, [-adjustSize, adjustSize]));
                gg.lineTo(...Vector2.add(this.coordinates, [adjustSize, -adjustSize]));
                break;
            }
            case "plus": {
                gg.moveTo(...Vector2.add(this.coordinates, [0, -pointSize]));
                gg.lineTo(...Vector2.add(this.coordinates, [0, pointSize]));
                gg.moveTo(...Vector2.add(this.coordinates, [-pointSize, 0]));
                gg.lineTo(...Vector2.add(this.coordinates, [pointSize, 0]));
                break;
            }
            case "square": {
                const adjustSize = Maths.sqrt(Maths.PI * pointSize ** 2) / 2;
                gg.moveTo(...Vector2.add(this.coordinates, [-adjustSize, -adjustSize]));
                gg.lineTo(...Vector2.add(this.coordinates, [-adjustSize, adjustSize]));
                gg.lineTo(...Vector2.add(this.coordinates, [adjustSize, adjustSize]));
                gg.lineTo(...Vector2.add(this.coordinates, [adjustSize, -adjustSize]));
                gg.close();
                break;
            }
            case "diamond": {
                gg.moveTo(...Vector2.add(this.coordinates, [0, -pointSize]));
                gg.lineTo(...Vector2.add(this.coordinates, [-pointSize, 0]));
                gg.lineTo(...Vector2.add(this.coordinates, [0, pointSize]));
                gg.lineTo(...Vector2.add(this.coordinates, [pointSize, 0]));
                gg.close();
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

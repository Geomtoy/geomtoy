import { Geometry, GeometryGraphic, Graphics, Shape, ViewportDescriptor } from "@geomtoy/core";
import { Box } from "@geomtoy/util";
import ViewElement from "./ViewElement";

export default class Lasso extends Shape {
    constructor(public init = [0, 0] as [number, number], public term = [0, 0] as [number, number]) {
        super();
    }
    hit(interactables: ViewElement[]) {
        const lassoBox = Box.from(this.init, this.term);
        const filtered = [] as ViewElement[];
        for (const ve of interactables) {
            if (ve.shape instanceof Geometry) {
                const box = ve.shape.getBoundingBox();
                if (Box.collide(box, lassoBox)) {
                    filtered.push(ve);
                }
            }
        }
        return filtered;
    }
    move(deltaX: number, deltaY: number) {
        this.init[0] += deltaX;
        this.init[1] += deltaY;
        this.term[0] += deltaX;
        this.term[1] += deltaY;
        return this;
    }
    clone() {
        return new Lasso(this.init, this.term);
    }
    getGraphics(viewport: ViewportDescriptor) {
        const g = new Graphics();
        const gg = new GeometryGraphic();
        const [initX, initY] = this.init;
        const [termX, termY] = this.term;

        gg.moveTo(initX, initY);
        gg.lineTo(initX, termY);
        gg.lineTo(termX, termY);
        gg.lineTo(termX, initY);
        gg.close();
        g.append(gg);
        return g;
    }
}

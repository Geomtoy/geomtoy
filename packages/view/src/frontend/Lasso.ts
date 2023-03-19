import { Geometry, GeometryGraphic, Graphics, Shape, ViewportDescriptor } from "@geomtoy/core";
import { Box } from "@geomtoy/util";
import { ViewElementInteractMode } from "../types";
import ViewElement from "./ViewElement";

export default class Lasso extends Shape {
    constructor(public init = [0, 0] as [number, number], public term = [0, 0] as [number, number]) {
        super();
    }
    hit(interactables: ViewElement[]) {
        const lassoBox = Box.from(this.init, this.term);
        const filtered = [] as ViewElement[];
        for (const ve of interactables.filter(el => el.interactMode === ViewElementInteractMode.Activation)) {
            if (ve.shape instanceof Geometry) {
                let box = ve.shape.getBoundingBox();
                // todo find a better way
                const halfStroke = ve.style().strokeWidth / 2;
                box[0] -= halfStroke;
                box[1] -= halfStroke;
                box[2] += halfStroke * 2;
                box[3] += halfStroke * 2;

                if (Box.contain(lassoBox, box)) {
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

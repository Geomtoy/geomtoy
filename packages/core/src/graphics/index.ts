import type GeometryGraphic from "./GeometryGraphic";
import type ImageGraphic from "./ImageGraphic";
import type TextGraphic from "./TextGraphic";

export default class Graphics {
    graphics: (GeometryGraphic | ImageGraphic | TextGraphic)[] = [];

    constructor(...graphics: (GeometryGraphic | ImageGraphic | TextGraphic)[]) {
        this.graphics = graphics;
    }

    append(graphic: GeometryGraphic | ImageGraphic | TextGraphic) {
        this.graphics.push(graphic);
    }

    prepend(graphic: GeometryGraphic | ImageGraphic | TextGraphic) {
        this.graphics.unshift(graphic);
    }

    concat(graphics: Graphics) {
        this.graphics = [...this.graphics, ...graphics.graphics];
    }

    clear() {
        this.graphics = [];
    }
}
